import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from "recharts";
import { fetchLiveBondPrices, type LiveBondPrice } from "@/lib/apiServices";
import { BOND_DEFINITIONS, BOND_CATEGORIES } from "@/lib/bondSchedules";
import { calculateBond } from "@/lib/bondCalculator";
import { MINIDASH_BONDS, CORP_BY_ISSUER, CLEAN_PRICED_BONDS } from "@/lib/marketData/BASE_MINIDASH";
import { RefreshCw, Activity } from "lucide-react";

type RateType = "TNA" | "TEA" | "TEM";
type Status = "loading" | "ok" | "error";

interface BondPoint {
  id: string;
  label: string;
  group: string;
  x: number;
  y: number;
  price: number;
}

const CARD = "rounded-lg border border-border bg-card p-4";

// Colors for Corporativos series (consistent across page)
const COLOR_YPF = "#22c55e";
const COLOR_PAMPA = "#facc15";
const COLOR_VISTA = "#60a5fa";

// ============ HELPERS ============
function fN(v: number, dc = 1): string {
  if (!isFinite(v)) return "—";
  return v.toLocaleString("es-AR", { minimumFractionDigits: dc, maximumFractionDigits: dc });
}
function fP(v: number, dc = 1): string {
  if (!isFinite(v)) return "—";
  return fN(v * 100, dc) + "%";
}

function getRate(indicators: { tna180_360: number; tir: number; tem: number }, rt: RateType): number {
  if (rt === "TNA") return indicators.tna180_360;
  if (rt === "TEA") return indicators.tir;
  return indicators.tem;
}

// y = a + b · ln(x)
function logRegression(points: { x: number; y: number }[]): { a: number; b: number } | null {
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, n = 0;
  for (const p of points) {
    if (p.x <= 0 || !isFinite(p.x) || !isFinite(p.y)) continue;
    const lx = Math.log(p.x);
    sumX += lx; sumY += p.y; sumXY += lx * p.y; sumX2 += lx * lx; n++;
  }
  if (n < 2) return null;
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;
  const b = (n * sumXY - sumX * sumY) / denom;
  const a = (sumY - b * sumX) / n;
  return { a, b };
}

function regressionLine(reg: { a: number; b: number }, xMin: number, xMax: number, steps = 60): { x: number; y: number }[] {
  if (xMin >= xMax) return [];
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (xMax - xMin) * (i / steps);
    if (x <= 0) continue;
    out.push({ x, y: reg.a + reg.b * Math.log(x) });
  }
  return out;
}

// Compute the actual data x-range for a subset of points (no padding)
function groupRange(pts: BondPoint[]): { xMin: number; xMax: number } | null {
  if (pts.length === 0) return null;
  const xs = pts.map(p => p.x);
  return { xMin: Math.min(...xs), xMax: Math.max(...xs) };
}

function todayDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getCorpClean(bondId: string): number | null {
  const series = MINIDASH_BONDS[bondId];
  if (!series) return null;
  const dates = Object.keys(series).sort();
  const latest = dates[dates.length - 1];
  if (!latest) return null;
  return series[latest].a;
}

function dirtyFromClean(bondId: string, settlement: Date, clean: number): number | null {
  try {
    const r = calculateBond(bondId, settlement, 100, 0.1);
    const residual = r.indicators.residualValue;
    const accrued = r.indicators.accruedInterest;
    return clean * residual + accrued;
  } catch {
    return null;
  }
}

