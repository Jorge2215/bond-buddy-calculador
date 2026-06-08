// Bond Calculator Engine - supports Argentine Bonares, Globales, Lecaps & Boncaps

import { BondDefinition, BOND_DEFINITIONS } from './bondSchedules';

export interface CashFlowRow {
  period: number;
  date: Date;
  principal: number;
  amortPayment: number;
  residualValue: number;
  amortPercent: number;
  interestPayment: number;
  daysFromSettlement: number;
  cashFlow: number;
  couponDays: number;
  accruedDays: number;
  pvAtMarket: number;
  durationComponent: number;
  convexityComponent: number;
  pvAtPricingTIR: number;
  couponRate: number;
}

export interface BondIndicators {
  tir: number;
  tem: number;
  tna180_360: number;
  currentYield: number;
  macaulayDuration: number;
  modifiedDuration: number;
  technicalValue: number;
  parity: number;
  residualValue: number;
  nextCouponDate: Date;
  coupon: number;
  amortization: number;
  maturityDate: Date;
  accruedInterest: number;
  dirtyPrice: number;
  cleanPrice: number;
  currentCouponRate: number;
  temEmision?: number;
}

export interface PricingByRate {
  tir: number;
  tna180_360: number;
  dirtyPrice: number;
  cleanPrice: number;
  parity: number;
}

export interface PricingByPrice {
  dirtyPrice: number;
  tir: number;
  tna180_360: number;
}

// Days360 (30/360 convention)
function days360(startDate: Date, endDate: Date): number {
  let d1 = startDate.getDate();
  const m1 = startDate.getMonth() + 1;
  const y1 = startDate.getFullYear();
  let d2 = endDate.getDate();
  const m2 = endDate.getMonth() + 1;
  const y2 = endDate.getFullYear();
  if (d1 === 31) d1 = 30;
  if (d2 === 31 && d1 >= 30) d2 = 30;
  return (y2 - y1) * 360 + (m2 - m1) * 30 + (d2 - d1);
}

