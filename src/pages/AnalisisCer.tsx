import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Label,
} from "recharts";
import { fetchLiveBondPrices, fetchBondPrices } from "@/lib/apiServices";
import { RefreshCw, Pencil, RotateCcw, TrendingUp, FileText } from "lucide-react";

// ============ HARDCODED DATA ============
const HL = new Set([
  "2026-01-01","2026-02-16","2026-02-17","2026-03-23","2026-03-24","2026-04-02","2026-04-03","2026-05-01","2026-05-25","2026-06-15","2026-06-20","2026-07-09","2026-07-10","2026-08-17","2026-10-12","2026-11-23","2026-12-07","2026-12-08","2026-12-25",
  "2027-01-01","2027-02-08","2027-02-09","2027-03-24","2027-03-25","2027-03-26","2027-04-02","2027-05-01","2027-05-25","2027-06-20","2027-06-21","2027-07-09","2027-08-16","2027-10-11","2027-11-20","2027-12-08","2027-12-25",
  "2028-01-01","2028-02-28","2028-02-29","2028-03-24","2028-04-02","2028-04-13","2028-04-14","2028-05-01","2028-05-25","2028-06-17","2028-06-20","2028-07-09","2028-08-21","2028-10-16","2028-11-20","2028-12-08","2028-12-25",
]);

interface TasaFijaBond { t: string; em: string; vt: string; pf: number; dp: number; }
interface CERBond { t: string; em: string; vt: string; ced: string; ce: number; cvd: string; dp: number; }

// X29Y6 y S29Y6 eliminados (vencimiento muy próximo / vencidos)
const TF: TasaFijaBond[] = [
  { t:"T30J6", em:"2025-01-17", vt:"2026-06-30", pf:144.896, dp:141.25 },
  { t:"S17L6", em:"2026-03-31", vt:"2026-07-17", pf:107.92,  dp:104.18 },
  { t:"S31L6", em:"2026-01-30", vt:"2026-07-31", pf:117.677, dp:112.7 },
  { t:"S14G6", em:"2026-04-17", vt:"2026-08-14", pf:108.029, dp:102.55 },
  { t:"S31G6", em:"2025-11-10", vt:"2026-08-31", pf:127.064, dp:119.55 },
  { t:"S30S6", em:"2026-03-16", vt:"2026-09-30", pf:117.536, dp:107.849 },
  { t:"S30O6", em:"2025-10-31", vt:"2026-10-30", pf:135.278, dp:122.369 },
  { t:"S30N6", em:"2025-12-15", vt:"2026-11-30", pf:129.888, dp:115.799 },
  { t:"T15E7", em:"2025-01-31", vt:"2027-01-15", pf:161.104, dp:138.15 },
  { t:"T30A7", em:"2025-10-31", vt:"2027-04-30", pf:157.341, dp:125.6 },
  { t:"T31Y7", em:"2025-12-15", vt:"2027-05-31", pf:151.563, dp:118.7 },
  { t:"T30J7", em:"2026-01-16", vt:"2027-06-30", pf:156.037, dp:121.649 },
];

const CR: CERBond[] = [
  { t:"TZX26", em:"2024-02-01", vt:"2026-06-30", ced:"2024-01-18", ce:200.388, cvd:"2026-06-16", dp:384.6 },
  { t:"X31L6", em:"2026-01-30", vt:"2026-07-31", ced:"2026-01-16", ce:685.551, cvd:"2026-07-17", dp:112.9 },
  { t:"X30S6", em:"2026-03-16", vt:"2026-09-30", ced:"2026-03-02", ce:714.985, cvd:"2026-09-16", dp:107.8 },
  { t:"TZXO6", em:"2024-10-31", vt:"2026-10-30", ced:"2024-10-17", ce:480.153, cvd:"2026-10-16", dp:159.7 },
  { t:"X30N6", em:"2025-12-15", vt:"2026-11-30", ced:"2025-11-28", ce:659.679, cvd:"2026-11-13", dp:115.7 },
  { t:"TZXD6", em:"2024-03-15", vt:"2026-12-15", ced:"2024-03-01", ce:271.048, cvd:"2026-11-27", dp:281.25 },
  { t:"TZXM7", em:"2024-05-20", vt:"2027-03-31", ced:"2024-05-06", ce:361.318, cvd:"2027-03-12", dp:210.1 },
  { t:"TZXA7", em:"2025-11-28", vt:"2027-04-30", ced:"2025-11-12", ce:651.898, cvd:"2027-04-16", dp:116 },
  { t:"TZXY7", em:"2025-12-15", vt:"2027-05-31", ced:"2025-11-28", ce:659.679, cvd:"2027-05-14", dp:113.6 },
  { t:"TZX27", em:"2024-02-01", vt:"2027-06-30", ced:"2024-01-18", ce:200.388, cvd:"2027-06-15", dp:374.55 },
  { t:"TZXS7", em:"2026-03-31", vt:"2027-09-30", ced:"2026-03-13", ce:723.060, cvd:"2027-09-16", dp:99.45 },
  { t:"TZXD7", em:"2024-03-15", vt:"2027-12-15", ced:"2024-03-01", ce:271.048, cvd:"2027-11-30", dp:257.4 },
];