// ============ COMPONENT ============
export default function Curvas() {
  const [livePrices, setLivePrices] = useState<LiveBondPrice[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [statusText, setStatusText] = useState("Conectando…");
  const [hdRate, setHdRate] = useState<RateType>("TNA");
  const [tfRate, setTfRate] = useState<RateType>("TNA");
  const [corpRate, setCorpRate] = useState<RateType>("TNA");

  const fetchLive = useCallback(async () => {
    setStatus("loading");
    setStatusText("Actualizando…");
    try {
      const live = await fetchLiveBondPrices();
      setLivePrices(live);
      setStatus("ok");
      const now = new Date();
      setStatusText("OK " + String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0"));
    } catch {
      setStatus("error");
      setStatusText("Error de conexión");
    }
  }, []);

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 60000);
    return () => clearInterval(interval);
  }, [fetchLive]);

  const settlement = useMemo(() => todayDate(), []);

  const findPrice = useCallback((ticker: string): number | null => {
    if (!ticker) return null;
    const item = livePrices.find(p => p.symbol === ticker);
    if (!item) return null;
    if (item.c && item.c > 0) return item.c;
    if (item.px_bid && item.px_ask && item.px_bid > 0 && item.px_ask > 0) return (item.px_bid + item.px_ask) / 2;
    return null;
  }, [livePrices]);

  // ===== Hard Dollar =====
  const hdPoints = useMemo<BondPoint[]>(() => {
    const out: BondPoint[] = [];
    const bonares = BOND_CATEGORIES["Bonares USD"] || [];
    const globales = BOND_CATEGORIES["Globales USD"] || [];

    for (const bondId of bonares) {
      const bond = BOND_DEFINITIONS[bondId];
      if (!bond) continue;
      const price = findPrice(bond.tickerCCL) ?? findPrice(bond.tickerMEP);
      if (price == null) continue;
      try {
        const r = calculateBond(bondId, settlement, price, 0.1);
        const md = r.indicators.modifiedDuration;
        const y = getRate(r.indicators, hdRate);
        if (!isFinite(md) || !isFinite(y) || md <= 0) continue;
        out.push({ id: bondId, label: bondId, group: "Bonares", x: md, y, price });
      } catch {}
    }
    for (const bondId of globales) {
      const bond = BOND_DEFINITIONS[bondId];
      if (!bond) continue;
      const price = findPrice(bond.tickerCCL) ?? findPrice(bond.tickerMEP);
      if (price == null) continue;
      try {
        const r = calculateBond(bondId, settlement, price, 0.1);
        const md = r.indicators.modifiedDuration;
        const y = getRate(r.indicators, hdRate);
        if (!isFinite(md) || !isFinite(y) || md <= 0) continue;
        out.push({ id: bondId, label: bondId, group: "Globales", x: md, y, price });
      } catch {}
    }
    return out;
  }, [livePrices, settlement, hdRate, findPrice]);

  // ===== Tasa Fija =====
  const tfPoints = useMemo<BondPoint[]>(() => {
    const out: BondPoint[] = [];
    const lecaps = BOND_CATEGORIES["Lecaps"] || [];
    const boncaps = BOND_CATEGORIES["Boncaps"] || [];
    const lecapsSet = new Set(lecaps);

    for (const bondId of [...lecaps, ...boncaps]) {
      const bond = BOND_DEFINITIONS[bondId];
      if (!bond) continue;
      const price = findPrice(bond.tickerARS);
      if (price == null) continue;
      try {
        const r = calculateBond(bondId, settlement, price, 0.1);
        const md = r.indicators.modifiedDuration;
        const y = getRate(r.indicators, tfRate);
        if (!isFinite(md) || !isFinite(y) || md <= 0) continue;
        out.push({ id: bondId, label: bondId, group: lecapsSet.has(bondId) ? "Lecaps" : "Boncaps", x: md, y, price });
      } catch {}
    }
    return out;
  }, [livePrices, settlement, tfRate, findPrice]);

  // ===== Corporativos =====
  const corpPoints = useMemo<BondPoint[]>(() => {
    const out: BondPoint[] = [];
    const issuerMap: Record<string, string> = {};
    for (const [issuer, ids] of Object.entries(CORP_BY_ISSUER)) {
      for (const id of ids) issuerMap[id] = issuer;
    }
    const allCorps = [...CORP_BY_ISSUER.YPF, ...CORP_BY_ISSUER.PAMPA, ...CORP_BY_ISSUER.VISTA];

    for (const bondId of allCorps) {
      const bond = BOND_DEFINITIONS[bondId];
      if (!bond) continue;
      const clean = getCorpClean(bondId);
      if (clean == null) continue;
      const dirty = CLEAN_PRICED_BONDS.has(bondId) ? dirtyFromClean(bondId, settlement, clean) : clean;
      if (dirty == null || dirty <= 0) continue;
      try {
        const r = calculateBond(bondId, settlement, dirty, 0.1);
        const md = r.indicators.modifiedDuration;
        const y = getRate(r.indicators, corpRate);
        if (!isFinite(md) || !isFinite(y) || md <= 0) continue;
        const issuer = issuerMap[bondId];
        const groupLabel = issuer === "YPF" ? "YPF" : issuer === "PAMPA" ? "Pampa Energía" : "Vista Energy";
        out.push({ id: bondId, label: bondId, group: groupLabel, x: md, y, price: clean });
      } catch {}
    }
    return out;
  }, [settlement, corpRate]);

  // ===== Subsets per group =====
  const bonaresPts = useMemo(() => hdPoints.filter(p => p.group === "Bonares"), [hdPoints]);
  const globalesPts = useMemo(() => hdPoints.filter(p => p.group === "Globales"), [hdPoints]);
  const ypfPts = useMemo(() => corpPoints.filter(p => p.group === "YPF"), [corpPoints]);
  const pampaPts = useMemo(() => corpPoints.filter(p => p.group === "Pampa Energía"), [corpPoints]);
  const vistaPts = useMemo(() => corpPoints.filter(p => p.group === "Vista Energy"), [corpPoints]);

  // ===== Regressions =====
  const bonaresReg = useMemo(() => logRegression(bonaresPts), [bonaresPts]);
  const globalesReg = useMemo(() => logRegression(globalesPts), [globalesPts]);
  const tfReg = useMemo(() => logRegression(tfPoints), [tfPoints]);
  const ypfReg = useMemo(() => logRegression(ypfPts), [ypfPts]);
  const pampaReg = useMemo(() => logRegression(pampaPts), [pampaPts]);
  const vistaReg = useMemo(() => logRegression(vistaPts), [vistaPts]);

  // ===== Per-group ranges (regression lines confined to each group's own x-span) =====
  const bonaresRange = useMemo(() => groupRange(bonaresPts), [bonaresPts]);
  const globalesRange = useMemo(() => groupRange(globalesPts), [globalesPts]);
  const tfRange = useMemo(() => groupRange(tfPoints), [tfPoints]);
  const ypfRange = useMemo(() => groupRange(ypfPts), [ypfPts]);
  const pampaRange = useMemo(() => groupRange(pampaPts), [pampaPts]);
  const vistaRange = useMemo(() => groupRange(vistaPts), [vistaPts]);

  // ===== Axis domains (based on actual point data only — NOT regression overshoot) =====
  const computeDomain = (pts: BondPoint[]) => {
    if (pts.length === 0) return { xMin: 0.01, xMax: 10, yMin: 0, yMax: 0.5 };
    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    // Add 5% padding either side
    const xPad = (xMax - xMin) * 0.05 || 0.1;
    const yPad = (yMax - yMin) * 0.10 || 0.005;
    return {
      xMin: Math.max(0.01, xMin - xPad),
      xMax: xMax + xPad,
      yMin: Math.max(0, yMin - yPad),
      yMax: yMax + yPad,
    };
  };

  const hdDomain = useMemo(() => computeDomain(hdPoints), [hdPoints]);
  const tfDomain = useMemo(() => computeDomain(tfPoints), [tfPoints]);
  const corpDomain = useMemo(() => computeDomain(corpPoints), [corpPoints]);

  // ===== Regression lines (scoped to each group's own range) =====
  const bonaresRegLine = useMemo(
    () => (bonaresReg && bonaresRange ? regressionLine(bonaresReg, bonaresRange.xMin, bonaresRange.xMax) : []),
    [bonaresReg, bonaresRange]
  );
  const globalesRegLine = useMemo(
    () => (globalesReg && globalesRange ? regressionLine(globalesReg, globalesRange.xMin, globalesRange.xMax) : []),
    [globalesReg, globalesRange]
  );
  const tfRegLine = useMemo(
    () => (tfReg && tfRange ? regressionLine(tfReg, tfRange.xMin, tfRange.xMax) : []),
    [tfReg, tfRange]
  );
  const ypfRegLine = useMemo(
    () => (ypfReg && ypfRange ? regressionLine(ypfReg, ypfRange.xMin, ypfRange.xMax) : []),
    [ypfReg, ypfRange]
  );
  const pampaRegLine = useMemo(
    () => (pampaReg && pampaRange ? regressionLine(pampaReg, pampaRange.xMin, pampaRange.xMax) : []),
    [pampaReg, pampaRange]
  );
  const vistaRegLine = useMemo(
    () => (vistaReg && vistaRange ? regressionLine(vistaReg, vistaRange.xMin, vistaRange.xMax) : []),
    [vistaReg, vistaRange]
  );

  const statusColor =
    status === "ok" ? "bg-green-500" :
    status === "error" ? "bg-red-500" : "bg-yellow-500";

  const renderRateToggle = (current: RateType, setter: (v: RateType) => void) => (
    <div className="flex items-center gap-0 rounded-md overflow-hidden border border-border">
      {(["TNA", "TEA", "TEM"] as RateType[]).map(v => (
        <button
          key={v}
          onClick={() => setter(v)}
          className={`px-3 py-1 text-xs font-semibold transition-colors ${
            current === v
              ? "bg-primary text-primary-foreground"
              : "bg-transparent text-muted-foreground hover:bg-primary/10 hover:text-foreground"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );

  const tooltipContent = (rateLabel: string) => ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;
    if (!p?.id) return null;
    return (
      <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-lg">
        <p className="font-semibold text-foreground">{p.label}</p>
        <p className="text-muted-foreground">{p.group}</p>
        <p style={{ color: "hsl(var(--primary))" }}>Dur. Mod.: {fN(p.x, 1)}</p>
        <p style={{ color: "hsl(var(--accent))" }}>{rateLabel}: {fP(p.y, 1)}</p>
        <p className="text-muted-foreground">Precio: {fN(p.price, 1)}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-5 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Curvas de Rendimiento
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              TNA / TEA / TEM vs Modified Duration · Regresión logarítmica · Settlement: hoy
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={fetchLive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${status === "loading" ? "animate-spin" : ""}`} />
              Actualizar
            </button>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${statusColor} ${status === "loading" ? "animate-pulse" : ""}`} />
              <span className="text-[10px] text-muted-foreground">{statusText}</span>
            </div>
          </div>
        </div>

        {/* Grid: 2 columns. Hard Dollar | Tasa Fija on row 1, Corporativos alone on row 2 (left, same width as Hard Dollar) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* ===== HARD DOLLAR ===== */}
          <div className={CARD}>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-foreground">Hard Dollar</h3>
              {renderRateToggle(hdRate, setHdRate)}
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[hdDomain.xMin, hdDomain.xMax]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(v) => fN(v, 1)}
                  label={{ value: "Modified Duration", position: "insideBottom", offset: -5, style: { fill: "hsl(var(--muted-foreground))", fontSize: 10 } }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[hdDomain.yMin, hdDomain.yMax]}
                  allowDataOverflow
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(v) => fP(v, 1)}
                  width={52}
                  label={{ value: hdRate, angle: -90, position: "insideLeft", style: { fill: "hsl(var(--muted-foreground))", fontSize: 10 } }}
                />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} content={tooltipContent(hdRate)} />

                {bonaresRegLine.length > 0 && (
                  <Scatter
                    data={bonaresRegLine}
                    line={{ stroke: "hsl(var(--primary))", strokeWidth: 1.5, strokeDasharray: "5 4" }}
                    shape={() => <g />}
                    fill="hsl(var(--primary))"
                    isAnimationActive={false}
                    legendType="none"
                  />
                )}
                {globalesRegLine.length > 0 && (
                  <Scatter
                    data={globalesRegLine}
                    line={{ stroke: "hsl(var(--accent))", strokeWidth: 1.5, strokeDasharray: "5 4" }}
                    shape={() => <g />}
                    fill="hsl(var(--accent))"
                    isAnimationActive={false}
                    legendType="none"
                  />
                )}

                <Scatter data={bonaresPts} fill="hsl(var(--primary))" isAnimationActive={false} legendType="none">
                  <LabelList dataKey="label" position="top" style={{ fill: "hsl(var(--foreground))", fontSize: 9 }} />
                </Scatter>
                <Scatter data={globalesPts} fill="hsl(var(--accent))" isAnimationActive={false} legendType="none">
                  <LabelList dataKey="label" position="top" style={{ fill: "hsl(var(--foreground))", fontSize: 9 }} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* ===== TASA FIJA ===== */}
          <div className={CARD}>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-foreground">Tasa Fija (Lecaps + Boncaps)</h3>
              {renderRateToggle(tfRate, setTfRate)}
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[tfDomain.xMin, tfDomain.xMax]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(v) => fN(v, 1)}
                  label={{ value: "Modified Duration", position: "insideBottom", offset: -5, style: { fill: "hsl(var(--muted-foreground))", fontSize: 10 } }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[tfDomain.yMin, tfDomain.yMax]}
                  allowDataOverflow
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(v) => fP(v, 1)}
                  width={52}
                  label={{ value: tfRate, angle: -90, position: "insideLeft", style: { fill: "hsl(var(--muted-foreground))", fontSize: 10 } }}
                />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} content={tooltipContent(tfRate)} />

                {tfRegLine.length > 0 && (
                  <Scatter
                    data={tfRegLine}
                    line={{ stroke: "hsl(var(--primary))", strokeWidth: 1.5, strokeDasharray: "5 4" }}
                    shape={() => <g />}
                    fill="hsl(var(--primary))"
                    isAnimationActive={false}
                    legendType="none"
                  />
                )}

                <Scatter data={tfPoints} fill="hsl(var(--primary))" isAnimationActive={false} legendType="none">
                  <LabelList dataKey="label" position="top" style={{ fill: "hsl(var(--foreground))", fontSize: 9 }} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* ===== CORPORATIVOS OIL & GAS (row 2, left column, same size as Hard Dollar) ===== */}
          <div className={CARD}>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-foreground">Corporativos Oil &amp; Gas Ley NY</h3>
              {renderRateToggle(corpRate, setCorpRate)}
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[corpDomain.xMin, corpDomain.xMax]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(v) => fN(v, 1)}
                  label={{ value: "Modified Duration", position: "insideBottom", offset: -5, style: { fill: "hsl(var(--muted-foreground))", fontSize: 10 } }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[corpDomain.yMin, corpDomain.yMax]}
                  allowDataOverflow
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(v) => fP(v, 1)}
                  width={52}
                  label={{ value: corpRate, angle: -90, position: "insideLeft", style: { fill: "hsl(var(--muted-foreground))", fontSize: 10 } }}
                />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} content={tooltipContent(corpRate)} />

                {ypfRegLine.length > 0 && (
                  <Scatter
                    data={ypfRegLine}
                    line={{ stroke: COLOR_YPF, strokeWidth: 1.5, strokeDasharray: "5 4" }}
                    shape={() => <g />}
                    fill={COLOR_YPF}
                    isAnimationActive={false}
                    legendType="none"
                  />
                )}
                {pampaRegLine.length > 0 && (
                  <Scatter
                    data={pampaRegLine}
                    line={{ stroke: COLOR_PAMPA, strokeWidth: 1.5, strokeDasharray: "5 4" }}
                    shape={() => <g />}
                    fill={COLOR_PAMPA}
                    isAnimationActive={false}
                    legendType="none"
                  />
                )}
                {vistaRegLine.length > 0 && (
                  <Scatter
                    data={vistaRegLine}
                    line={{ stroke: COLOR_VISTA, strokeWidth: 1.5, strokeDasharray: "5 4" }}
                    shape={() => <g />}
                    fill={COLOR_VISTA}
                    isAnimationActive={false}
                    legendType="none"
                  />
                )}

                <Scatter data={ypfPts} fill={COLOR_YPF} isAnimationActive={false} legendType="none">
                  <LabelList dataKey="label" position="top" style={{ fill: "hsl(var(--foreground))", fontSize: 9 }} />
                </Scatter>
                <Scatter data={pampaPts} fill={COLOR_PAMPA} isAnimationActive={false} legendType="none">
                  <LabelList dataKey="label" position="top" style={{ fill: "hsl(var(--foreground))", fontSize: 9 }} />
                </Scatter>
                <Scatter data={vistaPts} fill={COLOR_VISTA} isAnimationActive={false} legendType="none">
                  <LabelList dataKey="label" position="top" style={{ fill: "hsl(var(--foreground))", fontSize: 9 }} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            {/* Custom HTML legend BELOW the chart — no overlap with axis label */}
            <div className="flex items-center justify-center gap-5 mt-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_YPF }} />
                <span className="text-muted-foreground">YPF</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_PAMPA }} />
                <span className="text-muted-foreground">Pampa Energía</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_VISTA }} />
                <span className="text-muted-foreground">Vista Energy</span>
              </span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
