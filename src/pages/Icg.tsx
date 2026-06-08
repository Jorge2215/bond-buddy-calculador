import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from "recharts";
import { ICG_PRESIDENCIES, ICG_CONTINUOUS } from "@/lib/icgData";
import { TrendingUp, University } from "lucide-react";

// Format with 1 decimal in Spanish locale (comma decimal)
const fmt1 = (n: number) => n.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

type ViewMode = "presidencias" | "continua";

function formatDate(dateStr: string): string {
  const [y, m] = dateStr.split("-");
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${months[parseInt(m) - 1]} ${y}`;
}

function formatDateShort(dateStr: string): string {
  const [y, m] = dateStr.split("-");
  return `${m}/${y.slice(2)}`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-foreground mb-1">{formatDate(label)}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: {p.value != null ? fmt1(p.value) : "—"}
        </p>
      ))}
    </div>
  );
};

export default function Icg() {
  const [viewMode, setViewMode] = useState<ViewMode>("presidencias");
  const [selectedPresidencies, setSelectedPresidencies] = useState<Set<string>>(
    new Set(ICG_PRESIDENCIES.map(p => p.name))
  );

  const togglePresidency = (name: string) => {
    setSelectedPresidencies(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        if (next.size > 1) next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  // For "presidencias" view: merge all selected series into one dataset keyed by date
  const presidenciasData = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    for (const pres of ICG_PRESIDENCIES) {
      if (!selectedPresidencies.has(pres.name)) continue;
      for (const pt of pres.data) {
        if (!map.has(pt.date)) map.set(pt.date, { date: pt.date as any });
        map.get(pt.date)![pres.name] = pt.value;
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      (a.date as any).localeCompare(b.date as any)
    );
  }, [selectedPresidencies]);

  const activePresidencies = ICG_PRESIDENCIES.filter(p => selectedPresidencies.has(p.name));

  // Stats
  const statsData = viewMode === "continua" ? ICG_CONTINUOUS : presidenciasData.map(d => {
    const vals = activePresidencies.map(p => d[p.name]).filter(Boolean) as number[];
    return vals.length ? { value: vals[0] } : null;
  }).filter(Boolean) as any[];

  const allValues = viewMode === "continua"
    ? ICG_CONTINUOUS.map(d => d.value)
    : activePresidencies.flatMap(p => p.data.map(d => d.value));

  const avg = allValues.length ? allValues.reduce((a, b) => a + b, 0) / allValues.length : 0;
  const max = allValues.length ? Math.max(...allValues) : 0;
  const min = allValues.length ? Math.min(...allValues) : 0;
  const last = ICG_CONTINUOUS[ICG_CONTINUOUS.length - 1]?.value ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Índice de Confianza en el Gobierno
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <span>Fuente: Universidad Torcuato Di Tella</span>
              <span className="text-border">·</span>
              <span>Datos mensuales desde Nov 2001</span>
            </p>
          </div>
          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 self-start sm:self-auto">
            {(["presidencias", "continua"] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                  viewMode === mode
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === "presidencias" ? "Por Presidencia" : "Serie Continua"}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Último dato", value: fmt1(last), sub: formatDate(ICG_CONTINUOUS[ICG_CONTINUOUS.length - 1]?.date ?? "") },
            { label: "Promedio histórico", value: fmt1(avg), sub: "Nov 2001 – hoy" },
            { label: "Máximo histórico", value: fmt1(max), sub: "NK Jun 2003" },
            { label: "Mínimo histórico", value: fmt1(min), sub: "Duhalde Sep 2002" },
          ].map(({ label, value, sub }) => (
            <div key={label} className="rounded-lg border border-border bg-card p-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold font-mono text-foreground mt-1">{value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Main chart */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              {viewMode === "presidencias" ? "ICG por Presidencia" : "Serie Histórica Continua"}
            </h3>
            <span className="text-[10px] text-muted-foreground font-mono">Escala 0 – 5</span>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis
                dataKey="date"
                type="category"
                allowDuplicatedCategory={false}
                tickFormatter={formatDateShort}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                interval={viewMode === "continua" ? 23 : 11}
              />
              <YAxis
                domain={[0, 5]}
                ticks={[0, 1, 2, 3, 4, 5]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                width={28}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={avg} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" opacity={0.5} label={{ value: `Prom. ${fmt1(avg)}`, fill: "hsl(var(--muted-foreground))", fontSize: 9, position: "insideTopRight" }} />

              {viewMode === "continua" ? (
                <Line
                  data={ICG_CONTINUOUS}
                  type="monotone"
                  dataKey="value"
                  name="ICG"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ) : (
                activePresidencies.map(pres => (
                  <Line
                    key={pres.name}
                    data={pres.data}
                    type="monotone"
                    dataKey="value"
                    name={pres.name}
                    stroke={pres.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Presidency selector (only shown in presidencias mode) */}
        {viewMode === "presidencias" && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Filtrar por presidencia
            </p>
            <div className="flex flex-wrap gap-2">
              {ICG_PRESIDENCIES.map(pres => {
                const active = selectedPresidencies.has(pres.name);
                return (
                  <button
                    key={pres.name}
                    onClick={() => togglePresidency(pres.name)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      active
                        ? "border-transparent text-white"
                        : "border-border text-muted-foreground bg-card hover:border-primary/40"
                    }`}
                    style={active ? { backgroundColor: pres.color } : {}}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: active ? "white" : pres.color }}
                    />
                    {pres.name}
                    <span className="opacity-70 font-mono">
                      {formatDate(pres.startDate).split(" ")[1]}–{formatDate(pres.endDate).split(" ")[1]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Per-presidency stats table */}
        {viewMode === "presidencias" && (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Resumen por Presidencia</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium">Presidente</th>
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium">Período</th>
                    <th className="text-right px-4 py-2 text-muted-foreground font-medium">Promedio</th>
                    <th className="text-right px-4 py-2 text-muted-foreground font-medium">Máximo</th>
                    <th className="text-right px-4 py-2 text-muted-foreground font-medium">Mínimo</th>
                    <th className="text-right px-4 py-2 text-muted-foreground font-medium">Último</th>
                  </tr>
                </thead>
                <tbody>
                  {ICG_PRESIDENCIES.map(pres => {
                    const vals = pres.data.map(d => d.value);
                    const presAvg = vals.reduce((a, b) => a + b, 0) / vals.length;
                    const presMax = Math.max(...vals);
                    const presMin = Math.min(...vals);
                    const presLast = vals[vals.length - 1];
                    return (
                      <tr key={pres.name} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pres.color }} />
                            <span className="font-medium text-foreground">{pres.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-muted-foreground font-mono">
                          {formatDate(pres.startDate)} – {formatDate(pres.endDate)}
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-foreground">{fmt1(presAvg)}</td>
                        <td className="px-4 py-2 text-right font-mono text-green-400">{fmt1(presMax)}</td>
                        <td className="px-4 py-2 text-right font-mono text-red-400">{fmt1(presMin)}</td>
                        <td className="px-4 py-2 text-right font-mono text-foreground">{fmt1(presLast)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Source note */}
        <p className="text-[10px] text-muted-foreground text-center pb-2">
          Fuente: Universidad Torcuato Di Tella — Índice de Confianza en el Gobierno (ICG). Escala de 0 a 5.
          Relevamiento mensual desde noviembre 2001.
        </p>
      </main>
    </div>
  );
}
