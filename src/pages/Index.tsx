import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { calculateBond } from "@/lib/bondCalculator";
import { BOND_DEFINITIONS, BOND_CATEGORIES } from "@/lib/bondSchedules";
import { MINIDASH_BONDS, CLEAN_PRICED_BONDS } from "@/lib/marketData/BASE_MINIDASH";
import {
  fetchBondPrices, fetchCurrentExchangeRates, fetchHistoricalExchangeRates,
  fetchHolidays, isBusinessDay, getLastBusinessDay, getNextBusinessDay,
  getClosestPrice, getClosestExchangeRate, fetchLiveBondPrices, fetchLiveMEP, fetchLiveCCL,
  getLivePrice,
  type BondPrice, type ExchangeRate, type Holiday, type LiveBondPrice
} from "@/lib/apiServices";
import { MetricCard } from "@/components/MetricCard";
import { InputField } from "@/components/InputField";
import { CashFlowTable } from "@/components/CashFlowTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Clock, BarChart3, Activity, Shield, Calendar, RefreshCw, Percent, X } from "lucide-react";

function formatPercent(n: number): string { return (n * 100).toFixed(2) + "%"; }
function formatNumber(n: number, dec = 2): string { return n.toFixed(dec); }
function dateToStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function isToday(dateStr: string): boolean {
  return dateStr === dateToStr(new Date());
}

type CurrencyMode = 'MEP' | 'CCL' | 'ARS';
type ARSSubMode = 'MEP' | 'CCL';

