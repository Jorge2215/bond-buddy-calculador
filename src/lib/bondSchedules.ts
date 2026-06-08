// Bond schedule definitions for Argentine Bonares, Globales, Lecaps & Boncaps

export interface CashFlowPeriod {
  date: Date;
  principal: number;
  amortization: number;
  couponRate: number;
}

export interface BondDefinition {
  name: string;
  isin: string;
  frequency: number;
  yearConvention: number;
  dayConvention: '30/360';
  currency: 'USD' | 'ARS';
  maturityDate: Date;
  initialPrincipal: number;
  tickerMEP: string;
  tickerCCL: string;
  tickerARS: string;
  category: 'Bonares USD' | 'Globales USD' | 'Lecaps' | 'Boncaps' | 'Bopreales USD' | 'Corporativos Oil & Gas';
  schedule: CashFlowPeriod[];
  temEmision?: number; // Monthly effective rate for Lecaps/Boncaps
}

function s(y: number, m: number, d: number): Date {
  return new Date(y, m - 1, d);
}

// ── Shared schedule templates ──────────────────────────────────────

const SCHED_29: CashFlowPeriod[] = [
  { date: s(2020, 9, 4), principal: 100, amortization: 0, couponRate: 0.01 },
  { date: s(2021, 7, 9), principal: 100, amortization: 0, couponRate: 0.01 },
  { date: s(2022, 1, 9), principal: 100, amortization: 0, couponRate: 0.01 },
  { date: s(2022, 7, 9), principal: 100, amortization: 0, couponRate: 0.01 },
  { date: s(2023, 1, 9), principal: 100, amortization: 0, couponRate: 0.01 },
  { date: s(2023, 7, 9), principal: 100, amortization: 0, couponRate: 0.01 },
  { date: s(2024, 1, 9), principal: 100, amortization: 0, couponRate: 0.01 },
  { date: s(2024, 7, 9), principal: 100, amortization: 0, couponRate: 0.01 },
  { date: s(2025, 1, 9), principal: 90, amortization: 10, couponRate: 0.01 },
  { date: s(2025, 7, 9), principal: 80, amortization: 10, couponRate: 0.01 },
  { date: s(2026, 1, 9), principal: 70, amortization: 10, couponRate: 0.01 },
  { date: s(2026, 7, 9), principal: 60, amortization: 10, couponRate: 0.01 },
  { date: s(2027, 1, 9), principal: 50, amortization: 10, couponRate: 0.01 },
  { date: s(2027, 7, 9), principal: 40, amortization: 10, couponRate: 0.01 },
  { date: s(2028, 1, 9), principal: 30, amortization: 10, couponRate: 0.01 },
  { date: s(2028, 7, 9), principal: 20, amortization: 10, couponRate: 0.01 },
  { date: s(2029, 1, 9), principal: 10, amortization: 10, couponRate: 0.01 },
  { date: s(2029, 7, 9), principal: 0, amortization: 10, couponRate: 0.01 },
];

const SCHED_30: CashFlowPeriod[] = [
  { date: s(2020, 9, 4), principal: 100, amortization: 0, couponRate: 0.00125 },
  { date: s(2021, 7, 9), principal: 100, amortization: 0, couponRate: 0.00125 },
  { date: s(2022, 1, 9), principal: 100, amortization: 0, couponRate: 0.005 },
  { date: s(2022, 7, 9), principal: 100, amortization: 0, couponRate: 0.005 },
  { date: s(2023, 1, 9), principal: 100, amortization: 0, couponRate: 0.005 },
  { date: s(2023, 7, 9), principal: 100, amortization: 0, couponRate: 0.005 },
  { date: s(2024, 1, 9), principal: 100, amortization: 0, couponRate: 0.0075 },
  { date: s(2024, 7, 9), principal: 96, amortization: 4, couponRate: 0.0075 },
  { date: s(2025, 1, 9), principal: 88, amortization: 8, couponRate: 0.0075 },
  { date: s(2025, 7, 9), principal: 80, amortization: 8, couponRate: 0.0075 },
  { date: s(2026, 1, 9), principal: 72, amortization: 8, couponRate: 0.0075 },
  { date: s(2026, 7, 9), principal: 64, amortization: 8, couponRate: 0.0075 },
  { date: s(2027, 1, 9), principal: 56, amortization: 8, couponRate: 0.0075 },
  { date: s(2027, 7, 9), principal: 48, amortization: 8, couponRate: 0.0075 },
  { date: s(2028, 1, 9), principal: 40, amortization: 8, couponRate: 0.0175 },
  { date: s(2028, 7, 9), principal: 32, amortization: 8, couponRate: 0.0175 },
  { date: s(2029, 1, 9), principal: 24, amortization: 8, couponRate: 0.0175 },
  { date: s(2029, 7, 9), principal: 16, amortization: 8, couponRate: 0.0175 },
  { date: s(2030, 1, 9), principal: 8, amortization: 8, couponRate: 0.0175 },
  { date: s(2030, 7, 9), principal: 0, amortization: 8, couponRate: 0.0175 },
];

const SCHED_38: CashFlowPeriod[] = [
  { date: s(2020, 9, 4), principal: 100, amortization: 0, couponRate: 0.00125 },
  { date: s(2021, 7, 9), principal: 100, amortization: 0, couponRate: 0.00125 },
  { date: s(2022, 1, 9), principal: 100, amortization: 0, couponRate: 0.02 },
  { date: s(2022, 7, 9), principal: 100, amortization: 0, couponRate: 0.02 },
  { date: s(2023, 1, 9), principal: 100, amortization: 0, couponRate: 0.03875 },
  { date: s(2023, 7, 9), principal: 100, amortization: 0, couponRate: 0.03875 },
  { date: s(2024, 1, 9), principal: 100, amortization: 0, couponRate: 0.0425 },
  { date: s(2024, 7, 9), principal: 100, amortization: 0, couponRate: 0.0425 },
  { date: s(2025, 1, 9), principal: 100, amortization: 0, couponRate: 0.05 },
  { date: s(2025, 7, 9), principal: 100, amortization: 0, couponRate: 0.05 },
  { date: s(2026, 1, 9), principal: 100, amortization: 0, couponRate: 0.05 },
  { date: s(2026, 7, 9), principal: 100, amortization: 0, couponRate: 0.05 },
  { date: s(2027, 1, 9), principal: 100, amortization: 0, couponRate: 0.05 },
  { date: s(2027, 7, 9), principal: 95.45, amortization: 4.55, couponRate: 0.05 },
  { date: s(2028, 1, 9), principal: 90.91, amortization: 4.55, couponRate: 0.05 },
  { date: s(2028, 7, 9), principal: 86.36, amortization: 4.55, couponRate: 0.05 },
  { date: s(2029, 1, 9), principal: 81.82, amortization: 4.55, couponRate: 0.05 },
  { date: s(2029, 7, 9), principal: 77.27, amortization: 4.55, couponRate: 0.05 },
  { date: s(2030, 1, 9), principal: 72.73, amortization: 4.55, couponRate: 0.05 },
  { date: s(2030, 7, 9), principal: 68.18, amortization: 4.55, couponRate: 0.05 },
  { date: s(2031, 1, 9), principal: 63.64, amortization: 4.55, couponRate: 0.05 },
  { date: s(2031, 7, 9), principal: 59.09, amortization: 4.55, couponRate: 0.05 },
  { date: s(2032, 1, 9), principal: 54.55, amortization: 4.55, couponRate: 0.05 },
  { date: s(2032, 7, 9), principal: 50.00, amortization: 4.55, couponRate: 0.05 },
  { date: s(2033, 1, 9), principal: 45.45, amortization: 4.55, couponRate: 0.05 },
  { date: s(2033, 7, 9), principal: 40.91, amortization: 4.55, couponRate: 0.05 },
  { date: s(2034, 1, 9), principal: 36.36, amortization: 4.55, couponRate: 0.05 },
  { date: s(2034, 7, 9), principal: 31.82, amortization: 4.55, couponRate: 0.05 },
  { date: s(2035, 1, 9), principal: 27.27, amortization: 4.55, couponRate: 0.05 },
  { date: s(2035, 7, 9), principal: 22.73, amortization: 4.55, couponRate: 0.05 },
  { date: s(2036, 1, 9), principal: 18.18, amortization: 4.55, couponRate: 0.05 },
  { date: s(2036, 7, 9), principal: 13.64, amortization: 4.55, couponRate: 0.05 },
  { date: s(2037, 1, 9), principal: 9.09, amortization: 4.55, couponRate: 0.05 },
  { date: s(2037, 7, 9), principal: 4.55, amortization: 4.55, couponRate: 0.05 },
  { date: s(2038, 1, 9), principal: 0, amortization: 4.55, couponRate: 0.05 },
];