function daysDiff(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function nominal(effectiveRate: number, m: number): number {
  return m * (Math.pow(1 + effectiveRate, 1 / m) - 1);
}

// XIRR via Newton's method
export function xirr(cashFlows: number[], dates: Date[], guess = 0.1): number {
  const maxIter = 200;
  const tol = 1e-10;
  const d0 = dates[0].getTime();
  const yf = dates.map(d => (d.getTime() - d0) / (365.25 * 24 * 3600000));
  let rate = guess;
  for (let i = 0; i < maxIter; i++) {
    let npv = 0, dnpv = 0;
    for (let j = 0; j < cashFlows.length; j++) {
      const den = Math.pow(1 + rate, yf[j]);
      if (!isFinite(den) || den === 0) break;
      npv += cashFlows[j] / den;
      dnpv -= yf[j] * cashFlows[j] / (den * (1 + rate));
    }
    if (Math.abs(dnpv) < 1e-20) break;
    const nr = rate - npv / dnpv;
    if (Math.abs(nr - rate) < tol) return nr;
    rate = nr;
  }
  return rate;
}

export function calculateBond(
  bondId: string,
  settlementDate: Date,
  dirtyPrice: number,
  pricingTIR: number
): {
  cashFlows: CashFlowRow[];
  indicators: BondIndicators;
  pricingByRate: PricingByRate;
  pricingByPrice: PricingByPrice;
} {
  const bond = BOND_DEFINITIONS[bondId];
  if (!bond) throw new Error(`Bond ${bondId} not found`);

  const { schedule, frequency, yearConvention: yearConv, initialPrincipal, temEmision } = bond;
  const isCompound = temEmision !== undefined && temEmision > 0;
  const rows: CashFlowRow[] = [];

  for (let i = 1; i < schedule.length; i++) {
    const prev = schedule[i - 1];
    const curr = schedule[i];

    const principalBefore = curr.principal + curr.amortization;
    const principalAfter = curr.principal;

    const couponDays = days360(prev.date, curr.date);

    // Interest calculation: compound for Lecaps/Boncaps, simple for USD bonds
    let interest: number;
    if (isCompound) {
      interest = principalBefore * (Math.pow(1 + temEmision, couponDays / 30) - 1);
    } else {
      interest = (couponDays / yearConv) * curr.couponRate * principalBefore;
    }

    const dfs = daysDiff(settlementDate, curr.date);
    const isFuture = dfs > 0;
    const cashFlow = isFuture ? interest + curr.amortization : 0;

    const accruedDays = (settlementDate > prev.date && settlementDate <= curr.date)
      ? daysDiff(prev.date, settlementDate)
      : 0;

    rows.push({
      period: i,
      date: curr.date,
      principal: principalAfter,
      amortPayment: curr.amortization,
      residualValue: isFuture ? curr.amortization / initialPrincipal : 0,
      amortPercent: principalBefore > 0 ? curr.amortization / principalBefore : 0,
      interestPayment: interest,
      daysFromSettlement: Math.max(dfs, 0),
      cashFlow,
      couponDays,
      accruedDays,
      pvAtMarket: 0,
      durationComponent: 0,
      convexityComponent: 0,
      pvAtPricingTIR: 0,
      couponRate: curr.couponRate,
    });
  }

  // TIR from dirty price (XIRR)
  const futureCFs = rows.filter(r => r.cashFlow > 0);
  const xirrCFs = [-dirtyPrice, ...futureCFs.map(r => r.cashFlow)];
  const xirrDates = [settlementDate, ...futureCFs.map(r => r.date)];
  let tir = 0.08;
  try { tir = xirr(xirrCFs, xirrDates, 0.08); } catch { tir = 0.08; }
  if (!isFinite(tir) || isNaN(tir)) tir = 0.08;

  // TEM from TIR: (1+TIR)^(1/12) - 1
  const tem = Math.pow(1 + tir, 1 / 12) - 1;

  // PV at market TIR
  let totalPV = 0, totalDur = 0, totalConv = 0;
  for (const row of rows) {
    if (row.cashFlow > 0 && row.daysFromSettlement > 0) {
      const yf = row.daysFromSettlement / 365;
      row.pvAtMarket = row.cashFlow / Math.pow(1 + tir, yf);
      row.durationComponent = row.pvAtMarket * yf;
      row.convexityComponent = (row.cashFlow * yf * (yf + 1)) / Math.pow(1 + tir, yf + 2);
      totalPV += row.pvAtMarket;
      totalDur += row.durationComponent;
      totalConv += row.convexityComponent;
    }
  }

  // PV at pricing TIR
  let totalPVPricing = 0;
  for (const row of rows) {
    if (row.cashFlow > 0 && row.daysFromSettlement > 0) {
      const yf = row.daysFromSettlement / 365;
      row.pvAtPricingTIR = row.cashFlow / Math.pow(1 + pricingTIR, yf);
      totalPVPricing += row.pvAtPricingTIR;
    }
  }

  // Accrued interest - compound for Lecaps/Boncaps
  let computedAccrued = 0;
  for (const row of rows) {
    if (row.accruedDays > 0) {
      if (isCompound) {
        const principalBefore = row.principal + row.amortPayment;
        computedAccrued = principalBefore * (Math.pow(1 + temEmision, row.accruedDays / 30) - 1);
      } else {
        computedAccrued = row.interestPayment * (row.accruedDays / row.couponDays);
      }
      break;
    }
  }

  const valorResidual = rows
    .filter(r => r.cashFlow > 0)
    .reduce((sum, r) => sum + r.amortPayment, 0) / initialPrincipal;

  const cleanPrice = dirtyPrice - computedAccrued;
  const technicalValue = initialPrincipal * valorResidual + computedAccrued;
  const parity = dirtyPrice / technicalValue;
  const freqForNominal = isCompound ? 2 : frequency;
  const tna = nominal(tir, freqForNominal);
  const macaulay = totalPV > 0 ? totalDur / totalPV : 0;
  const modifiedDuration = macaulay / (1 + tir / freqForNominal);

  const nextCoupon = rows.find(r => r.date > settlementDate);
  const nextCouponInterest = nextCoupon ? nextCoupon.interestPayment : 0;
  const nextCouponAmort = nextCoupon ? nextCoupon.amortPayment : 0;
  const currentYield = cleanPrice > 0 ? (nextCouponInterest / cleanPrice) * 100 : 0;

  const currentPeriod = rows.find(r => r.date > settlementDate);
  const currentCouponRate = currentPeriod ? currentPeriod.couponRate : 0;

  // Pricing by rate
  const pricingDirtyPrice = totalPVPricing;
  const pricingCleanPrice = pricingDirtyPrice - computedAccrued;
  const pricingTNA = nominal(pricingTIR, freqForNominal);
  const pricingParity = pricingDirtyPrice / technicalValue;

  const pricingByPriceTNA = nominal(tir, freqForNominal);

  return {
    cashFlows: rows,
    indicators: {
      tir, tem, tna180_360: tna, currentYield,
      macaulayDuration: macaulay, modifiedDuration,
      technicalValue, parity, residualValue: valorResidual,
      nextCouponDate: nextCoupon?.date || new Date(),
      coupon: nextCouponInterest,
      amortization: nextCouponAmort,
      maturityDate: bond.maturityDate,
      accruedInterest: computedAccrued,
      dirtyPrice, cleanPrice,
      currentCouponRate,
      temEmision,
    },
    pricingByRate: {
      tir: pricingTIR, tna180_360: pricingTNA,
      dirtyPrice: pricingDirtyPrice, cleanPrice: pricingCleanPrice,
      parity: pricingParity,
    },
    pricingByPrice: {
      dirtyPrice, tir, tna180_360: pricingByPriceTNA,
    },
  };
}
