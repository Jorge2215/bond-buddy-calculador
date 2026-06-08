import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, Brush,
} from "recharts";
import {
  getTCRMOficial, getTCRMCCL, getCanje,
  getBrechaCCL, getBrechaMEP,
  getAnchorInfo,
} from "@/lib/marketData/compute";
import { Calendar } from "lucide-react";

// ===== Helpers =====
function fmtDateTick(d: string): string {
  if (!d) return "";
  const [y, m] = d.split("-");
  return `${m}/${y.slice(2)}`;
}
function fmtDateFull(d: string): string {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${day} ${months[parseInt(m) - 1]} ${y}`;
}
function fmtNum(n: number, dec = 1): string {
  return n.toLocaleString("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// Compute brush indices from from/to dates over a date-sorted dataset
function computeBrushIndices<T extends { date: string }>(data: T[], from: string, to: string) {
  if (data.length === 0) return { start: 0, end: 0 };
  let start = 0, end = data.length - 1;
  for (let i = 0; i < data.length; i++) {
    if (data[i].date >= from) { start = i; break; }
  }
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].date <= to) { end = i; break; }
  }
  if (end < start) end = start;
  return { start, end };
}

// Date range selector (always visible, like the old "Personalizado" mode)
interface DateRangeProps {
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
  minDate: string;
  maxDate: string;
}

function DateRange({ from, to, onFrom, onTo, minDate, maxDate }: DateRangeProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs flex-wrap">
      <label className="text-muted-foreground">Desde:</label>
      <input
        type="date"
        value={from}
        min={minDate}
        max={to}
        onChange={(e) => onFrom(e.target.value)}
        className="bg-card border border-border rounded px-2 py-1 text-foreground text-xs focus:outline-none focus:border-primary"
      />
      <label className="text-muted-foreground">Hasta:</label>
      <input
        type="date"
        value={to}
        min={from}
        max={maxDate}
        onChange={(e) => onTo(e.target.value)}
        className="bg-card border border-border rounded px-2 py-1 text-foreground text-xs focus:outline-none focus:border-primary"
      />
    </div>
  );
}

// Brush onChange handler that converts indices to dates
function makeBrushHandler<T extends { date: string }>(
  data: T[],
  setRange: (r: { from: string; to: string }) => void
) {
  return (state: any) => {
    if (!state || state.startIndex == null || state.endIndex == null) return;
    const fromDate = data[state.startIndex]?.date;
    const toDate = data[state.endIndex]?.date;
    if (fromDate && toDate) setRange({ from: fromDate, to: toDate });
  };
}

const CARD = "rounded-lg border border-border bg-card p-4";

export default function Fx() {
  // Pre-computar todas las series una sola vez
  const tcrmOficial = useMemo(() => getTCRMOficial(), []);
  const tcrmCCL = useMemo(() => getTCRMCCL(), []);
  const canje = useMemo(() => getCanje(), []);
  const brechaCCL = useMemo(() => getBrechaCCL(), []);
  const brechaMEP = useMemo(() => getBrechaMEP(), []);
  const anchor = useMemo(() => getAnchorInfo(), []);

  // ===== Sección 1: TCRM =====
  type TcrmView = "ambos" | "oficial" | "ccl";
  const [tcrmView, setTcrmView] = useState<TcrmView>("ambos");

  // Datos combinados con TODAS las fechas (sin filtrar por rango)
  const tcrmData = useMemo(() => {
    const map = new Map<string, { date: string; oficial?: number; ccl?: number }>();
    for (const p of tcrmOficial) map.set(p.date, { date: p.date, oficial: p.value });
    for (const p of tcrmCCL) {
      const e = map.get(p.date) || { date: p.date };
      e.ccl = p.value;
      map.set(p.date, e);
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [tcrmOficial, tcrmCCL]);

  const tcrmMin = tcrmData[0]?.date || "";
  const tcrmMax = tcrmData[tcrmData.length - 1]?.date || "";

  const [tcrmRange, setTcrmRange] = useState(() => {
    // default: últimos ~3 años
    const idx = Math.max(0, tcrmData.length - 1095);
    return { from: tcrmData[idx]?.date || tcrmMin, to: tcrmMax };
  });
  const tcrmIdx = useMemo(() => computeBrushIndices(tcrmData, tcrmRange.from, tcrmRange.to), [tcrmData, tcrmRange.from, tcrmRange.to]);

  // ===== Sección 2: Canje =====
  const canjeMin = canje[0]?.date || "";
  const canjeMax = canje[canje.length - 1]?.date || "";
  const [canjeRange, setCanjeRange] = useState(() => ({ from: canjeMin, to: canjeMax }));
  const canjeIdx = useMemo(() => computeBrushIndices(canje, canjeRange.from, canjeRange.to), [canje, canjeRange.from, canjeRange.to]);

  // ===== Sección 4: Brechas =====
  const brechaData = useMemo(() => {
    return brechaCCL.map(p => ({ date: p.date, ccl: p.value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [brechaCCL]);

  const brechaMin = brechaData[0]?.date || "";
  const brechaMax = brechaData[brechaData.length - 1]?.date || "";
  const [brechaRange, setBrechaRange] = useState(() => {
    const idx = Math.max(0, brechaData.length - 1095);
    return { from: brechaData[idx]?.date || brechaMin, to: brechaMax };
  });
  const brechaIdx = useMemo(() => computeBrushIndices(brechaData, brechaRange.from, brechaRange.to), [brechaData, brechaRange.from, brechaRange.to]);

  // ===== Stats actuales =====
  const last = <T,>(arr: T[]): T | undefined => arr[arr.length - 1];
  const lastTcrmOf = (last(tcrmOficial) as any)?.value;
  const lastTcrmCcl = (last(tcrmCCL) as any)?.value;
  const lastCanje = (last(canje) as any)?.value;
  const lastBrechaCCL = (last(brechaCCL) as any)?.value;
  const lastBrechaMEP = (last(brechaMEP) as any)?.value;

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-5 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">FX</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tipo de cambio real, canje y brechas · ancla TCRM al {fmtDateFull(anchor.date)}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {[
              { label: "TCRM Oficial", value: lastTcrmOf != null ? fmtNum(lastTcrmOf, 1) : "—" },
              { label: "TCRM CCL", value: lastTcrmCcl != null ? fmtNum(lastTcrmCcl, 1) : "—" },
              { label: "Canje", value: lastCanje != null ? fmtNum(lastCanje, 1) + "%" : "—" },
              { label: "Brecha CCL", value: lastBrechaCCL != null ? fmtNum(lastBrechaCCL, 1) + "%" : "—" },
              { label: "Brecha MEP", value: lastBrechaMEP != null ? fmtNum(lastBrechaMEP, 1) + "%" : "—" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-card px-3 py-1.5">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className="text-sm font-bold font-mono text-foreground">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== SECCIÓN 1: TIPO DE CAMBIO REAL ===== */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Tipo de Cambio Real</h3>
          <div className={CARD}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-4">
              <h4 className="text-sm font-semibold text-foreground">Tipo de Cambio Real Multilateral</h4>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-0 rounded-md overflow-hidden border border-border">
                  {([["ambos","Ambos"],["oficial","Al Oficial"],["ccl","Al CCL"]] as [TcrmView,string][]).map(([v, lbl]) => (
                    <button
                      key={v}
                      onClick={() => setTcrmView(v)}
                      className={`px-3 py-1 text-xs font-semibold transition-colors ${
                        tcrmView === v
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
                <DateRange
                  from={tcrmRange.from}
                  to={tcrmRange.to}
                  onFrom={(v) => setTcrmRange((r) => ({ ...r, from: v }))}
                  onTo={(v) => setTcrmRange((r) => ({ ...r, to: v }))}
                  minDate={tcrmMin}
                  maxDate={tcrmMax}
                />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={tcrmData} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="date" tickFormatter={fmtDateTick} minTickGap={50}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis domain={["auto","auto"]} width={50}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(v) => fmtNum(v, 0)} />
                <Tooltip
                  cursor={false}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-lg">
                        <p className="font-semibold text-foreground mb-1">{fmtDateFull(label as string)}</p>
                        {payload.map((p: any) => (
                          <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
                            {p.name}: {fmtNum(p.value, 1)}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend verticalAlign="top" align="right" height={28} iconType="plainline"
                  wrapperStyle={{ fontSize: 11 }} />
                {(tcrmView === "ambos" || tcrmView === "oficial") && (
                  <Line type="monotone" dataKey="oficial" name="TCRM al Oficial"
                    stroke="hsl(var(--primary))" strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
                )}
                {(tcrmView === "ambos" || tcrmView === "ccl") && (
                  <Line type="monotone" dataKey="ccl" name="TCRM al CCL"
                    stroke="hsl(var(--accent))" strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
                )}
                <Brush
                  dataKey="date"
                  startIndex={tcrmIdx.start}
                  endIndex={tcrmIdx.end}
                  height={26}
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--card))"
                  travellerWidth={8}
                  tickFormatter={fmtDateTick}
                  onChange={makeBrushHandler(tcrmData, setTcrmRange)}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ===== SECCIÓN 3: CANJE ===== */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Canje</h3>
          <div className={CARD}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-4">
              <h4 className="text-sm font-semibold text-foreground">Canje CCL-MEP (%)</h4>
              <DateRange
                from={canjeRange.from}
                to={canjeRange.to}
                onFrom={(v) => setCanjeRange((r) => ({ ...r, from: v }))}
                onTo={(v) => setCanjeRange((r) => ({ ...r, to: v }))}
                minDate={canjeMin}
                maxDate={canjeMax}
              />
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={canje} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="date" tickFormatter={fmtDateTick} minTickGap={50}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis domain={["auto","auto"]} width={50}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(v) => fmtNum(v, 1) + "%"} />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 4" opacity={0.5} />
                <Tooltip
                  cursor={false}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-lg">
                        <p className="font-semibold text-foreground mb-1">{fmtDateFull(label as string)}</p>
                        <p style={{ color: "hsl(var(--primary))" }} className="font-mono">
                          Canje: {fmtNum(payload[0].value as number, 1)}%
                        </p>
                      </div>
                    );
                  }}
                />
                <Line type="monotone" dataKey="value" name="Canje CCL-MEP"
                  stroke="hsl(var(--primary))" strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
                <Brush
                  dataKey="date"
                  startIndex={canjeIdx.start}
                  endIndex={canjeIdx.end}
                  height={26}
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--card))"
                  travellerWidth={8}
                  tickFormatter={fmtDateTick}
                  onChange={makeBrushHandler(canje, setCanjeRange)}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ===== SECCIÓN 4: BRECHAS ===== */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Brechas vs Oficial</h3>
          <div className={CARD}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-4">
              <h4 className="text-sm font-semibold text-foreground">Brecha CCL vs A3500 (%)</h4>
              <div className="flex items-center gap-3 flex-wrap">
                <DateRange
                  from={brechaRange.from}
                  to={brechaRange.to}
                  onFrom={(v) => setBrechaRange((r) => ({ ...r, from: v }))}
                  onTo={(v) => setBrechaRange((r) => ({ ...r, to: v }))}
                  minDate={brechaMin}
                  maxDate={brechaMax}
                />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={brechaData} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="date" tickFormatter={fmtDateTick} minTickGap={50}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis domain={["auto","auto"]} width={50}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(v) => fmtNum(v, 0) + "%"} />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 4" opacity={0.5} />
                <Tooltip
                  cursor={false}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-lg">
                        <p className="font-semibold text-foreground mb-1">{fmtDateFull(label as string)}</p>
                        {payload.map((p: any) => p.value != null && (
                          <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
                            {p.name}: {fmtNum(p.value, 1)}%
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend verticalAlign="top" align="right" height={28} iconType="plainline"
                  wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="ccl" name="Brecha CCL - A3500"
                  stroke="hsl(var(--primary))" strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
                <Brush
                  dataKey="date"
                  startIndex={brechaIdx.start}
                  endIndex={brechaIdx.end}
                  height={26}
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--card))"
                  travellerWidth={8}
                  tickFormatter={fmtDateTick}
                  onChange={makeBrushHandler(brechaData, setBrechaRange)}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Footer */}
        <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1.5 pt-2">
          <Calendar className="h-3 w-3" />
          Bases: A3500 (BCRA), TCRM (ARITCR Index), MEP SENEBI, CCL · Series derivadas calculadas con ancla móvil.
        </p>
      </main>
    </div>
  );
}