const SCHED_35: CashFlowPeriod[] = [
  { date: s(2020, 9, 4), principal: 100, amortization: 0, couponRate: 0.00125 },
  { date: s(2021, 7, 9), principal: 100, amortization: 0, couponRate: 0.00125 },
  { date: s(2022, 1, 9), principal: 100, amortization: 0, couponRate: 0.01125 },
  { date: s(2022, 7, 9), principal: 100, amortization: 0, couponRate: 0.01125 },
  { date: s(2023, 1, 9), principal: 100, amortization: 0, couponRate: 0.015 },
  { date: s(2023, 7, 9), principal: 100, amortization: 0, couponRate: 0.015 },
  { date: s(2024, 1, 9), principal: 100, amortization: 0, couponRate: 0.03625 },
  { date: s(2024, 7, 9), principal: 100, amortization: 0, couponRate: 0.03625 },
  { date: s(2025, 1, 9), principal: 100, amortization: 0, couponRate: 0.04125 },
  { date: s(2025, 7, 9), principal: 100, amortization: 0, couponRate: 0.04125 },
  { date: s(2026, 1, 9), principal: 100, amortization: 0, couponRate: 0.04125 },
  { date: s(2026, 7, 9), principal: 100, amortization: 0, couponRate: 0.04125 },
  { date: s(2027, 1, 9), principal: 100, amortization: 0, couponRate: 0.04125 },
  { date: s(2027, 7, 9), principal: 100, amortization: 0, couponRate: 0.04125 },
  { date: s(2028, 1, 9), principal: 100, amortization: 0, couponRate: 0.0475 },
  { date: s(2028, 7, 9), principal: 100, amortization: 0, couponRate: 0.0475 },
  { date: s(2029, 1, 9), principal: 100, amortization: 0, couponRate: 0.05 },
  { date: s(2029, 7, 9), principal: 100, amortization: 0, couponRate: 0.05 },
  { date: s(2030, 1, 9), principal: 100, amortization: 0, couponRate: 0.05 },
  { date: s(2030, 7, 9), principal: 100, amortization: 0, couponRate: 0.05 },
  { date: s(2031, 1, 9), principal: 90, amortization: 10, couponRate: 0.05 },
  { date: s(2031, 7, 9), principal: 80, amortization: 10, couponRate: 0.05 },
  { date: s(2032, 1, 9), principal: 70, amortization: 10, couponRate: 0.05 },
  { date: s(2032, 7, 9), principal: 60, amortization: 10, couponRate: 0.05 },
  { date: s(2033, 1, 9), principal: 50, amortization: 10, couponRate: 0.05 },
  { date: s(2033, 7, 9), principal: 40, amortization: 10, couponRate: 0.05 },
  { date: s(2034, 1, 9), principal: 30, amortization: 10, couponRate: 0.05 },
  { date: s(2034, 7, 9), principal: 20, amortization: 10, couponRate: 0.05 },
  { date: s(2035, 1, 9), principal: 10, amortization: 10, couponRate: 0.05 },
  { date: s(2035, 7, 9), principal: 0, amortization: 10, couponRate: 0.05 },
];

const SCHED_41: CashFlowPeriod[] = [
  { date: s(2020, 9, 4), principal: 100, amortization: 0, couponRate: 0.00125 },
  { date: s(2021, 7, 9), principal: 100, amortization: 0, couponRate: 0.00125 },
  { date: s(2022, 1, 9), principal: 100, amortization: 0, couponRate: 0.025 },
  { date: s(2022, 7, 9), principal: 100, amortization: 0, couponRate: 0.025 },
  { date: s(2023, 1, 9), principal: 100, amortization: 0, couponRate: 0.035 },
  { date: s(2023, 7, 9), principal: 100, amortization: 0, couponRate: 0.035 },
  { date: s(2024, 1, 9), principal: 100, amortization: 0, couponRate: 0.035 },
  { date: s(2024, 7, 9), principal: 100, amortization: 0, couponRate: 0.035 },
  { date: s(2025, 1, 9), principal: 100, amortization: 0, couponRate: 0.035 },
  { date: s(2025, 7, 9), principal: 100, amortization: 0, couponRate: 0.035 },
  { date: s(2026, 1, 9), principal: 100, amortization: 0, couponRate: 0.035 },
  { date: s(2026, 7, 9), principal: 100, amortization: 0, couponRate: 0.035 },
  { date: s(2027, 1, 9), principal: 100, amortization: 0, couponRate: 0.035 },
  { date: s(2027, 7, 9), principal: 100, amortization: 0, couponRate: 0.035 },
  { date: s(2028, 1, 9), principal: 96.43, amortization: 3.57, couponRate: 0.035 },
  { date: s(2028, 7, 9), principal: 92.86, amortization: 3.57, couponRate: 0.035 },
  { date: s(2029, 1, 9), principal: 89.29, amortization: 3.57, couponRate: 0.035 },
  { date: s(2029, 7, 9), principal: 85.71, amortization: 3.57, couponRate: 0.035 },
  { date: s(2030, 1, 9), principal: 82.14, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2030, 7, 9), principal: 78.57, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2031, 1, 9), principal: 75.00, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2031, 7, 9), principal: 71.43, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2032, 1, 9), principal: 67.86, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2032, 7, 9), principal: 64.29, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2033, 1, 9), principal: 60.71, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2033, 7, 9), principal: 57.14, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2034, 1, 9), principal: 53.57, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2034, 7, 9), principal: 50.00, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2035, 1, 9), principal: 46.43, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2035, 7, 9), principal: 42.86, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2036, 1, 9), principal: 39.29, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2036, 7, 9), principal: 35.71, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2037, 1, 9), principal: 32.14, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2037, 7, 9), principal: 28.57, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2038, 1, 9), principal: 25.00, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2038, 7, 9), principal: 21.43, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2039, 1, 9), principal: 17.86, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2039, 7, 9), principal: 14.29, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2040, 1, 9), principal: 10.71, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2040, 7, 9), principal: 7.14, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2041, 1, 9), principal: 3.57, amortization: 3.57, couponRate: 0.04875 },
  { date: s(2041, 7, 9), principal: 0, amortization: 3.57, couponRate: 0.04875 },
];

const SCHED_AN29: CashFlowPeriod[] = [
  { date: s(2025, 12, 12), principal: 100, amortization: 0, couponRate: 0.065 },
  { date: s(2026, 5, 31), principal: 100, amortization: 0, couponRate: 0.065 },
  { date: s(2026, 11, 30), principal: 100, amortization: 0, couponRate: 0.065 },
  { date: s(2027, 5, 31), principal: 100, amortization: 0, couponRate: 0.065 },
  { date: s(2027, 11, 30), principal: 100, amortization: 0, couponRate: 0.065 },
  { date: s(2028, 5, 31), principal: 100, amortization: 0, couponRate: 0.065 },
  { date: s(2028, 11, 30), principal: 100, amortization: 0, couponRate: 0.065 },
  { date: s(2029, 5, 31), principal: 100, amortization: 0, couponRate: 0.065 },
  { date: s(2029, 11, 30), principal: 0, amortization: 100, couponRate: 0.065 },
];

const SCHED_AO27: CashFlowPeriod[] = [
  { date: s(2026, 2, 27), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 3, 31), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 4, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 5, 29), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 6, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 7, 31), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 8, 31), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 9, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 10, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 11, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 12, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 1, 29), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 2, 26), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 3, 31), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 4, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 5, 31), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 6, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 7, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 8, 31), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 9, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 10, 29), principal: 0, amortization: 100, couponRate: 0.06 },
];

const SCHED_AO28: CashFlowPeriod[] = [
  { date: s(2026, 3, 31), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 4, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 5, 29), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 6, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 7, 31), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 8, 31), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 9, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 10, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 11, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2026, 12, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 1, 29), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 2, 26), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 3, 31), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 4, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 5, 31), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 6, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 7, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 8, 31), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 9, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 10, 29), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 11, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2027, 12, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2028, 1, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2028, 2, 29), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2028, 3, 31), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2028, 4, 28), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2028, 5, 31), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2028, 6, 30), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2028, 7, 31), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2028, 8, 31), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2028, 9, 29), principal: 100, amortization: 0, couponRate: 0.06 },
  { date: s(2028, 10, 31), principal: 0, amortization: 100, couponRate: 0.06 },
];