const DEFAULT_INFLATION: Record<string, number> = {
  "2026-05":.022,"2026-06":.022,"2026-07":.022,"2026-08":.020,"2026-09":.020,"2026-10":.019,"2026-11":.019,"2026-12":.018,
  "2027-01":.015,"2027-02":.015,"2027-03":.015,"2027-04":.015,"2027-05":.015,"2027-06":.015,"2027-07":.015,"2027-08":.015,"2027-09":.015,"2027-10":.015,"2027-11":.015,"2027-12":.015,
};

const INFL_LABEL: Record<string, string> = {
  "2026-05":"May 26","2026-06":"Jun 26","2026-07":"Jul 26","2026-08":"Ago 26","2026-09":"Sep 26","2026-10":"Oct 26","2026-11":"Nov 26","2026-12":"Dic 26",
  "2027-01":"Ene 27","2027-02":"Feb 27","2027-03":"Mar 27","2027-04":"Abr 27","2027-05":"May 27","2027-06":"Jun 27","2027-07":"Jul 27","2027-08":"Ago 27","2027-09":"Sep 27","2027-10":"Oct 27","2027-11":"Nov 27","2027-12":"Dic 27",
};

const CER_ANC = 790.94158885550;
const CER_ANC_DATE = new Date(2026, 5, 15);