export default function BondDashboard() {
  const [selectedBond, setSelectedBond] = useState<string>('AL29');
  const [currency, setCurrency] = useState<CurrencyMode>('MEP');
  const [arsSubMode, setArsSubMode] = useState<ARSSubMode>('MEP');
  const [operationDate, setOperationDate] = useState<string>('');
  const [settlementDate, setSettlementDate] = useState<string>('');
  const [dirtyPrice, setDirtyPrice] = useState<string>('');
  const [pricingTIR, setPricingTIR] = useState<string>('10');
  const [tcMEP, setTcMEP] = useState<string>('');
  const [tcCCL, setTcCCL] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userEditedPrice, setUserEditedPrice] = useState(false);

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [bondPrices, setBondPrices] = useState<Record<string, BondPrice[]>>({});
  const [historicalMEP, setHistoricalMEP] = useState<ExchangeRate[]>([]);
  const [historicalCCL, setHistoricalCCL] = useState<ExchangeRate[]>([]);
  const [livePrices, setLivePrices] = useState<LiveBondPrice[]>([]);

  // Store market prices for all bonds (for scatter charts)
  const [allMarketPrices, setAllMarketPrices] = useState<Record<string, number>>({});

  const bond = BOND_DEFINITIONS[selectedBond];
  const isARSBond = bond.currency === 'ARS';

  // Refresh all live data from APIs
  const refreshData = useCallback(async (isInitial = false) => {
    if (!isInitial) setRefreshing(true);
    const now = new Date();
    const year = now.getFullYear();
    try {
      const [h1, h2, currentRates, hMEP, hCCL, live, liveMep, liveCcl] = await Promise.all([
        fetchHolidays(year).catch(() => []),
        fetchHolidays(year + 1).catch(() => []),
        fetchCurrentExchangeRates().catch(() => null),
        fetchHistoricalExchangeRates('bolsa').catch(() => []),
        fetchHistoricalExchangeRates('contadoconliqui').catch(() => []),
        fetchLiveBondPrices().catch(() => []),
        fetchLiveMEP().catch(() => null),
        fetchLiveCCL().catch(() => null),
      ]);
      const allHolidays = [...(h1 || []), ...(h2 || [])];
      setHolidays(allHolidays);
      setHistoricalMEP(hMEP || []);
      setHistoricalCCL(hCCL || []);
      setLivePrices(live || []);
      setBondPrices({});

      if (currentRates) {
        setTcMEP(formatNumber(currentRates.mep.venta, 2));
        setTcCCL(formatNumber(currentRates.ccl.venta, 2));
      } else {
        if (liveMep) setTcMEP(formatNumber(liveMep, 2));
        if (liveCcl) setTcCCL(formatNumber(liveCcl, 2));
      }

      // Populate all market prices for scatter charts and calculator defaults
      const prices: Record<string, number> = {};

      // Live prices from data912 for ALL non-corporate bonds
      if (live && live.length > 0) {
        for (const [bondId, def] of Object.entries(BOND_DEFINITIONS)) {
          if (def.category === 'Corporativos Oil & Gas') continue;
          const ticker = def.currency === 'ARS' ? def.tickerARS : def.tickerMEP;
          const lp = getLivePrice(live, ticker);
          if (lp !== null) prices[bondId] = lp;
        }
      }

      // Corporativos Oil & Gas: precio del Excel (último Ask), convertido a dirty
      // Independiente de que data912 responda o no
      const today0 = new Date();
      today0.setHours(0, 0, 0, 0);
      for (const [bondId, def] of Object.entries(BOND_DEFINITIONS)) {
        if (def.category !== 'Corporativos Oil & Gas') continue;
        const series = MINIDASH_BONDS[bondId];
        if (!series) continue;
        const dates = Object.keys(series).sort();
        const latestDate = dates[dates.length - 1];
        if (!latestDate) continue;
        const cleanAsk = series[latestDate].a;
        if (CLEAN_PRICED_BONDS.has(bondId)) {
          try {
            const r = calculateBond(bondId, today0, 100, 0.1);
            const residual = r.indicators.residualValue;
            const accrued = r.indicators.accruedInterest;
            prices[bondId] = cleanAsk * residual + accrued;
          } catch {
            prices[bondId] = cleanAsk;
          }
        } else {
          prices[bondId] = cleanAsk;
        }
      }
      setAllMarketPrices(prices);

      if (isInitial) {
        const today = new Date();
        const lastBD = getLastBusinessDay(today, allHolidays);
        setOperationDate(dateToStr(lastBD));
        const nextBD = getNextBusinessDay(lastBD, allHolidays);
        setSettlementDate(dateToStr(nextBD));
      }
    } finally {
      if (isInitial) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { refreshData(true); }, [refreshData]);

  useEffect(() => {
    const interval = setInterval(() => refreshData(false), 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Update TC when operation date changes (only for historical dates)
  useEffect(() => {
    if (!operationDate || historicalMEP.length === 0) return;
    if (isToday(operationDate)) return;
    const mepRate = getClosestExchangeRate(historicalMEP, operationDate);
    const cclRate = getClosestExchangeRate(historicalCCL, operationDate);
    if (mepRate !== null) setTcMEP(formatNumber(mepRate, 2));
    if (cclRate !== null) setTcCCL(formatNumber(cclRate, 2));
  }, [operationDate, historicalMEP, historicalCCL]);

  // Load bond prices when bond or currency changes
  useEffect(() => {
    let ticker: string;
    if (isARSBond) {
      ticker = bond.tickerARS;
    } else {
      ticker = currency === 'MEP' ? bond.tickerMEP
        : currency === 'CCL' ? bond.tickerCCL
        : bond.tickerARS;
    }
    if (bondPrices[ticker]) return;
    fetchBondPrices(ticker).then(prices => {
      setBondPrices(prev => ({ ...prev, [ticker]: prices }));
    }).catch(() => {});
  }, [selectedBond, currency, bond, isARSBond]);

  // Get current market price for the selected bond
  const getMarketPrice = useCallback((): number | null => {
    if (!operationDate) return null;
    let ticker: string;
    if (isARSBond) {
      ticker = bond.tickerARS;
    } else {
      ticker = currency === 'MEP' ? bond.tickerMEP
        : currency === 'CCL' ? bond.tickerCCL
        : bond.tickerARS;
    }

    let price: number | null = null;

    if (isToday(operationDate) && livePrices.length > 0) {
      price = getLivePrice(livePrices, ticker);
    }

    if (price === null) {
      const prices = bondPrices[ticker];
      if (prices && Array.isArray(prices) && prices.length > 0) {
        price = getClosestPrice(prices, operationDate);
      }
    }

    if (price === null) return null;

    // For USD bonds with ARS currency, convert to USD
    if (!isARSBond && currency === 'ARS') {
      const fxStr = arsSubMode === 'MEP' ? tcMEP : tcCCL;
      const fxRate = parseFloat(fxStr);
      if (fxRate && fxRate > 0) {
        price = price / fxRate;
      } else {
        return null;
      }
    }
    return price;
  }, [operationDate, currency, arsSubMode, bond, bondPrices, tcMEP, tcCCL, livePrices, isARSBond]);

  // Auto-fill price only when user hasn't manually edited
  useEffect(() => {
    if (userEditedPrice) return;
    const price = getMarketPrice();
    if (price !== null) {
      setDirtyPrice(formatNumber(price, 2));
    } else {
      setDirtyPrice('');
    }
  }, [getMarketPrice, userEditedPrice]);

  // Reset userEditedPrice when bond or currency changes
  useEffect(() => {
    setUserEditedPrice(false);
  }, [selectedBond, currency, arsSubMode, operationDate]);

  // Auto-update settlement
  useEffect(() => {
    if (!operationDate || holidays.length === 0) return;
    const opDate = new Date(operationDate + 'T00:00:00');
    if (isNaN(opDate.getTime())) return;
    const nextBD = getNextBusinessDay(opDate, holidays);
    setSettlementDate(dateToStr(nextBD));
  }, [operationDate, holidays]);

  const result = useMemo(() => {
    if (!settlementDate) return null;
    const sd = new Date(settlementDate + 'T00:00:00');
    const dp = parseFloat(dirtyPrice) || 0;
    const pt = (parseFloat(pricingTIR) || 10) / 100;
    if (isNaN(sd.getTime()) || dp <= 0) return null;
    try { return calculateBond(selectedBond, sd, dp, pt); } catch { return null; }
  }, [selectedBond, settlementDate, dirtyPrice, pricingTIR]);

  const handlePriceChange = (val: string) => {
    setDirtyPrice(val);
    setUserEditedPrice(true);
  };

  const resetToMarketPrice = () => {
    setUserEditedPrice(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground gap-2">
        <RefreshCw className="h-5 w-5 animate-spin" /> Cargando datos...
      </div>
    );
  }

  const indicators = result?.indicators;
  const cashFlows = result?.cashFlows;
  const priceLabel = isARSBond ? 'Precio Dirty (ARS)' : 'Precio Dirty (USD)';
  const priceSuffix = isARSBond ? 'ARS' : 'USD';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary/20 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">Calculadora Bonos Argentina</h1>
              <p className="text-xs text-muted-foreground">Bonares, Globales, Lecaps & Boncaps</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <button
              onClick={() => refreshData(false)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <span>MEP: ${tcMEP || '—'}</span>
            <span>CCL: ${tcCCL || '—'}</span>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Bond Category Selector */}
        {Object.entries(BOND_CATEGORIES).map(([category, bonds]) => (
          <div key={category}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{category}</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {bonds.map(name => (
                <button
                  key={name}
                  onClick={() => { setSelectedBond(name); setDirtyPrice(''); setUserEditedPrice(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    selectedBond === name
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Bond Header */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> {bond.currency}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Vto. {bond.maturityDate.toLocaleDateString('es-AR')}</span>
          <span>ISIN: {bond.isin}</span>
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-semibold">{bond.category}</span>
          {bond.temEmision && (
            <span className="px-2 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-semibold">TEM Emisión: {(bond.temEmision * 100).toFixed(2)}%</span>
          )}
        </div>

        {/* Inputs */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Parámetros de Operación</h2>
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isARSBond ? 'lg:grid-cols-4' : 'lg:grid-cols-6'} gap-4`}>
            {/* Currency selector only for USD bonds */}
            {!isARSBond && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Moneda Cotización</label>
                <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyMode)}>
                  <SelectTrigger className="border-primary/30 bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEP">USD MEP</SelectItem>
                    <SelectItem value="CCL">USD CCL</SelectItem>
                    <SelectItem value="ARS">ARS (Pesos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {!isARSBond && currency === 'ARS' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Convertir con</label>
                <Select value={arsSubMode} onValueChange={(v) => setArsSubMode(v as ARSSubMode)}>
                  <SelectTrigger className="border-primary/30 bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEP">TC MEP</SelectItem>
                    <SelectItem value="CCL">TC CCL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <InputField label="Fecha Operación" type="date" value={operationDate} onChange={setOperationDate} />
            <InputField label="Fecha Liquidación" type="date" value={settlementDate} onChange={setSettlementDate} />

            {/* Price field with X reset button */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {priceLabel}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={dirtyPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  step="0.01"
                  className="w-full rounded-md border border-primary/30 bg-card px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors pr-16"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {userEditedPrice && (
                    <button
                      onClick={resetToMarketPrice}
                      className="p-1 rounded hover:bg-destructive/20 text-destructive transition-colors"
                      title="Volver al precio de mercado"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <span className="text-xs text-muted-foreground font-mono">{priceSuffix}</span>
                </div>
              </div>
            </div>

            <InputField label="TIR para Pricing" type="number" value={pricingTIR} onChange={setPricingTIR} suffix="%" step="0.01" />
          </div>

          {/* TC Fields - only for USD bonds */}
          {!isARSBond && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border/50">
              <InputField label="TC MEP (ARS/USD)" type="number" value={tcMEP} onChange={setTcMEP} step="0.01" />
              <InputField label="TC CCL (ARS/USD)" type="number" value={tcCCL} onChange={setTcCCL} step="0.01" />
            </div>
          )}
        </div>

        {!result ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Ingresá un precio para calcular los indicadores del bono.
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3">Indicadores del Bono</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="TIR (YTM)" value={formatPercent(indicators!.tir)} sublabel="Tasa Interna de Retorno" icon={<TrendingUp className="h-4 w-4" />} variant="positive" />
                <MetricCard label="TEM" value={formatPercent(indicators!.tem)} sublabel="Tasa Efectiva Mensual" icon={<Percent className="h-4 w-4" />} variant="info" />
                <MetricCard label="Modified Duration" value={formatNumber(indicators!.modifiedDuration)} sublabel={`Macaulay: ${formatNumber(indicators!.macaulayDuration)}`} icon={<Clock className="h-4 w-4" />} />
                <MetricCard label="Paridad" value={formatPercent(indicators!.parity)} sublabel={`Valor Técnico: ${formatNumber(indicators!.technicalValue)}`} icon={<BarChart3 className="h-4 w-4" />} variant="warning" />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-3 max-w-md">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mercado</h3>
              <div className="space-y-2">
                {[
                  ['Precio Dirty', formatNumber(indicators!.dirtyPrice)],
                  ['Precio Clean', formatNumber(indicators!.cleanPrice)],
                  ['Interés Corrido', formatNumber(indicators!.accruedInterest, 3)],
                  ['Valor Residual', formatPercent(indicators!.residualValue)],
                  ['Cupón', formatNumber(indicators!.coupon, 3)],
                  ...(isARSBond && indicators!.temEmision
                    ? [['TEM Emisión', formatPercent(indicators!.temEmision)]]
                    : [['Tasa Cupón', formatPercent(indicators!.currentCouponRate)]]),
                  ['Current Yield', formatNumber(indicators!.currentYield, 2) + '%'],
                  ['TNA 180/360', formatPercent(indicators!.tna180_360)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-xs text-muted-foreground">{k}</span>
                    <span className="text-sm font-mono text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {cashFlows && <CashFlowTable rows={cashFlows} />}

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Datos del Bono</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 text-xs">
                {[
                  ...(isARSBond && bond.temEmision
                    ? [['TEM Emisión', formatPercent(bond.temEmision)]]
                    : [['Tasa Cupón Actual', formatPercent(indicators!.currentCouponRate)]]),
                  ['Frecuencia', isARSBond ? 'Bullet (1 pago)' : 'Semestral (2/año)'],
                  ['Tipo de Cupón', isARSBond ? 'TEM Compuesto' : 'Step Up'],
                  ['Convención Días', '30/360'],
                  ['Convención Año', '360'],
                  ['Moneda', bond.currency],
                  ['ISIN', bond.isin],
                  ['Vencimiento', bond.maturityDate.toLocaleDateString('es-AR')],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1 border-b border-border/30">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-foreground font-mono">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