// ── GD46 schedule ──────────────────────────────────────────────────
const SCHED_46: CashFlowPeriod[] = [
  { date: s(2020, 9, 4), principal: 100, amortization: 0, couponRate: 0.00125 },
  { date: s(2021, 7, 9), principal: 100, amortization: 0, couponRate: 0.00125 },
  { date: s(2022, 1, 9), principal: 100, amortization: 0, couponRate: 0.01125 },
  { date: s(2022, 7, 9), principal: 100, amortization: 0, couponRate: 0.01125 },
  { date: s(2023, 1, 9), principal: 100, amortization: 0, couponRate: 0.015 },
  { date: s(2023, 7, 9), principal: 100, amortization: 0, couponRate: 0.015 },
  { date: s(2024, 1, 9), principal: 100, amortization: 0, couponRate: 0.03625 },
  { date: s(2024, 7, 9), principal: 100, amortization: 0, couponRate: 0.03625 },
  { date: s(2025, 1, 9), principal: 97.73, amortization: 2.27, couponRate: 0.04125 },
  { date: s(2025, 7, 9), principal: 95.45, amortization: 2.27, couponRate: 0.04125 },
  { date: s(2026, 1, 9), principal: 93.18, amortization: 2.27, couponRate: 0.04125 },
  { date: s(2026, 7, 9), principal: 90.91, amortization: 2.27, couponRate: 0.04125 },
  { date: s(2027, 1, 9), principal: 88.64, amortization: 2.27, couponRate: 0.04125 },
  { date: s(2027, 7, 9), principal: 86.36, amortization: 2.27, couponRate: 0.04125 },
  { date: s(2028, 1, 9), principal: 84.09, amortization: 2.27, couponRate: 0.04375 },
  { date: s(2028, 7, 9), principal: 81.82, amortization: 2.27, couponRate: 0.04375 },
  { date: s(2029, 1, 9), principal: 79.55, amortization: 2.27, couponRate: 0.05 },
  { date: s(2029, 7, 9), principal: 77.27, amortization: 2.27, couponRate: 0.05 },
  { date: s(2030, 1, 9), principal: 75.00, amortization: 2.27, couponRate: 0.05 },
  { date: s(2030, 7, 9), principal: 72.73, amortization: 2.27, couponRate: 0.05 },
  { date: s(2031, 1, 9), principal: 70.45, amortization: 2.27, couponRate: 0.05 },
  { date: s(2031, 7, 9), principal: 68.18, amortization: 2.27, couponRate: 0.05 },
  { date: s(2032, 1, 9), principal: 65.91, amortization: 2.27, couponRate: 0.05 },
  { date: s(2032, 7, 9), principal: 63.64, amortization: 2.27, couponRate: 0.05 },
  { date: s(2033, 1, 9), principal: 61.36, amortization: 2.27, couponRate: 0.05 },
  { date: s(2033, 7, 9), principal: 59.09, amortization: 2.27, couponRate: 0.05 },
  { date: s(2034, 1, 9), principal: 56.82, amortization: 2.27, couponRate: 0.05 },
  { date: s(2034, 7, 9), principal: 54.55, amortization: 2.27, couponRate: 0.05 },
  { date: s(2035, 1, 9), principal: 52.27, amortization: 2.27, couponRate: 0.05 },
  { date: s(2035, 7, 9), principal: 50.00, amortization: 2.27, couponRate: 0.05 },
  { date: s(2036, 1, 9), principal: 47.73, amortization: 2.27, couponRate: 0.05 },
  { date: s(2036, 7, 9), principal: 45.45, amortization: 2.27, couponRate: 0.05 },
  { date: s(2037, 1, 9), principal: 43.18, amortization: 2.27, couponRate: 0.05 },
  { date: s(2037, 7, 9), principal: 40.91, amortization: 2.27, couponRate: 0.05 },
  { date: s(2038, 1, 9), principal: 38.64, amortization: 2.27, couponRate: 0.05 },
  { date: s(2038, 7, 9), principal: 36.36, amortization: 2.27, couponRate: 0.05 },
  { date: s(2039, 1, 9), principal: 34.09, amortization: 2.27, couponRate: 0.05 },
  { date: s(2039, 7, 9), principal: 31.82, amortization: 2.27, couponRate: 0.05 },
  { date: s(2040, 1, 9), principal: 29.55, amortization: 2.27, couponRate: 0.05 },
  { date: s(2040, 7, 9), principal: 27.27, amortization: 2.27, couponRate: 0.05 },
  { date: s(2041, 1, 9), principal: 25.00, amortization: 2.27, couponRate: 0.05 },
  { date: s(2041, 7, 9), principal: 22.73, amortization: 2.27, couponRate: 0.05 },
  { date: s(2042, 1, 9), principal: 20.45, amortization: 2.27, couponRate: 0.05 },
  { date: s(2042, 7, 9), principal: 18.18, amortization: 2.27, couponRate: 0.05 },
  { date: s(2043, 1, 9), principal: 15.91, amortization: 2.27, couponRate: 0.05 },
  { date: s(2043, 7, 9), principal: 13.64, amortization: 2.27, couponRate: 0.05 },
  { date: s(2044, 1, 9), principal: 11.36, amortization: 2.27, couponRate: 0.05 },
  { date: s(2044, 7, 9), principal: 9.09, amortization: 2.27, couponRate: 0.05 },
  { date: s(2045, 1, 9), principal: 6.82, amortization: 2.27, couponRate: 0.05 },
  { date: s(2045, 7, 9), principal: 4.55, amortization: 2.27, couponRate: 0.05 },
  { date: s(2046, 1, 9), principal: 2.27, amortization: 2.27, couponRate: 0.05 },
  { date: s(2046, 7, 9), principal: 0, amortization: 2.27, couponRate: 0.05 },
];

// ── Lecaps & Boncaps schedules (single-period, TEM-based) ─────────

// S17A6 - Lecap, TEM 2.40%, maturity Apr 17 2026
const SCHED_S17A6: CashFlowPeriod[] = [
  { date: s(2025, 12, 15), principal: 100, amortization: 0, couponRate: 0.024 },
  { date: s(2026, 4, 17), principal: 0, amortization: 100, couponRate: 0.024 },
];

// S30A6 - Lecap, TEM 3.53%, maturity Apr 30 2026
const SCHED_S30A6: CashFlowPeriod[] = [
  { date: s(2025, 9, 30), principal: 100, amortization: 0, couponRate: 0.0353 },
  { date: s(2026, 4, 30), principal: 0, amortization: 100, couponRate: 0.0353 },
];

// S15Y6 - Lecap, TEM 2.60%, maturity May 15 2026
const SCHED_S15Y6: CashFlowPeriod[] = [
  { date: s(2026, 3, 16), principal: 100, amortization: 0, couponRate: 0.026 },
  { date: s(2026, 5, 15), principal: 0, amortization: 100, couponRate: 0.026 },
];

// S29Y6 - Lecap, TEM 2.35%, maturity May 29 2026
const SCHED_S29Y6: CashFlowPeriod[] = [
  { date: s(2025, 5, 30), principal: 100, amortization: 0, couponRate: 0.0235 },
  { date: s(2026, 5, 29), principal: 0, amortization: 100, couponRate: 0.0235 },
];

// T30J6 - Boncap, TEM 2.15%, maturity Jun 30 2026
const SCHED_T30J6: CashFlowPeriod[] = [
  { date: s(2025, 1, 17), principal: 100, amortization: 0, couponRate: 0.0215 },
  { date: s(2026, 6, 30), principal: 0, amortization: 100, couponRate: 0.0215 },
];

// S17L6 - Lecap, TEM 2.16%, maturity Jul 17 2026
const SCHED_S17L6: CashFlowPeriod[] = [
  { date: s(2026, 3, 31), principal: 100, amortization: 0, couponRate: 0.0216 },
  { date: s(2026, 7, 17), principal: 0, amortization: 100, couponRate: 0.0216 },
];

