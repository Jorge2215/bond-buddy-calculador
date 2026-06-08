import { useState, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";
import { fetchLiveBondPrices, type LiveBondPrice } from "@/lib/apiServices";
import { calculateBond } from "@/lib/bondCalculator";
import {
  SIOPEL, MINIDASH_BONDS, CAUCION_1D, CAUCION_7D, CLEAN_PRICED_BONDS,
} from "@/lib/marketData/BASE_MINIDASH";
import { RefreshCw, ImageDown } from "lucide-react";

// ============ HELPERS ============
function pd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function fN(v: number | null | undefined, dc = 2): string {
  if (v == null || !isFinite(v)) return "—";
  return v.toLocaleString("es-AR", { minimumFractionDigits: dc, maximumFractionDigits: dc });
}
function fP(v: number | null | undefined, dc = 2): string {
  if (v == null || !isFinite(v)) return "—";
  return fN(v * 100, dc) + "%";
}

// Buscar la fecha anterior con datos para una serie
function prevDateInSeries<T>(series: Record<string, T>, date: string): string | null {
  const dates = Object.keys(series).sort();
  const idx = dates.indexOf(date);
  if (idx > 0) return dates[idx - 1];
  // Si la fecha exacta no existe, buscar la última anterior a 'date'
  for (let i = dates.length - 1; i >= 0; i--) {
    if (dates[i] < date) return dates[i];
  }
  return null;
}

// Resuelve clean → dirty usando residual + accrued del bondCalculator
function dirtyFromClean(bondId: string, settlement: Date, clean: number): number | null {
  try {
    // Llamada dummy para extraer residual & accrued (no dependen del precio)
    const r = calculateBond(bondId, settlement, 100, 0.1);
    const residual = r.indicators.residualValue;
    const accrued = r.indicators.accruedInterest;
    return clean * residual + accrued;
  } catch {
    return null;
  }
}

function computeTir(bondId: string, settlement: Date, dirty: number): number | null {
  try {
    const r = calculateBond(bondId, settlement, dirty, 0.1);
    return r.indicators.tir;
  } catch {
    return null;
  }
}

// TNA 180/360 (Excel TASA.NOMINAL con 2 períodos): 2 × ((1 + TEA)^(1/2) − 1)
function tirToTna(tir: number | null): number | null {
  if (tir == null || !isFinite(tir)) return null;
  return 2 * (Math.pow(1 + tir, 0.5) - 1);
}

// ============ DATOS ESTÁTICOS ============
const BOND_ROWS = [
  { id: "GD29", label: "GD29" },
  { id: "GD30", label: "GD30" },
  { id: "GD35", label: "GD35" },
  { id: "GD38", label: "GD38" },
  { id: "GD41", label: "GD41" },
  { id: "GD46", label: "GD46" },
  { id: "AO27", label: "AO27" },
  { id: "AN29", label: "AN29" },
  { id: "AL30", label: "AL30" },
  { id: "AE38", label: "AE38" },
  { id: "BPOC7", label: "BPO27 1C" },
  { id: "BPOD7", label: "BPO27 1D" },
];

// Última fecha disponible en SIOPEL (sirve como "hoy")
const LATEST_DATE = Object.keys(SIOPEL).sort().slice(-1)[0];
const EARLIEST_DATE = Object.keys(SIOPEL).sort()[0];

// ============ COMPONENT ============
type Status = "loading" | "ok" | "error";

export default function MiniDashboard() {
  const [selectedDate, setSelectedDate] = useState<string>(LATEST_DATE);
  const [livePrices, setLivePrices] = useState<LiveBondPrice[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [statusText, setStatusText] = useState("Conectando…");
  const [exporting, setExporting] = useState(false);
  const { theme } = useTheme();

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

  const handleExport = () => {
    setExporting(true);
    try {
      const dataUrl = generateTableroPng({
        selectedDate, siopelData, fxLive, bondRows,
        caucionD1, caucionD7,
        isLight: theme === "light",
      });
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.download = `tablero_${selectedDate}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Export error:", e);
      alert("Error al exportar imagen: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setExporting(false);
    }
  };

  const isToday = selectedDate === LATEST_DATE;
  const settlementDate = pd(selectedDate);

  // ===== FX: SIOPEL =====
  const siopelData = useMemo(() => {
    const today = SIOPEL[selectedDate];
    if (!today) return null;
    const prevDate = prevDateInSeries(SIOPEL, selectedDate);
    const prev = prevDate ? SIOPEL[prevDate] : null;
    // var %1D basado en Ask (consistente con el resto de los bonos)
    const var1d = prev && prev.a ? today.a / prev.a - 1 : null;
    return { bid: today.b, ask: today.a, var1d };
  }, [selectedDate]);

  // ===== FX: CCL/MEP from data912 LIVE =====
  const findLive = (sym: string) => livePrices.find(p => p.symbol === sym);

  const fxLive = useMemo(() => {
    const al30 = findLive("AL30");     // ARS
    const al30c = findLive("AL30C");   // CCL/USD
    const al30d = findLive("AL30D");   // MEP/USD

    function compute(ars: LiveBondPrice | undefined, usd: LiveBondPrice | undefined) {
      if (!ars || !usd) return null;
      // MEP/CCL redondeados al entero más cercano (Math.round: <0.50 → abajo, >=0.50 → arriba)
      const rawBid = ars.px_bid > 0 && usd.px_ask > 0 ? ars.px_bid / usd.px_ask : null;
      const rawAsk = ars.px_ask > 0 && usd.px_bid > 0 ? ars.px_ask / usd.px_bid : null;
      const rawLast = ars.c > 0 && usd.c > 0 ? ars.c / usd.c : null;
      const bid = rawBid != null ? Math.round(rawBid) : null;
      const ask = rawAsk != null ? Math.round(rawAsk) : null;
      const last = rawLast != null ? Math.round(rawLast) : null;
      return { bid, ask, last };
    }

    return { ccl: compute(al30, al30c), mep: compute(al30, al30d) };
  }, [livePrices]);

  // ===== TÍTULOS =====
  const bondRows = useMemo(() => BOND_ROWS.map(b => {
    const series = MINIDASH_BONDS[b.id];
    const today = series?.[selectedDate];
    if (!today) {
      return { ...b, bid: null, ask: null, tirBid: null, tirAsk: null, tnaBid: null, tnaAsk: null, var1d: null };
    }
    const isClean = CLEAN_PRICED_BONDS.has(b.id);
    const bidDirty = isClean ? dirtyFromClean(b.id, settlementDate, today.b) : today.b;
    const askDirty = isClean ? dirtyFromClean(b.id, settlementDate, today.a) : today.a;
    const tirBid = bidDirty != null ? computeTir(b.id, settlementDate, bidDirty) : null;
    const tirAsk = askDirty != null ? computeTir(b.id, settlementDate, askDirty) : null;
    const tnaBid = tirToTna(tirBid);
    const tnaAsk = tirToTna(tirAsk);
    const prevDate = prevDateInSeries(series, selectedDate);
    const prev = prevDate ? series[prevDate] : null;
    const var1d = prev ? today.a / prev.a - 1 : null;
    return { ...b, bid: today.b, ask: today.a, tirBid, tirAsk, tnaBid, tnaAsk, var1d };
  }), [selectedDate, settlementDate]);

  // ===== CAUCIONES =====
  const caucionD1 = CAUCION_1D[selectedDate] ?? prevValue(CAUCION_1D, selectedDate);
  const caucionD7 = CAUCION_7D[selectedDate] ?? prevValue(CAUCION_7D, selectedDate);

  const statusColor =
    status === "ok" ? "bg-green-500" :
    status === "error" ? "bg-red-500" : "bg-yellow-500";

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Mini Dashboard</h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <label className="text-muted-foreground">Fecha:</label>
            <input
              type="date"
              value={selectedDate}
              min={EARLIEST_DATE}
              max={LATEST_DATE}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-card border border-border rounded px-2 py-1 text-foreground text-xs focus:outline-none focus:border-primary"
            />
            {!isToday && (
              <button
                onClick={() => setSelectedDate(LATEST_DATE)}
                className="text-[10px] text-primary hover:underline"
              >
                hoy
              </button>
            )}
          </div>
          <button
            onClick={fetchLive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${status === "loading" ? "animate-spin" : ""}`} />
            Actualizar
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent/15 text-accent hover:bg-accent/25 transition-colors text-xs font-medium disabled:opacity-50"
            title="Exportar tablero como imagen PNG"
          >
            <ImageDown className={`h-3.5 w-3.5 ${exporting ? "animate-pulse" : ""}`} />
            {exporting ? "Generando…" : "Exportar imagen"}
          </button>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${statusColor} ${status === "loading" ? "animate-pulse" : ""}`} />
            <span className="text-[10px] text-muted-foreground font-mono">{statusText}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* ===== FX ===== */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="bg-muted/40 px-3 py-2 border-b border-border">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">FX</h3>
          </div>
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="bg-muted/20 border-b border-border">
                <th className="px-3 py-1.5 text-left text-[10px] text-muted-foreground font-semibold">Tipo</th>
                <th className="px-3 py-1.5 text-right text-[10px] text-muted-foreground font-semibold">Bid</th>
                <th className="px-3 py-1.5 text-right text-[10px] text-muted-foreground font-semibold">Ask</th>
                <th className="px-3 py-1.5 text-right text-[10px] text-muted-foreground font-semibold">Brecha</th>
                <th className="px-3 py-1.5 text-right text-[10px] text-muted-foreground font-semibold">Var% 1D</th>
              </tr>
            </thead>
            <tbody>
              {/* SIOPEL */}
              <tr className="border-b border-border/40 hover:bg-secondary/10">
                <td className="px-3 py-2 text-left font-bold text-primary">SIOPEL</td>
                <td className="px-3 py-2 text-right text-foreground">{fN(siopelData?.bid, 1)}</td>
                <td className="px-3 py-2 text-right text-foreground">{fN(siopelData?.ask, 1)}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">—</td>
                <td className={`px-3 py-2 text-right font-semibold ${siopelData?.var1d == null ? 'text-muted-foreground' : siopelData.var1d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {fP(siopelData?.var1d, 1)}
                </td>
              </tr>
              {/* CCL */}
              <tr className="border-b border-border/40 hover:bg-secondary/10">
                <td className="px-3 py-2 text-left font-bold text-primary">CCL</td>
                <td className="px-3 py-2 text-right text-foreground">{fN(fxLive.ccl?.bid, 0)}</td>
                <td className="px-3 py-2 text-right text-foreground">{fN(fxLive.ccl?.ask, 0)}</td>
                <td className="px-3 py-2 text-right text-foreground">
                  {fxLive.ccl?.ask != null && siopelData?.ask
                    ? fP(fxLive.ccl.ask / siopelData.ask - 1, 1)
                    : "—"}
                </td>
                <td className="px-3 py-2 text-right text-muted-foreground">—</td>
              </tr>
              {/* MEP */}
              <tr className="hover:bg-secondary/10">
                <td className="px-3 py-2 text-left font-bold text-primary">MEP</td>
                <td className="px-3 py-2 text-right text-foreground">{fN(fxLive.mep?.bid, 0)}</td>
                <td className="px-3 py-2 text-right text-foreground">{fN(fxLive.mep?.ask, 0)}</td>
                <td className="px-3 py-2 text-right text-foreground">
                  {fxLive.mep?.ask != null && siopelData?.ask
                    ? fP(fxLive.mep.ask / siopelData.ask - 1, 1)
                    : "—"}
                </td>
                <td className="px-3 py-2 text-right text-muted-foreground">—</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ===== CAUCIONES ===== */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="bg-muted/40 px-3 py-2 border-b border-border">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Cauciones</h3>
          </div>
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="bg-muted/20 border-b border-border">
                <th className="px-3 py-1.5 text-left text-[10px] text-muted-foreground font-semibold">Plazo</th>
                <th className="px-3 py-1.5 text-right text-[10px] text-muted-foreground font-semibold">TNA</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/40 hover:bg-secondary/10">
                <td className="px-3 py-2 text-left font-bold text-primary">Caución 1d</td>
                <td className="px-3 py-2 text-right text-foreground">{caucionD1 != null ? fN(caucionD1, 1) + "%" : "—"}</td>
              </tr>
              <tr className="hover:bg-secondary/10">
                <td className="px-3 py-2 text-left font-bold text-primary">Caución 7d</td>
                <td className="px-3 py-2 text-right text-foreground">{caucionD7 != null ? fN(caucionD7, 1) + "%" : "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== TÍTULOS ===== */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="bg-muted/40 px-3 py-2 border-b border-border">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Títulos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="bg-muted/20 border-b border-border">
                <th className="px-3 py-1.5 text-left text-[10px] text-muted-foreground font-semibold">Título</th>
                <th className="px-3 py-1.5 text-right text-[10px] text-muted-foreground font-semibold">TNA Bid</th>
                <th className="px-3 py-1.5 text-right text-[10px] text-muted-foreground font-semibold">Bid</th>
                <th className="px-3 py-1.5 text-right text-[10px] text-muted-foreground font-semibold">Ask</th>
                <th className="px-3 py-1.5 text-right text-[10px] text-muted-foreground font-semibold">TNA Ask</th>
                <th className="px-3 py-1.5 text-right text-[10px] text-muted-foreground font-semibold">Var% 1D</th>
              </tr>
            </thead>
            <tbody>
              {bondRows.map(r => (
                <tr key={r.id} className="border-b border-border/40 hover:bg-secondary/10 last:border-b-0">
                  <td className="px-3 py-2 text-left font-bold text-primary">{r.label}</td>
                  <td className="px-3 py-2 text-right text-foreground">{fP(r.tnaBid, 1)}</td>
                  <td className="px-3 py-2 text-right text-foreground font-bold">{fN(r.bid, 1)}</td>
                  <td className="px-3 py-2 text-right text-foreground font-bold">{fN(r.ask, 1)}</td>
                  <td className="px-3 py-2 text-right text-foreground">{fP(r.tnaAsk, 1)}</td>
                  <td className={`px-3 py-2 text-right font-semibold ${r.var1d == null ? 'text-muted-foreground' : r.var1d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {fP(r.var1d, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </main>
    </div>
  );
}

// Helper: para CAUCION_*, si la fecha no existe usar el último anterior
function prevValue(series: Record<string, number>, date: string): number | null {
  const dates = Object.keys(series).sort();
  for (let i = dates.length - 1; i >= 0; i--) {
    if (dates[i] <= date) return series[dates[i]];
  }
  return null;
}

// ============ CANVAS PNG GENERATOR ============
// Dibuja el tablero directo en canvas — no depende de fonts externas ni CSS vars.

interface GenArgs {
  selectedDate: string;
  siopelData: { bid: number; ask: number; var1d: number | null } | null;
  fxLive: {
    ccl: { bid: number | null; ask: number | null; last: number | null } | null;
    mep: { bid: number | null; ask: number | null; last: number | null } | null;
  };
  bondRows: Array<{
    id: string; label: string;
    bid: number | null; ask: number | null;
    tirBid: number | null; tirAsk: number | null;
    tnaBid: number | null; tnaAsk: number | null;
    var1d: number | null;
  }>;
  caucionD1: number | null;
  caucionD7: number | null;
  isLight: boolean;
}

function fmtDateLong(d: string): string {
  const [y, m, day] = d.split("-");
  const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(day));
  return `${dias[dt.getDay()]} ${day}/${m}/${y.slice(2)}`;
}

function generateTableroPng(args: GenArgs): string {
  const { selectedDate, siopelData, fxLive, bondRows, caucionD1, caucionD7, isLight } = args;

  // Paleta según tema (matching site theme: dark = default, light = alternate)
  const C = isLight
    ? {
        bg: "#fafafa",
        card: "#ffffff",
        border: "#d4d4d8",
        text: "#18181b",
        muted: "#6b7280",
        primary: "#15803d",
        accent: "#a16207",
        up: "#15803d",
        down: "#b91c1c",
      }
    : {
        bg: "#0b0d10",
        card: "#15171c",
        border: "#2a2d33",
        text: "#e6e6e6",
        muted: "#8b8e95",
        primary: "#4ade80",
        accent: "#facc15",
        up: "#22c55e",
        down: "#f87171",
      };

  // Layout constants
  const W = 640;
  const PAD = 16;
  const SCALE = 2; // 2× para retina
  const FONT = `Roboto, system-ui, sans-serif`;

  // Pre-calculate height
  const headerH = 46;
  const sectionGap = 10;
  const sectionTitleH = 26;
  const tableHeaderH = 22;
  const rowH = 22;
  const cardPad = 8;

  let H = PAD;
  H += headerH + sectionGap;
  // FX: title + header + 3 rows
  H += cardPad + sectionTitleH + tableHeaderH + 3 * rowH + cardPad + sectionGap;
  // Títulos: title + header + 12 rows
  H += cardPad + sectionTitleH + tableHeaderH + bondRows.length * rowH + cardPad + sectionGap;
  // Cauciones (compact)
  H += cardPad + sectionTitleH + tableHeaderH + 2 * rowH + cardPad + sectionGap;
  // Footer
  H += 14 + PAD;

  // Create canvas at 2× resolution
  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.scale(SCALE, SCALE);

  // Helper: format number/percentage
  const fNum = (v: number | null | undefined, dec = 2): string => {
    if (v == null || !isFinite(v)) return "—";
    return v.toLocaleString("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  };
  const fPct = (v: number | null | undefined, dec = 2): string => {
    if (v == null || !isFinite(v)) return "—";
    return fNum(v * 100, dec) + "%";
  };
  const colorVar = (v: number | null | undefined): string => {
    if (v == null || !isFinite(v)) return C.muted;
    return v >= 0 ? C.up : C.down;
  };

  // Helper: draw text at (x, y) with alignment
  const text = (str: string, x: number, y: number, opts: { color?: string; font?: string; align?: CanvasTextAlign } = {}) => {
    ctx.fillStyle = opts.color || C.text;
    ctx.font = opts.font || `11px ${FONT}`;
    ctx.textAlign = opts.align || "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(str, x, y);
  };

  // Helper: rounded rect
  const roundRect = (x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  // Helper: horizontal line
  const hline = (x1: number, x2: number, y: number, color = C.border) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  };

  // ============ Fill background ============
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  let y = PAD;

  // ============ HEADER ============
  text("Tablero de Mercado", PAD, y + 14, { font: `bold 16px ${FONT}`, color: C.text });
  text(fmtDateLong(selectedDate), W - PAD, y + 14, { font: `13px ${FONT}`, color: C.text, align: "right" });
  // Timestamp del momento de captura
  const now = new Date();
  const ts = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0") + ":" + String(now.getSeconds()).padStart(2, "0");
  text("Captura " + ts + " hs", W - PAD, y + 31, { font: `10px ${FONT}`, color: C.muted, align: "right" });
  y += headerH;
  hline(PAD, W - PAD, y - 4);
  y += sectionGap - 4;

  // ============ FX SECTION ============
  const fxW = W - 2 * PAD;
  const fxRows = 3;
  const fxHeight = sectionTitleH + tableHeaderH + fxRows * rowH + 2 * cardPad;
  roundRect(PAD, y, fxW, fxHeight, 6, C.card, C.border);

  let cy = y + cardPad;
  text("FX", PAD + 10, cy + 14, { font: `bold 11px ${FONT}`, color: C.accent });
  cy += sectionTitleH - cardPad;
  hline(PAD + 10, PAD + fxW - 10, cy);

  // Column x-positions (right edges for right-aligned cells)
  const fxCols = {
    label: PAD + 12,
    bid: PAD + 200,
    ask: PAD + 320,
    brecha: PAD + 450,
    var: PAD + fxW - 12,
  };

  // Headers
  cy += tableHeaderH - 6;
  text("TIPO", fxCols.label, cy, { font: `9.5px ${FONT}`, color: C.muted });
  text("BID", fxCols.bid, cy, { font: `9.5px ${FONT}`, color: C.muted, align: "right" });
  text("ASK", fxCols.ask, cy, { font: `9.5px ${FONT}`, color: C.muted, align: "right" });
  text("BRECHA", fxCols.brecha, cy, { font: `9.5px ${FONT}`, color: C.muted, align: "right" });
  text("VAR% 1D", fxCols.var, cy, { font: `9.5px ${FONT}`, color: C.muted, align: "right" });
  cy += 8;
  hline(PAD + 10, PAD + fxW - 10, cy);

  // Row: SIOPEL
  cy += rowH - 6;
  text("SIOPEL", fxCols.label, cy, { font: `bold 11px ${FONT}`, color: C.primary });
  text(fNum(siopelData?.bid, 1), fxCols.bid, cy, { align: "right" });
  text(fNum(siopelData?.ask, 1), fxCols.ask, cy, { align: "right" });
  text("—", fxCols.brecha, cy, { color: C.muted, align: "right" });
  text(fPct(siopelData?.var1d, 1), fxCols.var, cy, { color: colorVar(siopelData?.var1d), font: `bold 11px ${FONT}`, align: "right" });

  // Row: CCL
  cy += rowH;
  text("CCL", fxCols.label, cy, { font: `bold 11px ${FONT}`, color: C.primary });
  text(fNum(fxLive.ccl?.bid, 0), fxCols.bid, cy, { align: "right" });
  text(fNum(fxLive.ccl?.ask, 0), fxCols.ask, cy, { align: "right" });
  const cclBrecha = fxLive.ccl?.ask != null && siopelData?.ask ? fxLive.ccl.ask / siopelData.ask - 1 : null;
  text(fPct(cclBrecha, 1), fxCols.brecha, cy, { align: "right" });
  text("—", fxCols.var, cy, { color: C.muted, align: "right" });

  // Row: MEP
  cy += rowH;
  text("MEP", fxCols.label, cy, { font: `bold 11px ${FONT}`, color: C.primary });
  text(fNum(fxLive.mep?.bid, 0), fxCols.bid, cy, { align: "right" });
  text(fNum(fxLive.mep?.ask, 0), fxCols.ask, cy, { align: "right" });
  const mepBrecha = fxLive.mep?.ask != null && siopelData?.ask ? fxLive.mep.ask / siopelData.ask - 1 : null;
  text(fPct(mepBrecha, 1), fxCols.brecha, cy, { align: "right" });
  text("—", fxCols.var, cy, { color: C.muted, align: "right" });

  y += fxHeight + sectionGap;

  // ============ TÍTULOS SECTION ============
  const tHeight = sectionTitleH + tableHeaderH + bondRows.length * rowH + 2 * cardPad;
  roundRect(PAD, y, fxW, tHeight, 6, C.card, C.border);

  cy = y + cardPad;
  text("TÍTULOS", PAD + 10, cy + 14, { font: `bold 11px ${FONT}`, color: C.accent });
  cy += sectionTitleH - cardPad;
  hline(PAD + 10, PAD + fxW - 10, cy);

  const tCols = {
    label: PAD + 12,
    tnaBid: PAD + 175,
    bid: PAD + 275,
    ask: PAD + 375,
    tnaAsk: PAD + 475,
    var: PAD + fxW - 12,
  };

  cy += tableHeaderH - 6;
  text("TÍTULO", tCols.label, cy, { font: `9.5px ${FONT}`, color: C.muted });
  text("TNA BID", tCols.tnaBid, cy, { font: `9.5px ${FONT}`, color: C.muted, align: "right" });
  text("BID", tCols.bid, cy, { font: `9.5px ${FONT}`, color: C.muted, align: "right" });
  text("ASK", tCols.ask, cy, { font: `9.5px ${FONT}`, color: C.muted, align: "right" });
  text("TNA ASK", tCols.tnaAsk, cy, { font: `9.5px ${FONT}`, color: C.muted, align: "right" });
  text("VAR% 1D", tCols.var, cy, { font: `9.5px ${FONT}`, color: C.muted, align: "right" });
  cy += 8;
  hline(PAD + 10, PAD + fxW - 10, cy);

  for (const r of bondRows) {
    cy += rowH - 6;
    text(r.label, tCols.label, cy, { font: `bold 11px ${FONT}`, color: C.primary });
    text(fPct(r.tnaBid, 1), tCols.tnaBid, cy, { align: "right" });
    text(fNum(r.bid, 1), tCols.bid, cy, { align: "right", font: `bold 11px ${FONT}`, color: C.text });
    text(fNum(r.ask, 1), tCols.ask, cy, { align: "right", font: `bold 11px ${FONT}`, color: C.text });
    text(fPct(r.tnaAsk, 1), tCols.tnaAsk, cy, { align: "right" });
    text(fPct(r.var1d, 1), tCols.var, cy, { color: colorVar(r.var1d), font: `bold 11px ${FONT}`, align: "right" });
    cy += 6; // remaining height of the row
  }

  y += tHeight + sectionGap;

  // ============ CAUCIONES + FOOTER (side by side) ============
  const cauW = 240; // narrower box on the left
  const cauHeight = sectionTitleH + tableHeaderH + 2 * rowH + 2 * cardPad;
  roundRect(PAD, y, cauW, cauHeight, 6, C.card, C.border);

  cy = y + cardPad;
  text("CAUCIONES", PAD + 10, cy + 14, { font: `bold 11px ${FONT}`, color: C.accent });
  cy += sectionTitleH - cardPad;
  hline(PAD + 10, PAD + cauW - 10, cy);

  const cCols = {
    label: PAD + 12,
    val: PAD + cauW - 12,
  };
  cy += tableHeaderH - 6;
  text("PLAZO", cCols.label, cy, { font: `9.5px ${FONT}`, color: C.muted });
  text("TNA", cCols.val, cy, { font: `9.5px ${FONT}`, color: C.muted, align: "right" });
  cy += 8;
  hline(PAD + 10, PAD + cauW - 10, cy);

  cy += rowH - 6;
  text("Caución 1d", cCols.label, cy, { font: `bold 11px ${FONT}`, color: C.primary });
  text(caucionD1 != null ? fNum(caucionD1, 1) + "%" : "—", cCols.val, cy, { align: "right" });

  cy += rowH;
  text("Caución 7d", cCols.label, cy, { font: `bold 11px ${FONT}`, color: C.primary });
  text(caucionD7 != null ? fNum(caucionD7, 1) + "%" : "—", cCols.val, cy, { align: "right" });

  return canvas.toDataURL("image/png");
}