// ============ HELPERS ============
function pd(s: string): Date { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function fm(d: Date): string { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function dd(a: Date, b: Date): number { return Math.round((a.getTime() - b.getTime()) / 864e5); }
function isW(d: Date): boolean { return d.getDay() === 0 || d.getDay() === 6; }
function aBD(d: Date, n: number): Date {
  const r = new Date(d); let a = 0;
  while (a < n) { r.setDate(r.getDate() + 1); if (!isW(r) && !HL.has(fm(r))) a++; }
  return r;
}
function fN(v: number | null, dc: number): string {
  if (v == null || isNaN(v)) return "—";
  const s = v.toFixed(dc), p = s.split(".");
  const i = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return i + "," + (p[1] || "");
}
function fP(v: number | null, dc: number): string {
  if (v == null || isNaN(v)) return "—";
  return fN(v * 100, dc) + "%";
}
function fD(d: Date): string {
  return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
}

interface CERPoint { d15: Date; cer: number; ipc?: number; }

function buildCERChain(inflData: Record<string, number>): CERPoint[] {
  const ch: CERPoint[] = [{ d15: CER_ANC_DATE, cer: CER_ANC }];
  const ks = Object.keys(inflData).sort();
  let prev = CER_ANC;
  for (const k of ks) {
    const ipc = inflData[k];
    const [y, m] = k.split("-").map(Number);
    let em = m + 2, ey = y;
    if (em > 12) { em -= 12; ey++; }
    const nc = prev * (1 + ipc);
    ch.push({ d15: new Date(ey, em - 1, 15), cer: nc, ipc });
    prev = nc;
  }
  return ch;
}

function getCER(td: Date, ch: CERPoint[]): number {
  const t = td.getTime();
  if (t <= ch[0].d15.getTime()) return ch[0].cer;
  if (t >= ch[ch.length - 1].d15.getTime()) return ch[ch.length - 1].cer;
  for (let i = 1; i < ch.length; i++) {
    const s = ch[i - 1].d15, e = ch[i].d15;
    if (t >= s.getTime() && t <= e.getTime()) {
      const tot = dd(e, s), el = dd(td, s);
      if (!tot) return ch[i - 1].cer;
      return ch[i - 1].cer * Math.pow(1 + (ch[i].ipc || 0), el / tot);
    }
  }
  return ch[ch.length - 1].cer;
}

function calcY(pr: number, pf: number, dias: number) {
  if (!pr || pr <= 0 || dias <= 0) return { td: 0, dur: 0, tna: 0, tea: 0, tem: 0 };
  const td = pf / pr - 1;
  const dur = dias / 365;
  const tna = dur ? td / dur : 0;
  const tea = dur ? Math.pow(1 + td, 1 / dur) - 1 : 0;
  const tem = Math.pow(1 + tea, 1 / 12) - 1;
  return { td, dur, tna, tea, tem };
}

type Metric = "tna" | "tea" | "tem";
type Status = "loading" | "ok" | "error";

const METRIC_LABEL: Record<Metric, string> = { tna: "TNA", tea: "TEA", tem: "TEM" };

export default function AnalisisCer() {
  const today = useMemo(() => fm(new Date()), []);
  const [opDate, setOpDate] = useState<string>(today);
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>(
    Object.fromEntries([...TF, ...CR].map(b => [b.t, b.dp]))
  );
  const [lockedPrices, setLockedPrices] = useState<Record<string, number>>({});
  const [editingTicker, setEditingTicker] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [inflData, setInflData] = useState<Record<string, number>>({ ...DEFAULT_INFLATION });
  const [inflInputs, setInflInputs] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(DEFAULT_INFLATION).map(([k, v]) => [k, (v * 100).toFixed(1).replace(".", ",")]))
  );
  const [activeMetric, setActiveMetric] = useState<Metric>("tna");
  const [status, setStatus] = useState<Status>("loading");
  const [statusText, setStatusText] = useState("Conectando…");

  const liqDate = useMemo(() => fm(aBD(pd(opDate), 1)), [opDate]);

  const fetchLive = useCallback(async () => {
    setStatus("loading");
    setStatusText("Actualizando…");
    try {
      const live = await fetchLiveBondPrices();
      const tickers = new Set([...TF, ...CR].map(b => b.t));
      const updates: Record<string, number> = {};
      for (const item of live) {
        const sym = (item.symbol || "").replace(/\s/g, "");
        if (tickers.has(sym) && item.c && item.c > 0) {
          updates[sym] = item.c;
        }
      }
      setMarketPrices(prev => ({ ...prev, ...updates }));
      setStatus("ok");
      const now = new Date();
      setStatusText("OK " + String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0"));
    } catch {
      setStatus("error");
      setStatusText("Error de conexión");
    }
  }, []);

  const fetchHistorical = useCallback(async (ds: string) => {
    setStatus("loading");
    setStatusText("Buscando históricos…");
    try {
      const updates: Record<string, number> = {};
      await Promise.all([...TF, ...CR].map(async (b) => {
        try {
          const prices = await fetchBondPrices(b.t);
          const entry = prices.find((p: any) => p.date === ds);
          if (entry && entry.c && entry.c > 0) updates[b.t] = entry.c;
        } catch {}
      }));
      setMarketPrices(prev => ({ ...prev, ...updates }));
      setStatus("ok");
      setStatusText("Histórico cargado");
    } catch {
      setStatus("error");
      setStatusText("Error histórico");
    }
  }, []);

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 180000);
    return () => clearInterval(interval);
  }, [fetchLive]);

  useEffect(() => {
    if (opDate === today) fetchLive();
    else fetchHistorical(opDate);
  }, [opDate, today, fetchLive, fetchHistorical]);

  const getPrice = (tk: string): number => {
    if (lockedPrices[tk] != null) return lockedPrices[tk];
    if (marketPrices[tk] != null) return marketPrices[tk];
    const b = [...TF, ...CR].find(x => x.t === tk);
    return b ? b.dp : 0;
  };

  const startEdit = (tk: string) => {
    setEditingTicker(tk);
    setEditValue(getPrice(tk).toFixed(3).replace(".", ","));
  };

  const saveEdit = () => {
    if (!editingTicker) return;
    const v = parseFloat(editValue.replace(",", ".").trim());
    if (!isNaN(v) && v > 0) {
      setLockedPrices(prev => ({ ...prev, [editingTicker]: v }));
    }
    setEditingTicker(null);
  };

  const resetPrice = (tk: string) => {
    setLockedPrices(prev => {
      const next = { ...prev };
      delete next[tk];
      return next;
    });
  };

  const handleInflChange = (k: string, raw: string) => {
    const cleaned = raw.replace(/[^0-9.,]/g, "");
    setInflInputs(prev => ({ ...prev, [k]: cleaned }));
  };

  const commitInfl = (k: string) => {
    const raw = inflInputs[k] ?? "";
    const normalized = raw.replace(",", ".").trim();
    const v = parseFloat(normalized);
    if (!isNaN(v) && v >= 0 && v <= 50) {
      setInflData(prev => ({ ...prev, [k]: v / 100 }));
      setInflInputs(prev => ({ ...prev, [k]: v.toFixed(1).replace(".", ",") }));
    } else {
      setInflInputs(prev => ({ ...prev, [k]: (inflData[k] * 100).toFixed(1).replace(".", ",") }));
    }
  };

  const cerChain = useMemo(() => buildCERChain(inflData), [inflData]);
  const liqDateObj = useMemo(() => pd(liqDate), [liqDate]);

  const tfRows = useMemo(() => TF.map(b => {
    const vd = pd(b.vt);
    const dias = dd(vd, liqDateObj);
    const pr = getPrice(b.t);
    const y = calcY(pr, b.pf, dias);
    return { ...b, vd, dias, pr, pf: b.pf, ...y, isLocked: lockedPrices[b.t] != null };
  }), [marketPrices, lockedPrices, liqDateObj]);

  const crRows = useMemo(() => CR.map(b => {
    const vd = pd(b.vt);
    const cvd = pd(b.cvd);
    const dias = dd(vd, liqDateObj);
    const pr = getPrice(b.t);
    const cerV = getCER(cvd, cerChain);
    const pf = 100 * (cerV / b.ce);
    const y = calcY(pr, pf, dias);
    return { ...b, vd, dias, pr, pf, ...y, isLocked: lockedPrices[b.t] != null };
  }), [marketPrices, lockedPrices, cerChain, liqDateObj]);

  const chartData = useMemo(() => {
    const tfPoints = tfRows
      .filter(r => r.dias > 0 && r.dur > 0)
      .map(r => ({ x: r.dur, y: r[activeMetric] * 100, label: r.t }))
      .sort((a, b) => a.x - b.x);
    const crPoints = crRows
      .filter(r => r.dias > 0 && r.dur > 0)
      .map(r => ({ x: r.dur, y: r[activeMetric] * 100, label: r.t }))
      .sort((a, b) => a.x - b.x);
    return { tfPoints, crPoints };
  }, [tfRows, crRows, activeMetric]);

  const yDomain = useMemo<[number, number]>(() => {
    const allValues = [...chartData.tfPoints, ...chartData.crPoints].map(p => p.y);
    if (allValues.length === 0) return [0, 50];
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min;
    const padding = Math.max(range * 0.18, 2);
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [chartData]);

  const statusColor =
    status === "ok" ? "bg-green-500" :
    status === "error" ? "bg-red-500" : "bg-yellow-500";

  return (
    <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Curvas Proyectadas — <span className="text-primary">CER</span> vs <span className="text-accent">Tasa Fija</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pricing implícito con proyección de inflación · editá precios y supuestos en vivo
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs">
              <label className="text-muted-foreground">Operación:</label>
              <input
                type="date"
                value={opDate}
                onChange={(e) => setOpDate(e.target.value)}
                className="bg-card border border-border rounded px-2 py-1 text-foreground text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <label className="text-muted-foreground">Liquidación:</label>
              <input
                type="date"
                value={liqDate}
                readOnly
                className="bg-card border border-border rounded px-2 py-1 text-muted-foreground text-xs opacity-70"
              />
            </div>
            <button
              onClick={fetchLive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${status === "loading" ? "animate-spin" : ""}`} />
              Actualizar
            </button>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${statusColor} ${status === "loading" ? "animate-pulse" : ""}`} />
              <span className="text-[10px] text-muted-foreground font-mono">{statusText}</span>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] gap-4">
          {/* Left: Table */}
          <div className="rounded-lg border border-border bg-card overflow-hidden min-w-0">
            <div className="overflow-x-auto max-h-[78vh]">
              <table className="w-full text-xs font-mono">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-muted/40 border-b border-border">
                    {["Ticker","Vto.","Días","Precio","Pago Final","T.Dir.","Dur.","TNA","TEA","TEM"].map(h => (
                      <th key={h} className="px-2 py-2 text-primary font-semibold text-center whitespace-nowrap text-[11px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-primary/10 border-b-2 border-primary/30">
                    <td colSpan={10} className="px-3 py-1.5 text-primary font-bold text-xs uppercase tracking-wider text-left">
                      Tasa Fija
                    </td>
                  </tr>
                  {tfRows.map(r => (
                    <tr key={r.t} className="border-b border-border/40 hover:bg-secondary/10 transition-colors">
                      <td className="px-2 py-1.5 text-left font-bold text-primary whitespace-nowrap">{r.t}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground whitespace-nowrap">{fD(r.vd)}</td>
                      <td className="px-2 py-1.5 text-center text-muted-foreground">{r.dias}</td>
                      <td className="px-2 py-1.5 text-right whitespace-nowrap">
                        {editingTicker === r.t ? (
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => { if (e.key === "Enter") { saveEdit(); e.preventDefault(); } }}
                            className="bg-background border border-primary rounded px-1 py-0.5 w-16 text-right text-foreground"
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <span className={r.isLocked ? "text-primary font-bold" : "text-green-400 font-bold"}>
                              {fN(r.pr, 3)}
                            </span>
                            <button onClick={() => startEdit(r.t)} className="opacity-40 hover:opacity-100 transition-opacity" title="Editar precio">
                              <Pencil className="h-2.5 w-2.5" />
                            </button>
                            {r.isLocked && (
                              <button onClick={() => resetPrice(r.t)} className="opacity-60 hover:opacity-100 transition-opacity text-destructive" title="Volver a mercado">
                                <RotateCcw className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-right text-foreground whitespace-nowrap">{fN(r.pf, 3)}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground whitespace-nowrap">{fP(r.td, 2)}</td>
                      <td className="px-2 py-1.5 text-right text-foreground whitespace-nowrap">{fN(r.dur, 2)}</td>
                      <td className="px-2 py-1.5 text-right text-primary font-semibold whitespace-nowrap">{fP(r.tna, 2)}</td>
                      <td className="px-2 py-1.5 text-right text-foreground whitespace-nowrap">{fP(r.tea, 2)}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground whitespace-nowrap">{fP(r.tem, 2)}</td>
                    </tr>
                  ))}

                  <tr className="bg-accent/10 border-b-2 border-accent/30">
                    <td colSpan={10} className="px-3 py-1.5 text-accent font-bold text-xs uppercase tracking-wider text-left">
                      Bonos CER
                    </td>
                  </tr>
                  {crRows.map(r => (
                    <tr key={r.t} className="border-b border-border/40 hover:bg-secondary/10 transition-colors bg-accent/[0.02]">
                      <td className="px-2 py-1.5 text-left font-bold text-accent whitespace-nowrap">{r.t}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground whitespace-nowrap">{fD(r.vd)}</td>
                      <td className="px-2 py-1.5 text-center text-muted-foreground">{r.dias}</td>
                      <td className="px-2 py-1.5 text-right whitespace-nowrap">
                        {editingTicker === r.t ? (
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => { if (e.key === "Enter") { saveEdit(); e.preventDefault(); } }}
                            className="bg-background border border-accent rounded px-1 py-0.5 w-16 text-right text-foreground"
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <span className={r.isLocked ? "text-accent font-bold" : "text-green-400 font-bold"}>
                              {fN(r.pr, 3)}
                            </span>
                            <button onClick={() => startEdit(r.t)} className="opacity-40 hover:opacity-100 transition-opacity" title="Editar precio">
                              <Pencil className="h-2.5 w-2.5" />
                            </button>
                            {r.isLocked && (
                              <button onClick={() => resetPrice(r.t)} className="opacity-60 hover:opacity-100 transition-opacity text-destructive" title="Volver a mercado">
                                <RotateCcw className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-right text-foreground whitespace-nowrap">{fN(r.pf, 3)}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground whitespace-nowrap">{fP(r.td, 2)}</td>
                      <td className="px-2 py-1.5 text-right text-foreground whitespace-nowrap">{fN(r.dur, 2)}</td>
                      <td className="px-2 py-1.5 text-right text-accent font-semibold whitespace-nowrap">{fP(r.tna, 2)}</td>
                      <td className="px-2 py-1.5 text-right text-foreground whitespace-nowrap">{fP(r.tea, 2)}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground whitespace-nowrap">{fP(r.tem, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Chart + Inflation */}
          <div className="flex flex-col gap-4 min-w-0">
            <div className="rounded-lg border border-border bg-card p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Curva {METRIC_LABEL[activeMetric]} — Duration vs {METRIC_LABEL[activeMetric]} (%)
                </h3>
                <div className="flex items-center gap-0 rounded-md overflow-hidden border border-border">
                  {(["tna","tea","tem"] as Metric[]).map(m => (
                    <button
                      key={m}
                      onClick={() => setActiveMetric(m)}
                      className={`px-3 py-1 text-xs font-semibold transition-colors ${
                        activeMetric === m
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                      }`}
                    >
                      {METRIC_LABEL[m]}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={380}>
                <ScatterChart margin={{ top: 10, right: 30, bottom: 40, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Duration"
                    domain={[0, "dataMax"]}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    tickFormatter={(v) => v.toFixed(1).replace(".", ",")}
                  >
                    <Label value="Duration (años)" position="insideBottom" offset={-25}
                      style={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }} />
                  </XAxis>
                  <YAxis
                    type="number"
                    dataKey="y"
                    name={METRIC_LABEL[activeMetric]}
                    domain={yDomain}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    tickFormatter={(v) => v.toFixed(1).replace(".", ",") + "%"}
                    width={55}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3", stroke: "hsl(var(--border))" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const p: any = payload[0].payload;
                      const color = payload[0].name === "Tasa Fija" ? "hsl(var(--primary))" : "hsl(var(--accent))";
                      return (
                        <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-lg">
                          <p className="font-bold text-foreground mb-0.5">{p.label}</p>
                          <p style={{ color }} className="font-mono">Dur: {p.x.toFixed(2).replace(".", ",")} años</p>
                          <p style={{ color }} className="font-mono">
                            {METRIC_LABEL[activeMetric]}: {p.y.toFixed(2).replace(".", ",")}%
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend verticalAlign="top" align="right" height={30} iconType="circle"
                    wrapperStyle={{ fontSize: 11, paddingBottom: 4 }} />
                  <Scatter name="Tasa Fija" data={chartData.tfPoints} fill="hsl(var(--primary))" />
                  <Scatter name="CER" data={chartData.crPoints} fill="hsl(var(--accent))" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 flex-1">
              <h3 className="text-sm font-semibold text-accent mb-3 flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                Inflación Mensual Proyectada (IPC %)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-2">
                {Object.keys(inflData).sort().map(k => (
                  <div key={k} className="flex items-center gap-2 bg-background/40 border border-border/50 rounded px-2 py-1.5 hover:border-accent/40 transition-colors">
                    <label className="text-xs text-muted-foreground font-medium flex-1">{INFL_LABEL[k] || k}</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={inflInputs[k] ?? ""}
                      onChange={(e) => handleInflChange(k, e.target.value)}
                      onBlur={() => commitInfl(k)}
                      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                      onFocus={(e) => e.target.select()}
                      className="bg-background border border-border/50 rounded px-1.5 py-0.5 w-14 text-right text-xs font-bold text-accent focus:outline-none focus:border-accent"
                    />
                    <span className="text-[10px] text-muted-foreground">%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center pt-2">
          CER ancla: {CER_ANC.toFixed(8)} al {fD(CER_ANC_DATE)} · Fuente precios: data912.com · Proyección de CER por interpolación lineal mensual sobre IPC estimado.
        </p>
    </div>
  );
}