// S31L6 - Lecap, TEM 2.75%, maturity Jul 31 2026
const SCHED_S31L6: CashFlowPeriod[] = [
  { date: s(2026, 1, 30), principal: 100, amortization: 0, couponRate: 0.0275 },
  { date: s(2026, 7, 31), principal: 0, amortization: 100, couponRate: 0.0275 },
];

// S31G6 - Lecap, TEM 2.50%, maturity Aug 31 2026
const SCHED_S31G6: CashFlowPeriod[] = [
  { date: s(2025, 11, 10), principal: 100, amortization: 0, couponRate: 0.025 },
  { date: s(2026, 8, 31), principal: 0, amortization: 100, couponRate: 0.025 },
];

// S30S6 - Lecap, TEM 2.53%, maturity Sep 30 2026
const SCHED_S30S6: CashFlowPeriod[] = [
  { date: s(2026, 3, 16), principal: 100, amortization: 0, couponRate: 0.0253 },
  { date: s(2026, 9, 30), principal: 0, amortization: 100, couponRate: 0.0253 },
];

// S30O6 - Lecap, TEM 2.55%, maturity Oct 30 2026
const SCHED_S30O6: CashFlowPeriod[] = [
  { date: s(2025, 10, 31), principal: 100, amortization: 0, couponRate: 0.0255 },
  { date: s(2026, 10, 30), principal: 0, amortization: 100, couponRate: 0.0255 },
];

// S30N6 - Lecap, TEM 2.30%, maturity Nov 30 2026
const SCHED_S30N6: CashFlowPeriod[] = [
  { date: s(2025, 12, 15), principal: 100, amortization: 0, couponRate: 0.023 },
  { date: s(2026, 11, 30), principal: 0, amortization: 100, couponRate: 0.023 },
];

// T15E7 - Boncap, TEM 2.05%, maturity Jan 15 2027
const SCHED_T15E7: CashFlowPeriod[] = [
  { date: s(2025, 1, 31), principal: 100, amortization: 0, couponRate: 0.0205 },
  { date: s(2027, 1, 15), principal: 0, amortization: 100, couponRate: 0.0205 },
];

// T30A7 - Boncap, TEM 2.55%, maturity Apr 30 2027
const SCHED_T30A7: CashFlowPeriod[] = [
  { date: s(2025, 10, 31), principal: 100, amortization: 0, couponRate: 0.0255 },
  { date: s(2027, 4, 30), principal: 0, amortization: 100, couponRate: 0.0255 },
];

// T31Y7 - Boncap, TEM 2.40%, maturity May 31 2027
const SCHED_T31Y7: CashFlowPeriod[] = [
  { date: s(2025, 12, 15), principal: 100, amortization: 0, couponRate: 0.024 },
  { date: s(2027, 5, 31), principal: 0, amortization: 100, couponRate: 0.024 },
];

// T30J7 - Boncap, TEM 2.58%, maturity Jun 30 2027
const SCHED_T30J7: CashFlowPeriod[] = [
  { date: s(2026, 1, 16), principal: 100, amortization: 0, couponRate: 0.0258 },
  { date: s(2027, 6, 30), principal: 0, amortization: 100, couponRate: 0.0258 },
];

// ── Bond Definitions ───────────────────────────────────────────────


// ── Bopreales schedules ────────────────────────────────────────────

// BPOA7, BPOB7, BPOC7, BPOD7 — emitidos 2024-01-05, cupón 5%, vto. 2027-10-31, 50%+50% amort
const SCHED_BPO7: CashFlowPeriod[] = [
  { date: s(2024, 1, 5),  principal: 100, amortization: 0,  couponRate: 0.05 },
  { date: s(2024, 10, 31), principal: 100, amortization: 0,  couponRate: 0.05 },
  { date: s(2025, 4, 30), principal: 100, amortization: 0,  couponRate: 0.05 },
  { date: s(2025, 10, 31), principal: 100, amortization: 0,  couponRate: 0.05 },
  { date: s(2026, 4, 30), principal: 100, amortization: 0,  couponRate: 0.05 },
  { date: s(2026, 10, 31), principal: 100, amortization: 0,  couponRate: 0.05 },
  { date: s(2027, 4, 30), principal: 50,  amortization: 50, couponRate: 0.05 },
  { date: s(2027, 10, 31), principal: 0,   amortization: 50, couponRate: 0.05 },
];

// BPOA8, BPOB8 — emitidos 2025-06-24, cupón 3%, vto. 2028-10-31, bullet 100% al vencimiento
const SCHED_BPO8: CashFlowPeriod[] = [
  { date: s(2025, 6, 24), principal: 100, amortization: 0,   couponRate: 0.03 },
  { date: s(2025, 10, 31), principal: 100, amortization: 0,   couponRate: 0.03 },
  { date: s(2026, 4, 30), principal: 100, amortization: 0,   couponRate: 0.03 },
  { date: s(2026, 10, 31), principal: 100, amortization: 0,   couponRate: 0.03 },
  { date: s(2027, 4, 30), principal: 100, amortization: 0,   couponRate: 0.03 },
  { date: s(2027, 10, 31), principal: 100, amortization: 0,   couponRate: 0.03 },
  { date: s(2028, 4, 30), principal: 100, amortization: 0,   couponRate: 0.03 },
  { date: s(2028, 10, 31), principal: 0,   amortization: 100, couponRate: 0.03 },
];

// ── Corporativos Oil & Gas Argentina (Ley NY) schedules ────────────

// YCAMO (YPF) — cupón 6.9500%, vto 2027-07-21
const SCHED_YCAMO: CashFlowPeriod[] = [
  { date: s(2026, 1, 21), principal: 100.0, amortization: 0, couponRate: 0.0695 },
  { date: s(2026, 7, 21), principal: 100.0, amortization: 0.0, couponRate: 0.0695 },
  { date: s(2027, 1, 21), principal: 100.0, amortization: 0.0, couponRate: 0.0695 },
  { date: s(2027, 7, 21), principal: 0.0, amortization: 100.0, couponRate: 0.0695 },
];

// YMC1O (YPF) — cupón 8.5000%, vto 2029-06-27
const SCHED_YMC1O: CashFlowPeriod[] = [
  { date: s(2019, 6, 27), principal: 100.0, amortization: 0, couponRate: 0.085 },
  { date: s(2019, 12, 27), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2020, 6, 29), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2020, 12, 28), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2021, 6, 28), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2021, 12, 27), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2022, 6, 27), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2022, 12, 27), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2023, 6, 27), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2023, 12, 27), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2024, 6, 27), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2024, 12, 27), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2025, 6, 27), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2025, 12, 29), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2026, 6, 29), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2026, 12, 28), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2027, 6, 28), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2027, 12, 27), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2028, 6, 27), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2028, 12, 27), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2029, 6, 27), principal: 0.0, amortization: 100.0, couponRate: 0.085 },
];

// YMCUO (YPF) — cupón 9.5000%, vto 2031-01-17
const SCHED_YMCUO: CashFlowPeriod[] = [
  { date: s(2019, 6, 27), principal: 100.0, amortization: 0, couponRate: 0.095 },
  { date: s(2024, 7, 17), principal: 100.0, amortization: 0.0, couponRate: 0.095 },
  { date: s(2025, 1, 17), principal: 100.0, amortization: 0.0, couponRate: 0.095 },
  { date: s(2025, 7, 17), principal: 100.0, amortization: 0.0, couponRate: 0.095 },
  { date: s(2026, 1, 17), principal: 100.0, amortization: 0.0, couponRate: 0.095 },
  { date: s(2026, 7, 17), principal: 90.0, amortization: 10.0, couponRate: 0.095 },
  { date: s(2027, 1, 17), principal: 80.0, amortization: 10.0, couponRate: 0.095 },
  { date: s(2027, 7, 17), principal: 70.0, amortization: 10.0, couponRate: 0.095 },
  { date: s(2028, 1, 17), principal: 60.0, amortization: 10.0, couponRate: 0.095 },
  { date: s(2028, 7, 17), principal: 50.0, amortization: 10.0, couponRate: 0.095 },
  { date: s(2029, 1, 17), principal: 40.0, amortization: 10.0, couponRate: 0.095 },
  { date: s(2029, 7, 17), principal: 30.0, amortization: 10.0, couponRate: 0.095 },
  { date: s(2030, 1, 17), principal: 20.0, amortization: 10.0, couponRate: 0.095 },
  { date: s(2030, 7, 17), principal: 10.0, amortization: 10.0, couponRate: 0.095 },
  { date: s(2031, 1, 17), principal: 0.0, amortization: 10.0, couponRate: 0.095 },
];

// YMCXO (YPF) — cupón 8.7500%, vto 2031-09-11
const SCHED_YMCXO: CashFlowPeriod[] = [
  { date: s(2024, 9, 11), principal: 100.0, amortization: 0, couponRate: 0.0875 },
  { date: s(2025, 3, 11), principal: 100.0, amortization: 0.0, couponRate: 0.0875 },
  { date: s(2025, 9, 11), principal: 100.0, amortization: 0.0, couponRate: 0.0875 },
  { date: s(2026, 3, 11), principal: 100.0, amortization: 0.0, couponRate: 0.0875 },
  { date: s(2026, 9, 11), principal: 100.0, amortization: 0.0, couponRate: 0.0875 },
  { date: s(2027, 3, 11), principal: 100.0, amortization: 0.0, couponRate: 0.0875 },
  { date: s(2027, 9, 11), principal: 100.0, amortization: 0.0, couponRate: 0.0875 },
  { date: s(2028, 3, 11), principal: 100.0, amortization: 0.0, couponRate: 0.0875 },
  { date: s(2028, 9, 11), principal: 100.0, amortization: 0.0, couponRate: 0.0875 },
  { date: s(2029, 3, 11), principal: 100.0, amortization: 0.0, couponRate: 0.0875 },
  { date: s(2029, 9, 11), principal: 80.0, amortization: 20.0, couponRate: 0.0875 },
  { date: s(2030, 3, 11), principal: 80.0, amortization: 0.0, couponRate: 0.0875 },
  { date: s(2030, 9, 11), principal: 60.0, amortization: 20.0, couponRate: 0.0875 },
  { date: s(2031, 3, 11), principal: 60.0, amortization: 0.0, couponRate: 0.0875 },
  { date: s(2031, 9, 11), principal: 0.0, amortization: 60.0, couponRate: 0.0875 },
];

// YMCJO (YPF) — cupón 7.0000%, vto 2033-09-30
const SCHED_YMCJO: CashFlowPeriod[] = [
  { date: s(2021, 2, 12), principal: 100.0, amortization: 0, couponRate: 0.07 },
  { date: s(2021, 3, 30), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2021, 9, 30), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2022, 3, 30), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2022, 9, 30), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2023, 3, 30), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2023, 10, 2), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2024, 4, 3), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2024, 9, 30), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2025, 3, 31), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2025, 9, 30), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2026, 3, 30), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2026, 9, 30), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2027, 3, 30), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2027, 9, 30), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2028, 3, 30), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2028, 10, 2), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2029, 3, 30), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2029, 10, 1), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2030, 4, 1), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2030, 9, 30), principal: 75.0, amortization: 25.0, couponRate: 0.07 },
  { date: s(2031, 3, 31), principal: 75.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2031, 9, 30), principal: 50.0, amortization: 25.0, couponRate: 0.07 },
  { date: s(2032, 3, 30), principal: 50.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2032, 9, 30), principal: 25.0, amortization: 25.0, couponRate: 0.07 },
  { date: s(2033, 3, 30), principal: 25.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2033, 9, 30), principal: 0.0, amortization: 25.0, couponRate: 0.07 },
];

// YM34O (YPF) — cupón 8.2500%, vto 2034-01-17
const SCHED_YM34O: CashFlowPeriod[] = [
  { date: s(2025, 1, 17), principal: 100.0, amortization: 0, couponRate: 0.0825 },
  { date: s(2025, 7, 17), principal: 100.0, amortization: 0.0, couponRate: 0.0825 },
  { date: s(2026, 1, 19), principal: 100.0, amortization: 0.0, couponRate: 0.0825 },
  { date: s(2026, 7, 17), principal: 100.0, amortization: 0.0, couponRate: 0.0825 },
  { date: s(2027, 1, 18), principal: 100.0, amortization: 0.0, couponRate: 0.0825 },
  { date: s(2027, 7, 19), principal: 100.0, amortization: 0.0, couponRate: 0.0825 },
  { date: s(2028, 1, 17), principal: 100.0, amortization: 0.0, couponRate: 0.0825 },
  { date: s(2028, 7, 17), principal: 100.0, amortization: 0.0, couponRate: 0.0825 },
  { date: s(2029, 1, 17), principal: 100.0, amortization: 0.0, couponRate: 0.0825 },
  { date: s(2029, 7, 17), principal: 100.0, amortization: 0.0, couponRate: 0.0825 },
  { date: s(2030, 1, 17), principal: 100.0, amortization: 0.0, couponRate: 0.0825 },
  { date: s(2030, 7, 17), principal: 100.0, amortization: 0.0, couponRate: 0.0825 },
  { date: s(2031, 1, 17), principal: 100.0, amortization: 0.0, couponRate: 0.0825 },
  { date: s(2031, 7, 17), principal: 100.0, amortization: 0.0, couponRate: 0.0825 },
  { date: s(2032, 1, 19), principal: 70.0, amortization: 30.0, couponRate: 0.0825 },
  { date: s(2032, 7, 19), principal: 70.0, amortization: 0.0, couponRate: 0.0825 },
  { date: s(2033, 1, 17), principal: 40.0, amortization: 30.0, couponRate: 0.0825 },
  { date: s(2033, 7, 18), principal: 40.0, amortization: 0.0, couponRate: 0.0825 },
  { date: s(2034, 1, 17), principal: 0.0, amortization: 40.0, couponRate: 0.0825 },
];

// YCANO (YPF) — cupón 7.0000%, vto 2047-12-15
const SCHED_YCANO: CashFlowPeriod[] = [
  { date: s(2017, 12, 15), principal: 100.0, amortization: 0, couponRate: 0.07 },
  { date: s(2018, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2018, 12, 17), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2019, 6, 18), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2019, 12, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2020, 6, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2020, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2021, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2021, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2022, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2022, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2023, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2023, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2024, 6, 18), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2024, 12, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2025, 6, 17), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2025, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2026, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2026, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2027, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2027, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2028, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2028, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2029, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2029, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2030, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2030, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2031, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2031, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2032, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2032, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2033, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2033, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2034, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2034, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2035, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2035, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2036, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2036, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2037, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2037, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2038, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2038, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2039, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2039, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2040, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2040, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2041, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2041, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2042, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2042, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2043, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2043, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2044, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2044, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2045, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2045, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2046, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2046, 12, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2047, 6, 15), principal: 100.0, amortization: 0.0, couponRate: 0.07 },
  { date: s(2047, 12, 15), principal: 0.0, amortization: 100.0, couponRate: 0.07 },
];

// MGCMO (PAMPA) — cupón 7.9500%, vto 2031-09-10
const SCHED_MGCMO: CashFlowPeriod[] = [
  { date: s(2024, 9, 10), principal: 100.0, amortization: 0, couponRate: 0.0795 },
  { date: s(2025, 3, 10), principal: 100.0, amortization: 0.0, couponRate: 0.0795 },
  { date: s(2025, 9, 10), principal: 100.0, amortization: 0.0, couponRate: 0.0795 },
  { date: s(2026, 3, 10), principal: 100.0, amortization: 0.0, couponRate: 0.0795 },
  { date: s(2026, 9, 10), principal: 100.0, amortization: 0.0, couponRate: 0.0795 },
  { date: s(2027, 3, 10), principal: 100.0, amortization: 0.0, couponRate: 0.0795 },
  { date: s(2027, 9, 10), principal: 100.0, amortization: 0.0, couponRate: 0.0795 },
  { date: s(2028, 3, 10), principal: 100.0, amortization: 0.0, couponRate: 0.0795 },
  { date: s(2028, 9, 11), principal: 100.0, amortization: 0.0, couponRate: 0.0795 },
  { date: s(2029, 3, 10), principal: 100.0, amortization: 0.0, couponRate: 0.0795 },
  { date: s(2029, 9, 10), principal: 100.0, amortization: 0.0, couponRate: 0.0795 },
  { date: s(2030, 3, 10), principal: 100.0, amortization: 0.0, couponRate: 0.0795 },
  { date: s(2030, 9, 10), principal: 100.0, amortization: 0.0, couponRate: 0.0795 },
  { date: s(2031, 3, 10), principal: 100.0, amortization: 0.0, couponRate: 0.0795 },
  { date: s(2031, 9, 10), principal: 0.0, amortization: 100.0, couponRate: 0.0795 },
];

// MGCOO (PAMPA) — cupón 7.8750%, vto 2034-12-16
const SCHED_MGCOO: CashFlowPeriod[] = [
  { date: s(2024, 12, 16), principal: 100.0, amortization: 0, couponRate: 0.07875 },
  { date: s(2025, 6, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2025, 12, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2026, 6, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2026, 12, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2027, 6, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2027, 12, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2028, 6, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2028, 12, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2029, 6, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2029, 12, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2030, 6, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2030, 12, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2031, 6, 17), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2031, 12, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2032, 6, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2032, 12, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2033, 6, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2033, 12, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2034, 6, 16), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2034, 12, 16), principal: 0.0, amortization: 100.0, couponRate: 0.07875 },
];

// MGCRO (PAMPA) — cupón 7.7500%, vto 2037-11-14
const SCHED_MGCRO: CashFlowPeriod[] = [
  { date: s(2025, 11, 14), principal: 100.0, amortization: 0, couponRate: 0.0775 },
  { date: s(2026, 5, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2026, 11, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2027, 5, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2027, 11, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2028, 5, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2028, 11, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2029, 5, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2029, 11, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2030, 5, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2030, 11, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2031, 5, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2031, 11, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2032, 5, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2032, 11, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2033, 5, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2033, 11, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2034, 5, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2034, 11, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2035, 5, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2035, 11, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2036, 5, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2036, 11, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2037, 5, 14), principal: 100.0, amortization: 0.0, couponRate: 0.0775 },
  { date: s(2037, 11, 14), principal: 0.0, amortization: 100.0, couponRate: 0.0775 },
];

// VSCVO (VISTA) — cupón 8.5000%, vto 2033-06-10
const SCHED_VSCVO: CashFlowPeriod[] = [
  { date: s(2025, 6, 10), principal: 100.0, amortization: 0, couponRate: 0.085 },
  { date: s(2025, 12, 10), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2026, 6, 10), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2026, 12, 10), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2027, 6, 10), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2027, 12, 10), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2028, 6, 10), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2028, 12, 10), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2029, 6, 10), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2029, 12, 10), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2030, 6, 10), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2030, 12, 10), principal: 100.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2031, 6, 10), principal: 67.0, amortization: 33.0, couponRate: 0.085 },
  { date: s(2031, 12, 10), principal: 67.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2032, 6, 10), principal: 34.0, amortization: 33.0, couponRate: 0.085 },
  { date: s(2032, 12, 10), principal: 34.0, amortization: 0.0, couponRate: 0.085 },
  { date: s(2033, 6, 10), principal: 0.0, amortization: 34.0, couponRate: 0.085 },
];

// VSCTO (VISTA) — cupón 7.6250%, vto 2035-12-10
const SCHED_VSCTO: CashFlowPeriod[] = [
  { date: s(2024, 12, 10), principal: 100.0, amortization: 0, couponRate: 0.07625 },
  { date: s(2025, 6, 10), principal: 100.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2025, 12, 10), principal: 100.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2026, 6, 10), principal: 100.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2026, 12, 10), principal: 100.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2027, 6, 10), principal: 100.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2027, 12, 10), principal: 100.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2028, 6, 10), principal: 100.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2028, 12, 10), principal: 100.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2029, 6, 10), principal: 100.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2029, 12, 10), principal: 100.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2030, 6, 10), principal: 100.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2030, 12, 10), principal: 100.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2031, 6, 10), principal: 100.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2031, 12, 10), principal: 100.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2032, 6, 10), principal: 100.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2032, 12, 10), principal: 100.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2033, 6, 10), principal: 100.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2033, 12, 10), principal: 67.0, amortization: 33.0, couponRate: 0.07625 },
  { date: s(2034, 6, 10), principal: 67.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2034, 12, 10), principal: 34.0, amortization: 33.0, couponRate: 0.07625 },
  { date: s(2035, 6, 10), principal: 34.0, amortization: 0.0, couponRate: 0.07625 },
  { date: s(2035, 12, 10), principal: 0.0, amortization: 34.0, couponRate: 0.07625 },
];

// VSCXO (VISTA) — cupón 7.8750%, vto 2038-04-08
const SCHED_VSCXO: CashFlowPeriod[] = [
  { date: s(2026, 4, 8), principal: 100.0, amortization: 0, couponRate: 0.07875 },
  { date: s(2026, 10, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2027, 4, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2027, 10, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2028, 4, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2028, 10, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2029, 4, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2029, 10, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2030, 4, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2030, 10, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2031, 4, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2031, 10, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2032, 4, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2032, 10, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2033, 4, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2033, 10, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2034, 4, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2034, 10, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2035, 4, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2035, 10, 8), principal: 100.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2036, 4, 8), principal: 67.0, amortization: 33.0, couponRate: 0.07875 },
  { date: s(2036, 10, 8), principal: 67.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2037, 4, 8), principal: 34.0, amortization: 33.0, couponRate: 0.07875 },
  { date: s(2037, 10, 8), principal: 34.0, amortization: 0.0, couponRate: 0.07875 },
  { date: s(2038, 4, 8), principal: 0.0, amortization: 34.0, couponRate: 0.07875 },
];

export const BOND_DEFINITIONS: Record<string, BondDefinition> = {
  // ── Bonares USD ──
  AO27: {
    name: 'AO27', isin: 'AR0676997536', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2027, 10, 29),
    initialPrincipal: 100, tickerMEP: 'AO27D', tickerCCL: 'AO27C', tickerARS: 'AO27',
    category: 'Bonares USD', schedule: SCHED_AO27,
  },
  AO28: {
    name: 'AO28', isin: 'AR0474258297', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2028, 10, 31),
    initialPrincipal: 100, tickerMEP: 'AO28D', tickerCCL: 'AO28C', tickerARS: 'AO28',
    category: 'Bonares USD', schedule: SCHED_AO28,
  },
  AN29: {
    name: 'AN29', isin: 'ARARGE3209Y4', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2029, 11, 30),
    initialPrincipal: 100, tickerMEP: 'AN29D', tickerCCL: 'AN29C', tickerARS: 'AN29',
    category: 'Bonares USD', schedule: SCHED_AN29,
  },
  AL29: {
    name: 'AL29', isin: 'ARARGE3209Y4', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2029, 7, 9),
    initialPrincipal: 100, tickerMEP: 'AL29D', tickerCCL: 'AL29C', tickerARS: 'AL29',
    category: 'Bonares USD', schedule: SCHED_29,
  },
  AL30: {
    name: 'AL30', isin: 'ARARGE3209S6', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2030, 7, 9),
    initialPrincipal: 100, tickerMEP: 'AL30D', tickerCCL: 'AL30C', tickerARS: 'AL30',
    category: 'Bonares USD', schedule: SCHED_30,
  },
  AL35: {
    name: 'AL35', isin: 'ARARGE3209T4', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2035, 7, 9),
    initialPrincipal: 100, tickerMEP: 'AL35D', tickerCCL: 'AL35C', tickerARS: 'AL35',
    category: 'Bonares USD', schedule: SCHED_35,
  },
  AE38: {
    name: 'AE38', isin: 'ARARGE3209U2', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2038, 1, 9),
    initialPrincipal: 100, tickerMEP: 'AE38D', tickerCCL: 'AE38C', tickerARS: 'AE38',
    category: 'Bonares USD', schedule: SCHED_38,
  },
  AL41: {
    name: 'AL41', isin: 'ARARGE3209V0', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2041, 7, 9),
    initialPrincipal: 100, tickerMEP: 'AL41D', tickerCCL: 'AL41C', tickerARS: 'AL41',
    category: 'Bonares USD', schedule: SCHED_41,
  },

  // ── Globales USD ──
  GD29: {
    name: 'GD29', isin: 'US040114HX11', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2029, 7, 9),
    initialPrincipal: 100, tickerMEP: 'GD29D', tickerCCL: 'GD29C', tickerARS: 'GD29',
    category: 'Globales USD', schedule: SCHED_29,
  },
  GD30: {
    name: 'GD30', isin: 'US040114HS26', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2030, 7, 9),
    initialPrincipal: 100, tickerMEP: 'GD30D', tickerCCL: 'GD30C', tickerARS: 'GD30',
    category: 'Globales USD', schedule: SCHED_30,
  },
  GD35: {
    name: 'GD35', isin: 'US040114HT09', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2035, 7, 9),
    initialPrincipal: 100, tickerMEP: 'GD35D', tickerCCL: 'GD35C', tickerARS: 'GD35',
    category: 'Globales USD', schedule: SCHED_35,
  },
  GD38: {
    name: 'GD38', isin: 'US040114HU71', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2038, 1, 9),
    initialPrincipal: 100, tickerMEP: 'GD38D', tickerCCL: 'GD38C', tickerARS: 'GD38',
    category: 'Globales USD', schedule: SCHED_38,
  },
  GD41: {
    name: 'GD41', isin: 'US040114HV54', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2041, 7, 9),
    initialPrincipal: 100, tickerMEP: 'GD41D', tickerCCL: 'GD41C', tickerARS: 'GD41',
    category: 'Globales USD', schedule: SCHED_41,
  },
  GD46: {
    name: 'GD46', isin: 'US040114HW38', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2046, 7, 9),
    initialPrincipal: 100, tickerMEP: 'GD46D', tickerCCL: 'GD46C', tickerARS: 'GD46',
    category: 'Globales USD', schedule: SCHED_46,
  },

  // ── Lecaps ──
  S17A6: {
    name: 'S17A6', isin: 'AR0598299326', frequency: 1, yearConvention: 360,
    dayConvention: '30/360', currency: 'ARS', maturityDate: s(2026, 4, 17),
    initialPrincipal: 100, tickerMEP: 'S17A6', tickerCCL: 'S17A6', tickerARS: 'S17A6',
    category: 'Lecaps', schedule: SCHED_S17A6, temEmision: 0.024,
  },
  S30A6: {
    name: 'S30A6', isin: 'AR0598299326', frequency: 1, yearConvention: 360,
    dayConvention: '30/360', currency: 'ARS', maturityDate: s(2026, 4, 30),
    initialPrincipal: 100, tickerMEP: 'S30A6', tickerCCL: 'S30A6', tickerARS: 'S30A6',
    category: 'Lecaps', schedule: SCHED_S30A6, temEmision: 0.0353,
  },
  S15Y6: {
    name: 'S15Y6', isin: 'AR0858286914', frequency: 1, yearConvention: 360,
    dayConvention: '30/360', currency: 'ARS', maturityDate: s(2026, 5, 15),
    initialPrincipal: 100, tickerMEP: 'S15Y6', tickerCCL: 'S15Y6', tickerARS: 'S15Y6',
    category: 'Lecaps', schedule: SCHED_S15Y6, temEmision: 0.026,
  },
  S29Y6: {
    name: 'S29Y6', isin: 'AR0716680340', frequency: 1, yearConvention: 360,
    dayConvention: '30/360', currency: 'ARS', maturityDate: s(2026, 5, 29),
    initialPrincipal: 100, tickerMEP: 'S29Y6', tickerCCL: 'S29Y6', tickerARS: 'S29Y6',
    category: 'Lecaps', schedule: SCHED_S29Y6, temEmision: 0.0235,
  },
  S17L6: {
    name: 'S17L6', isin: 'AR0071678673', frequency: 1, yearConvention: 360,
    dayConvention: '30/360', currency: 'ARS', maturityDate: s(2026, 7, 17),
    initialPrincipal: 100, tickerMEP: 'S17L6', tickerCCL: 'S17L6', tickerARS: 'S17L6',
    category: 'Lecaps', schedule: SCHED_S17L6, temEmision: 0.0216,
  },
  S31L6: {
    name: 'S31L6', isin: 'AR0377625857', frequency: 1, yearConvention: 360,
    dayConvention: '30/360', currency: 'ARS', maturityDate: s(2026, 7, 31),
    initialPrincipal: 100, tickerMEP: 'S31L6', tickerCCL: 'S31L6', tickerARS: 'S31L6',
    category: 'Lecaps', schedule: SCHED_S31L6, temEmision: 0.0275,
  },
  S31G6: {
    name: 'S31G6', isin: 'AR0960697990', frequency: 1, yearConvention: 360,
    dayConvention: '30/360', currency: 'ARS', maturityDate: s(2026, 8, 31),
    initialPrincipal: 100, tickerMEP: 'S31G6', tickerCCL: 'S31G6', tickerARS: 'S31G6',
    category: 'Lecaps', schedule: SCHED_S31G6, temEmision: 0.025,
  },
  S30S6: {
    name: 'S30S6', isin: 'AR0379015875', frequency: 1, yearConvention: 360,
    dayConvention: '30/360', currency: 'ARS', maturityDate: s(2026, 9, 30),
    initialPrincipal: 100, tickerMEP: 'S30S6', tickerCCL: 'S30S6', tickerARS: 'S30S6',
    category: 'Lecaps', schedule: SCHED_S30S6, temEmision: 0.0253,
  },
  S30O6: {
    name: 'S30O6', isin: 'AR0475783251', frequency: 1, yearConvention: 360,
    dayConvention: '30/360', currency: 'ARS', maturityDate: s(2026, 10, 30),
    initialPrincipal: 100, tickerMEP: 'S30O6', tickerCCL: 'S30O6', tickerARS: 'S30O6',
    category: 'Lecaps', schedule: SCHED_S30O6, temEmision: 0.0255,
  },
  S30N6: {
    name: 'S30N6', isin: 'AR0451031345', frequency: 1, yearConvention: 360,
    dayConvention: '30/360', currency: 'ARS', maturityDate: s(2026, 11, 30),
    initialPrincipal: 100, tickerMEP: 'S30N6', tickerCCL: 'S30N6', tickerARS: 'S30N6',
    category: 'Lecaps', schedule: SCHED_S30N6, temEmision: 0.023,
  },

  // ── Boncaps ──
  T30J6: {
    name: 'T30J6', isin: 'AR0071678673', frequency: 1, yearConvention: 360,
    dayConvention: '30/360', currency: 'ARS', maturityDate: s(2026, 6, 30),
    initialPrincipal: 100, tickerMEP: 'T30J6', tickerCCL: 'T30J6', tickerARS: 'T30J6',
    category: 'Boncaps', schedule: SCHED_T30J6, temEmision: 0.0215,
  },
  T15E7: {
    name: 'T15E7', isin: 'AR0451031345', frequency: 1, yearConvention: 360,
    dayConvention: '30/360', currency: 'ARS', maturityDate: s(2027, 1, 15),
    initialPrincipal: 100, tickerMEP: 'T15E7', tickerCCL: 'T15E7', tickerARS: 'T15E7',
    category: 'Boncaps', schedule: SCHED_T15E7, temEmision: 0.0205,
  },
  T30A7: {
    name: 'T30A7', isin: 'AR0224546884', frequency: 1, yearConvention: 360,
    dayConvention: '30/360', currency: 'ARS', maturityDate: s(2027, 4, 30),
    initialPrincipal: 100, tickerMEP: 'T30A7', tickerCCL: 'T30A7', tickerARS: 'T30A7',
    category: 'Boncaps', schedule: SCHED_T30A7, temEmision: 0.0255,
  },
  T31Y7: {
    name: 'T31Y7', isin: 'AR0571277315', frequency: 1, yearConvention: 360,
    dayConvention: '30/360', currency: 'ARS', maturityDate: s(2027, 5, 31),
    initialPrincipal: 100, tickerMEP: 'T31Y7', tickerCCL: 'T31Y7', tickerARS: 'T31Y7',
    category: 'Boncaps', schedule: SCHED_T31Y7, temEmision: 0.024,
  },
  T30J7: {
    name: 'T30J7', isin: 'AR0987861058', frequency: 1, yearConvention: 360,
    dayConvention: '30/360', currency: 'ARS', maturityDate: s(2027, 6, 30),
    initialPrincipal: 100, tickerMEP: 'T30J7', tickerCCL: 'T30J7', tickerARS: 'T30J7',
    category: 'Boncaps', schedule: SCHED_T30J7, temEmision: 0.0258,
  },

  // ── Bopreales ──────────────────────────────────────────────────────
  BPOA7: {
    name: 'BPOA7', isin: 'AR0684877571', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2027, 10, 31),
    initialPrincipal: 100, tickerMEP: 'BPA7D', tickerCCL: 'BPA7C', tickerARS: 'BPOA7',
    category: 'Bopreales USD', schedule: SCHED_BPO7,
  },
  BPOB7: {
    name: 'BPOB7', isin: 'AR0772251226', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2027, 10, 31),
    initialPrincipal: 100, tickerMEP: 'BPB7D', tickerCCL: 'BPB7C', tickerARS: 'BPOB7',
    category: 'Bopreales USD', schedule: SCHED_BPO7,
  },
  BPOC7: {
    name: 'BPOC7', isin: 'AR0763285209', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2027, 10, 31),
    initialPrincipal: 100, tickerMEP: 'BPC7D', tickerCCL: 'BPC7C', tickerARS: 'BPOC7',
    category: 'Bopreales USD', schedule: SCHED_BPO7,
  },
  BPOD7: {
    name: 'BPOD7', isin: 'AR0314171247', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2027, 10, 31),
    initialPrincipal: 100, tickerMEP: 'BPD7D', tickerCCL: 'BPD7C', tickerARS: 'BPOD7',
    category: 'Bopreales USD', schedule: SCHED_BPO7,
  },
  BPOA8: {
    name: 'BPOA8', isin: 'AR0029227748', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2028, 10, 31),
    initialPrincipal: 100, tickerMEP: 'BPA8D', tickerCCL: 'BPA8C', tickerARS: 'BPOA8',
    category: 'Bopreales USD', schedule: SCHED_BPO8,
  },
  BPOB8: {
    name: 'BPOB8', isin: 'AR0868821510', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2028, 10, 31),
    initialPrincipal: 100, tickerMEP: 'BPB8D', tickerCCL: 'BPB8C', tickerARS: 'BPOB8',
    category: 'Bopreales USD', schedule: SCHED_BPO8,
  },

  // ── Corporativos Oil & Gas Argentina (Ley NY) ─────────────────────
  YCAMO: {
    name: 'YCAMO', isin: 'USP989MJBL47', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2027, 7, 21),
    initialPrincipal: 100, tickerMEP: 'YCAMO', tickerCCL: 'YCAMO', tickerARS: 'YCAMO',
    category: 'Corporativos Oil & Gas', schedule: SCHED_YCAMO,
  },
  YMC1O: {
    name: 'YMC1O', isin: 'USP989MJBP50', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2029, 6, 27),
    initialPrincipal: 100, tickerMEP: 'YMC1O', tickerCCL: 'YMC1O', tickerARS: 'YMC1O',
    category: 'Corporativos Oil & Gas', schedule: SCHED_YMC1O,
  },
  YMCUO: {
    name: 'YMCUO', isin: 'USP989MJBU46', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2031, 1, 17),
    initialPrincipal: 100, tickerMEP: 'YMCUO', tickerCCL: 'YMCUO', tickerARS: 'YMCUO',
    category: 'Corporativos Oil & Gas', schedule: SCHED_YMCUO,
  },
  YMCXO: {
    name: 'YMCXO', isin: 'USP989MJBV29', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2031, 9, 11),
    initialPrincipal: 100, tickerMEP: 'YMCXO', tickerCCL: 'YMCXO', tickerARS: 'YMCXO',
    category: 'Corporativos Oil & Gas', schedule: SCHED_YMCXO,
  },
  YMCJO: {
    name: 'YMCJO', isin: 'USP989MJBT72', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2033, 9, 30),
    initialPrincipal: 100, tickerMEP: 'YMCJO', tickerCCL: 'YMCJO', tickerARS: 'YMCJO',
    category: 'Corporativos Oil & Gas', schedule: SCHED_YMCJO,
  },
  YM34O: {
    name: 'YM34O', isin: 'USP989MJBY67', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2034, 1, 17),
    initialPrincipal: 100, tickerMEP: 'YM34O', tickerCCL: 'YM34O', tickerARS: 'YM34O',
    category: 'Corporativos Oil & Gas', schedule: SCHED_YM34O,
  },
  YCANO: {
    name: 'YCANO', isin: 'USP989MJBN03', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2047, 12, 15),
    initialPrincipal: 100, tickerMEP: 'YCANO', tickerCCL: 'YCANO', tickerARS: 'YCANO',
    category: 'Corporativos Oil & Gas', schedule: SCHED_YCANO,
  },
  MGCMO: {
    name: 'MGCMO', isin: 'USP7464EAS56', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2031, 9, 10),
    initialPrincipal: 100, tickerMEP: 'MGCMO', tickerCCL: 'MGCMO', tickerARS: 'MGCMO',
    category: 'Corporativos Oil & Gas', schedule: SCHED_MGCMO,
  },
  MGCOO: {
    name: 'MGCOO', isin: 'USP7464EAT30', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2034, 12, 16),
    initialPrincipal: 100, tickerMEP: 'MGCOO', tickerCCL: 'MGCOO', tickerARS: 'MGCOO',
    category: 'Corporativos Oil & Gas', schedule: SCHED_MGCOO,
  },
  MGCRO: {
    name: 'MGCRO', isin: 'USP7464EAY25', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2037, 11, 14),
    initialPrincipal: 100, tickerMEP: 'MGCRO', tickerCCL: 'MGCRO', tickerARS: 'MGCRO',
    category: 'Corporativos Oil & Gas', schedule: SCHED_MGCRO,
  },
  VSCVO: {
    name: 'VSCVO', isin: 'USP9659RAB44', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2033, 6, 10),
    initialPrincipal: 100, tickerMEP: 'VSCVO', tickerCCL: 'VSCVO', tickerARS: 'VSCVO',
    category: 'Corporativos Oil & Gas', schedule: SCHED_VSCVO,
  },
  VSCTO: {
    name: 'VSCTO', isin: 'USP9659RAA60', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2035, 12, 10),
    initialPrincipal: 100, tickerMEP: 'VSCTO', tickerCCL: 'VSCTO', tickerARS: 'VSCTO',
    category: 'Corporativos Oil & Gas', schedule: SCHED_VSCTO,
  },
  VSCXO: {
    name: 'VSCXO', isin: 'USP9659RAD00', frequency: 2, yearConvention: 360,
    dayConvention: '30/360', currency: 'USD', maturityDate: s(2038, 4, 8),
    initialPrincipal: 100, tickerMEP: 'VSCXO', tickerCCL: 'VSCXO', tickerARS: 'VSCXO',
    category: 'Corporativos Oil & Gas', schedule: SCHED_VSCXO,
  },
};

export const BOND_NAMES = Object.keys(BOND_DEFINITIONS);

// Filter out matured bonds automatically (a bond is hidden the day it matures)
function isBondActive(name: string): boolean {
  const bond = BOND_DEFINITIONS[name];
  if (!bond) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return bond.maturityDate.getTime() > today.getTime();
}

export const BOND_CATEGORIES: Record<string, string[]> = {
  'Bonares USD': BOND_NAMES.filter(n => BOND_DEFINITIONS[n].category === 'Bonares USD' && isBondActive(n)),
  'Globales USD': BOND_NAMES.filter(n => BOND_DEFINITIONS[n].category === 'Globales USD' && isBondActive(n)),
  'Bopreales': BOND_NAMES.filter(n => BOND_DEFINITIONS[n].category === 'Bopreales USD' && isBondActive(n)),
  'Corporativos Oil & Gas Argentina Ley NY': BOND_NAMES.filter(n => BOND_DEFINITIONS[n].category === 'Corporativos Oil & Gas' && isBondActive(n)),
  'Lecaps': BOND_NAMES.filter(n => BOND_DEFINITIONS[n].category === 'Lecaps' && isBondActive(n)),
  'Boncaps': BOND_NAMES.filter(n => BOND_DEFINITIONS[n].category === 'Boncaps' && isBondActive(n)),
};

// Combined category for scatter charts (Bopreales se muestra debajo del resto)
export const SCATTER_CATEGORIES: Record<string, string[]> = {
  'Bonares USD': BOND_NAMES.filter(n => BOND_DEFINITIONS[n].category === 'Bonares USD' && isBondActive(n)),
  'Globales USD': BOND_NAMES.filter(n => BOND_DEFINITIONS[n].category === 'Globales USD' && isBondActive(n)),
  'Lecaps + Boncaps': BOND_NAMES.filter(n => (BOND_DEFINITIONS[n].category === 'Lecaps' || BOND_DEFINITIONS[n].category === 'Boncaps') && isBondActive(n)),
  'Bopreales': BOND_NAMES.filter(n => BOND_DEFINITIONS[n].category === 'Bopreales USD' && isBondActive(n)),
};
