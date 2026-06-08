import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchLiveBondPrices } from "@/lib/apiServices";
import { RefreshCw, Pencil, RotateCcw, Globe } from "lucide-react";

// ============ SCHEDULES (extraídos del Excel oficial) ============
interface CashFlow {
  date: string;       // YYYY-MM-DD
  interest: number;   // cash amount in USD
  amort: number;      // cash amount in USD
}

interface GlobalBond {
  ticker: string;
  isin: string;
  maturity: string;
  defaultDirty: number;
  schedule: CashFlow[];
}

const GLOBALES: GlobalBond[] = [
  {
    ticker: "GD29", isin: "US040114HX11", maturity: "2029-07-09", defaultDirty: 63.26,
    schedule: [
      { date: "2021-07-09", interest: 0.8472, amort: 0.0 },
      { date: "2022-01-09", interest: 0.5, amort: 0.0 },
      { date: "2022-07-09", interest: 0.5, amort: 0.0 },
      { date: "2023-01-09", interest: 0.5, amort: 0.0 },
      { date: "2023-07-09", interest: 0.5, amort: 0.0 },
      { date: "2024-01-09", interest: 0.5, amort: 0.0 },
      { date: "2024-07-09", interest: 0.5, amort: 0.0 },
      { date: "2025-01-09", interest: 0.5, amort: 10.0 },
      { date: "2025-07-09", interest: 0.45, amort: 10.0 },
      { date: "2026-01-09", interest: 0.4, amort: 10.0 },
      { date: "2026-07-09", interest: 0.35, amort: 10.0 },
      { date: "2027-01-09", interest: 0.3, amort: 10.0 },
      { date: "2027-07-09", interest: 0.25, amort: 10.0 },
      { date: "2028-01-09", interest: 0.2, amort: 10.0 },
      { date: "2028-07-09", interest: 0.15, amort: 10.0 },
      { date: "2029-01-09", interest: 0.1, amort: 10.0 },
      { date: "2029-07-09", interest: 0.05, amort: 10.0 },
    ],
  },
  {
    ticker: "GD30", isin: "US040114HS24", maturity: "2030-07-09", defaultDirty: 63.11,
    schedule: [
      { date: "2021-07-09", interest: 0.1059, amort: 0.0 },
      { date: "2022-01-09", interest: 0.25, amort: 0.0 },
      { date: "2022-07-09", interest: 0.25, amort: 0.0 },
      { date: "2023-01-09", interest: 0.25, amort: 0.0 },
      { date: "2023-07-09", interest: 0.25, amort: 0.0 },
      { date: "2024-01-09", interest: 0.375, amort: 0.0 },
      { date: "2024-07-09", interest: 0.375, amort: 4.0 },
      { date: "2025-01-09", interest: 0.36, amort: 8.0 },
      { date: "2025-07-09", interest: 0.33, amort: 8.0 },
      { date: "2026-01-09", interest: 0.3, amort: 8.0 },
      { date: "2026-07-09", interest: 0.27, amort: 8.0 },
      { date: "2027-01-09", interest: 0.24, amort: 8.0 },
      { date: "2027-07-09", interest: 0.21, amort: 8.0 },
      { date: "2028-01-09", interest: 0.42, amort: 8.0 },
      { date: "2028-07-09", interest: 0.35, amort: 8.0 },
      { date: "2029-01-09", interest: 0.28, amort: 8.0 },
      { date: "2029-07-09", interest: 0.21, amort: 8.0 },
      { date: "2030-01-09", interest: 0.14, amort: 8.0 },
      { date: "2030-07-09", interest: 0.07, amort: 8.0 },
    ],
  },
  {
    ticker: "GD35", isin: "US040114HQ67", maturity: "2035-07-09", defaultDirty: 78.8,
    schedule: [
      { date: "2021-07-09", interest: 0.1059, amort: 0.0 },
      { date: "2022-01-09", interest: 0.5625, amort: 0.0 },
      { date: "2022-07-09", interest: 0.5625, amort: 0.0 },
      { date: "2023-01-09", interest: 0.75, amort: 0.0 },
      { date: "2023-07-09", interest: 0.75, amort: 0.0 },
      { date: "2024-01-09", interest: 1.8125, amort: 0.0 },
      { date: "2024-07-09", interest: 1.8125, amort: 0.0 },
      { date: "2025-01-09", interest: 2.0625, amort: 0.0 },
      { date: "2025-07-09", interest: 2.0625, amort: 0.0 },
      { date: "2026-01-09", interest: 2.0625, amort: 0.0 },
      { date: "2026-07-09", interest: 2.0625, amort: 0.0 },
      { date: "2027-01-09", interest: 2.0625, amort: 0.0 },
      { date: "2027-07-09", interest: 2.0625, amort: 0.0 },
      { date: "2028-01-09", interest: 2.375, amort: 0.0 },
      { date: "2028-07-09", interest: 2.375, amort: 0.0 },
      { date: "2029-01-09", interest: 2.5, amort: 0.0 },
      { date: "2029-07-09", interest: 2.5, amort: 0.0 },
      { date: "2030-01-09", interest: 2.5, amort: 0.0 },
      { date: "2030-07-09", interest: 2.5, amort: 0.0 },
      { date: "2031-01-09", interest: 2.5, amort: 10.0 },
      { date: "2031-07-09", interest: 2.25, amort: 10.0 },
      { date: "2032-01-09", interest: 2.0, amort: 10.0 },
      { date: "2032-07-09", interest: 1.75, amort: 10.0 },
      { date: "2033-01-09", interest: 1.5, amort: 10.0 },
      { date: "2033-07-09", interest: 1.25, amort: 10.0 },
      { date: "2034-01-09", interest: 1.0, amort: 10.0 },
      { date: "2034-07-09", interest: 0.75, amort: 10.0 },
      { date: "2035-01-09", interest: 0.5, amort: 10.0 },
      { date: "2035-07-09", interest: 0.25, amort: 10.0 },
    ],
  },
  {
    ticker: "GD38", isin: "US040114HU79", maturity: "2038-01-09", defaultDirty: 82.53,
    schedule: [
      { date: "2021-07-09", interest: 0.1059, amort: 0.0 },
      { date: "2022-01-09", interest: 1.0, amort: 0.0 },
      { date: "2022-07-09", interest: 1.0, amort: 0.0 },
      { date: "2023-01-09", interest: 1.9375, amort: 0.0 },
      { date: "2023-07-09", interest: 1.9375, amort: 0.0 },
      { date: "2024-01-09", interest: 2.125, amort: 0.0 },
      { date: "2024-07-09", interest: 2.125, amort: 0.0 },
      { date: "2025-01-09", interest: 2.5, amort: 0.0 },
      { date: "2025-07-09", interest: 2.5, amort: 0.0 },
      { date: "2026-01-09", interest: 2.5, amort: 0.0 },
      { date: "2026-07-09", interest: 2.5, amort: 0.0 },
      { date: "2027-01-09", interest: 2.5, amort: 0.0 },
      { date: "2027-07-09", interest: 2.5, amort: 4.5455 },
      { date: "2028-01-09", interest: 2.3864, amort: 4.5455 },
      { date: "2028-07-09", interest: 2.2727, amort: 4.5455 },
      { date: "2029-01-09", interest: 2.1591, amort: 4.5455 },
      { date: "2029-07-09", interest: 2.0455, amort: 4.5455 },
      { date: "2030-01-09", interest: 1.9318, amort: 4.5455 },
      { date: "2030-07-09", interest: 1.8182, amort: 4.5455 },
      { date: "2031-01-09", interest: 1.7045, amort: 4.5455 },
      { date: "2031-07-09", interest: 1.5909, amort: 4.5455 },
      { date: "2032-01-09", interest: 1.4773, amort: 4.5455 },
      { date: "2032-07-09", interest: 1.3636, amort: 4.5455 },
      { date: "2033-01-09", interest: 1.25, amort: 4.5455 },
      { date: "2033-07-09", interest: 1.1364, amort: 4.5455 },
      { date: "2034-01-09", interest: 1.0227, amort: 4.5455 },
      { date: "2034-07-09", interest: 0.9091, amort: 4.5455 },
      { date: "2035-01-09", interest: 0.7955, amort: 4.5455 },
      { date: "2035-07-09", interest: 0.6818, amort: 4.5455 },
      { date: "2036-01-09", interest: 0.5682, amort: 4.5455 },
      { date: "2036-07-09", interest: 0.4545, amort: 4.5455 },
      { date: "2037-01-09", interest: 0.3409, amort: 4.5455 },
      { date: "2037-07-09", interest: 0.2273, amort: 4.5455 },
      { date: "2038-01-09", interest: 0.1136, amort: 4.5455 },
    ],
  },
  {
    ticker: "GD41", isin: "US040114HT07", maturity: "2041-07-09", defaultDirty: 73.38,
    schedule: [
      { date: "2021-07-09", interest: 0.1059, amort: 0.0 },
      { date: "2022-01-09", interest: 1.25, amort: 0.0 },
      { date: "2022-07-09", interest: 1.25, amort: 0.0 },
      { date: "2023-01-09", interest: 1.75, amort: 0.0 },
      { date: "2023-07-09", interest: 1.75, amort: 0.0 },
      { date: "2024-01-09", interest: 1.75, amort: 0.0 },
      { date: "2024-07-09", interest: 1.75, amort: 0.0 },
      { date: "2025-01-09", interest: 1.75, amort: 0.0 },
      { date: "2025-07-09", interest: 1.75, amort: 0.0 },
      { date: "2026-01-09", interest: 1.75, amort: 0.0 },
      { date: "2026-07-09", interest: 1.75, amort: 0.0 },
      { date: "2027-01-09", interest: 1.75, amort: 0.0 },
      { date: "2027-07-09", interest: 1.75, amort: 0.0 },
      { date: "2028-01-09", interest: 1.75, amort: 3.5714 },
      { date: "2028-07-09", interest: 1.6875, amort: 3.5714 },
      { date: "2029-01-09", interest: 1.625, amort: 3.5714 },
      { date: "2029-07-09", interest: 1.5625, amort: 3.5714 },
      { date: "2030-01-09", interest: 2.0893, amort: 3.5714 },
      { date: "2030-07-09", interest: 2.0022, amort: 3.5714 },
      { date: "2031-01-09", interest: 1.9152, amort: 3.5714 },
      { date: "2031-07-09", interest: 1.8281, amort: 3.5714 },
      { date: "2032-01-09", interest: 1.7411, amort: 3.5714 },
      { date: "2032-07-09", interest: 1.654, amort: 3.5714 },
      { date: "2033-01-09", interest: 1.567, amort: 3.5714 },
      { date: "2033-07-09", interest: 1.4799, amort: 3.5714 },
      { date: "2034-01-09", interest: 1.3929, amort: 3.5714 },
      { date: "2034-07-09", interest: 1.3058, amort: 3.5714 },
      { date: "2035-01-09", interest: 1.2188, amort: 3.5714 },
      { date: "2035-07-09", interest: 1.1317, amort: 3.5714 },
      { date: "2036-01-09", interest: 1.0446, amort: 3.5714 },
      { date: "2036-07-09", interest: 0.9576, amort: 3.5714 },
      { date: "2037-01-09", interest: 0.8705, amort: 3.5714 },
      { date: "2037-07-09", interest: 0.7835, amort: 3.5714 },
      { date: "2038-01-09", interest: 0.6964, amort: 3.5714 },
      { date: "2038-07-09", interest: 0.6094, amort: 3.5714 },
      { date: "2039-01-09", interest: 0.5223, amort: 3.5714 },
      { date: "2039-07-09", interest: 0.4353, amort: 3.5714 },
      { date: "2040-01-09", interest: 0.3482, amort: 3.5714 },
      { date: "2040-07-09", interest: 0.2612, amort: 3.5714 },
      { date: "2041-01-09", interest: 0.1741, amort: 3.5714 },
      { date: "2041-07-09", interest: 0.0871, amort: 3.5714 },
    ],
  },
  {
    ticker: "GD46", isin: "US040114HV52", maturity: "2046-07-09", defaultDirty: 70.33,
    schedule: [
      { date: "2021-07-09", interest: 0.1059, amort: 0.0 },
      { date: "2022-01-09", interest: 0.5625, amort: 0.0 },
      { date: "2022-07-09", interest: 0.5625, amort: 0.0 },
      { date: "2023-01-09", interest: 0.75, amort: 0.0 },
      { date: "2023-07-09", interest: 0.75, amort: 0.0 },
      { date: "2024-01-09", interest: 1.8125, amort: 0.0 },
      { date: "2024-07-09", interest: 1.8125, amort: 0.0 },
      { date: "2025-01-09", interest: 2.0625, amort: 2.2727 },
      { date: "2025-07-09", interest: 2.0156, amort: 2.2727 },
      { date: "2026-01-09", interest: 1.9688, amort: 2.2727 },
      { date: "2026-07-09", interest: 1.9219, amort: 2.2727 },
      { date: "2027-01-09", interest: 1.875, amort: 2.2727 },
      { date: "2027-07-09", interest: 1.8281, amort: 2.2727 },
      { date: "2028-01-09", interest: 1.8892, amort: 2.2727 },
      { date: "2028-07-09", interest: 1.8395, amort: 2.2727 },
      { date: "2029-01-09", interest: 2.0455, amort: 2.2727 },
      { date: "2029-07-09", interest: 1.9886, amort: 2.2727 },
      { date: "2030-01-09", interest: 1.9318, amort: 2.2727 },
      { date: "2030-07-09", interest: 1.875, amort: 2.2727 },
      { date: "2031-01-09", interest: 1.8182, amort: 2.2727 },
      { date: "2031-07-09", interest: 1.7614, amort: 2.2727 },
      { date: "2032-01-09", interest: 1.7045, amort: 2.2727 },
      { date: "2032-07-09", interest: 1.6477, amort: 2.2727 },
      { date: "2033-01-09", interest: 1.5909, amort: 2.2727 },
      { date: "2033-07-09", interest: 1.5341, amort: 2.2727 },
      { date: "2034-01-09", interest: 1.4773, amort: 2.2727 },
      { date: "2034-07-09", interest: 1.4205, amort: 2.2727 },
      { date: "2035-01-09", interest: 1.3636, amort: 2.2727 },
      { date: "2035-07-09", interest: 1.3068, amort: 2.2727 },
      { date: "2036-01-09", interest: 1.25, amort: 2.2727 },
      { date: "2036-07-09", interest: 1.1932, amort: 2.2727 },
      { date: "2037-01-09", interest: 1.1364, amort: 2.2727 },
      { date: "2037-07-09", interest: 1.0795, amort: 2.2727 },
      { date: "2038-01-09", interest: 1.0227, amort: 2.2727 },
      { date: "2038-07-09", interest: 0.9659, amort: 2.2727 },
      { date: "2039-01-09", interest: 0.9091, amort: 2.2727 },
      { date: "2039-07-09", interest: 0.8523, amort: 2.2727 },
      { date: "2040-01-09", interest: 0.7955, amort: 2.2727 },
      { date: "2040-07-09", interest: 0.7386, amort: 2.2727 },
      { date: "2041-01-09", interest: 0.6818, amort: 2.2727 },
      { date: "2041-07-09", interest: 0.625, amort: 2.2727 },
      { date: "2042-01-09", interest: 0.5682, amort: 2.2727 },
      { date: "2042-07-09", interest: 0.5114, amort: 2.2727 },
      { date: "2043-01-09", interest: 0.4545, amort: 2.2727 },
      { date: "2043-07-09", interest: 0.3977, amort: 2.2727 },
      { date: "2044-01-09", interest: 0.3409, amort: 2.2727 },
      { date: "2044-07-09", interest: 0.2841, amort: 2.2727 },
      { date: "2045-01-09", interest: 0.2273, amort: 2.2727 },
      { date: "2045-07-09", interest: 0.1705, amort: 2.2727 },
      { date: "2046-01-09", interest: 0.1136, amort: 2.2727 },
      { date: "2046-07-09", interest: 0.0568, amort: 2.2727 },
    ],
  },
];

const EXIT_YIELDS = [0.06, 0.07, 0.08, 0.09, 0.10, 0.11, 0.12] as const;

// ============ HORIZONTES ============
type Horizon = "6M" | "1Y" | "2Y" | "CUSTOM";
const HORIZON_LABELS: Record<Horizon, string> = {
  "6M": "6 meses",
  "1Y": "1 año",
  "2Y": "2 años",
  "CUSTOM": "Personalizado",
};
const HORIZON_MONTHS: Record<Exclude<Horizon, "CUSTOM">, number> = {
  "6M": 6,
  "1Y": 12,
  "2Y": 24,
};

// ============ HELPERS ============
function pd(s: string): Date { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function fm(d: Date): string {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function addMonths(d: Date, months: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + months);
  return r;
}
function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
function fN(v: number | null | undefined, dc = 2): string {
  if (v == null || !isFinite(v)) return "—";
  return v.toLocaleString("es-AR", { minimumFractionDigits: dc, maximumFractionDigits: dc });
}
function fP(v: number | null | undefined, dc = 2): string {
  if (v == null || !isFinite(v)) return "—";
  return fN(v * 100, dc) + "%";
}
function fD(d: Date): string {
  return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
}

// ============ COLOR SCALE (estilo Excel: rojo -> amarillo -> verde) ============
function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }

function gradientColor(t: number): { bg: string; text: string } {
  // t: 0 (peor) → 1 (mejor)
  let r: number, g: number, b: number;
  if (t < 0.5) {
    const u = t * 2;
    r = lerp(239, 250, u);  // red-500 → yellow-400
    g = lerp(68, 204, u);
    b = lerp(68, 21, u);
  } else {
    const u = (t - 0.5) * 2;
    r = lerp(250, 34, u);   // yellow-400 → green-500
    g = lerp(204, 197, u);
    b = lerp(21, 94, u);
  }
  const ri = Math.round(r), gi = Math.round(g), bi = Math.round(b);
  return {
    bg: `rgba(${ri}, ${gi}, ${bi}, 0.20)`,
    text: `rgb(${ri}, ${gi}, ${bi})`,
  };
}

// ============ COMPUTATION ============
// PV at exit date of all CFs after exit, discounted annually with actual/365 day count
function computeExitDirty(schedule: CashFlow[], exitDate: Date, yieldPct: number): number {
  let pv = 0;
  for (const cf of schedule) {
    const cfDate = pd(cf.date);
    const days = daysBetween(exitDate, cfDate);
    if (days <= 0) continue;
    const flow = cf.interest + cf.amort;
    if (flow <= 0) continue;
    pv += flow / Math.pow(1 + yieldPct, days / 365);
  }
  return pv;
}

function computeAccumulated(schedule: CashFlow[], startDate: Date, exitDate: Date): number {
  let sum = 0;
  for (const cf of schedule) {
    const cfDate = pd(cf.date);
    if (cfDate.getTime() > startDate.getTime() && cfDate.getTime() <= exitDate.getTime()) {
      sum += cf.interest + cf.amort;
    }
  }
  return sum;
}

// Lista de CFs cobrados en el horizonte (para mostrar al usuario)
function listCashFlows(schedule: CashFlow[], startDate: Date, exitDate: Date): CashFlow[] {
  return schedule.filter(cf => {
    const d = pd(cf.date);
    return d.getTime() > startDate.getTime() && d.getTime() <= exitDate.getTime();
  });
}

// Resuelve TIR vía bisección (convención del Excel: actual/365 anual)
function computeYTM(schedule: CashFlow[], settlementDate: Date, dirtyPrice: number): number {
  if (dirtyPrice <= 0) return 0;
  let lo = -0.5, hi = 5.0;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const pv = computeExitDirty(schedule, settlementDate, mid);
    if (pv > dirtyPrice) lo = mid; else hi = mid;
    if (Math.abs(hi - lo) < 1e-7) break;
  }
  return (lo + hi) / 2;
}

// ============ COMPONENT ============
type Status = "loading" | "ok" | "error";

export default function AnalisisGlobales() {
  const today = useMemo(() => fm(new Date()), []);
  const [startDate, setStartDate] = useState<string>(today);
  const [horizon, setHorizon] = useState<Horizon>("1Y");
  const [customExitDate, setCustomExitDate] = useState<string>(() => fm(addMonths(new Date(), 12)));

  const [marketPrices, setMarketPrices] = useState<Record<string, number>>(
    Object.fromEntries(GLOBALES.map(b => [b.ticker, b.defaultDirty]))
  );
  const [lockedPrices, setLockedPrices] = useState<Record<string, number>>({});
  const [editingTicker, setEditingTicker] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [status, setStatus] = useState<Status>("loading");
  const [statusText, setStatusText] = useState("Conectando…");

  // Fecha de exit calculada según horizonte
  const exitDate = useMemo(() => {
    if (horizon === "CUSTOM") return customExitDate;
    return fm(addMonths(pd(startDate), HORIZON_MONTHS[horizon]));
  }, [horizon, startDate, customExitDate]);

  const fetchLive = useCallback(async () => {
    setStatus("loading");
    setStatusText("Actualizando…");
    try {
      const live = await fetchLiveBondPrices();
      const updates: Record<string, number> = {};
      // Globales: usar el ticker con sufijo C (CCL/USD)
      for (const g of GLOBALES) {
        const sym = g.ticker + "C";
        const item = live.find(p => (p.symbol || "").replace(/\s/g, "") === sym);
        if (item && item.c && item.c > 0) updates[g.ticker] = item.c;
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

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 180000);
    return () => clearInterval(interval);
  }, [fetchLive]);

  const getPrice = (tk: string): number => {
    if (lockedPrices[tk] != null) return lockedPrices[tk];
    if (marketPrices[tk] != null) return marketPrices[tk];
    return GLOBALES.find(g => g.ticker === tk)?.defaultDirty || 0;
  };

  const startEdit = (tk: string) => {
    setEditingTicker(tk);
    setEditValue(getPrice(tk).toFixed(2).replace(".", ","));
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

  // Compute rows
  const startDateObj = useMemo(() => pd(startDate), [startDate]);
  const exitDateObj = useMemo(() => pd(exitDate), [exitDate]);
  const horizonDays = useMemo(() => daysBetween(startDateObj, exitDateObj), [startDateObj, exitDateObj]);

  const rows = useMemo(() => GLOBALES.map(bond => {
    const pxDirty = getPrice(bond.ticker);
    const tir = computeYTM(bond.schedule, startDateObj, pxDirty);
    const acumulado = computeAccumulated(bond.schedule, startDateObj, exitDateObj);
    const cfs = listCashFlows(bond.schedule, startDateObj, exitDateObj);
    const returns: Record<number, number> = {};
    for (const y of EXIT_YIELDS) {
      const exitDirty = computeExitDirty(bond.schedule, exitDateObj, y);
      returns[y] = (acumulado + exitDirty) / pxDirty - 1;
    }
    return {
      ticker: bond.ticker,
      maturity: bond.maturity,
      pxDirty,
      tir,
      acumulado,
      returns,
      cfs,
      isLocked: lockedPrices[bond.ticker] != null,
    };
  }), [marketPrices, lockedPrices, startDateObj, exitDateObj]);

  // Color scale globally across all returns
  const { minReturn, maxReturn } = useMemo(() => {
    const all = rows.flatMap(r => EXIT_YIELDS.map(y => r.returns[y]));
    return { minReturn: Math.min(...all), maxReturn: Math.max(...all) };
  }, [rows]);

  const colorFor = (v: number): { bg: string; text: string } => {
    if (maxReturn === minReturn) return { bg: "transparent", text: "inherit" };
    return gradientColor((v - minReturn) / (maxReturn - minReturn));
  };

  const statusColor =
    status === "ok" ? "bg-green-500" :
    status === "error" ? "bg-red-500" : "bg-yellow-500";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Retorno Total — <span className="text-primary">Globales Argentina</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Asume cobro de cupones intermedios + venta a exit yield · base actual/365 compounding anual
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <label className="text-muted-foreground">Inicio:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-card border border-border rounded px-2 py-1 text-foreground text-xs focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <label className="text-muted-foreground">Horizonte:</label>
            <div className="flex items-center gap-0 rounded-md overflow-hidden border border-border">
              {(["6M","1Y","2Y","CUSTOM"] as Horizon[]).map(h => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
                    horizon === h ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                  }`}
                >
                  {HORIZON_LABELS[h]}
                </button>
              ))}
            </div>
          </div>
          {horizon === "CUSTOM" ? (
            <div className="flex items-center gap-1.5 text-xs">
              <label className="text-muted-foreground">Exit:</label>
              <input
                type="date"
                value={customExitDate}
                min={startDate}
                onChange={(e) => setCustomExitDate(e.target.value)}
                className="bg-card border border-border rounded px-2 py-1 text-foreground text-xs focus:outline-none focus:border-primary"
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs">
              <label className="text-muted-foreground">Exit:</label>
              <input
                type="date"
                value={exitDate}
                readOnly
                className="bg-card border border-border rounded px-2 py-1 text-muted-foreground text-xs opacity-70 w-[125px]"
              />
            </div>
          )}
          <span className="text-[10px] text-muted-foreground font-mono px-2 py-1 bg-muted/30 rounded">
            {horizonDays}d
          </span>
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

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th rowSpan={2} className="px-3 py-2 text-primary font-semibold text-left text-[11px] align-middle">Título</th>
                <th rowSpan={2} className="px-3 py-2 text-muted-foreground font-semibold text-right text-[11px] align-middle">Vto.</th>
                <th rowSpan={2} className="px-3 py-2 text-muted-foreground font-semibold text-right text-[11px] align-middle">Px Dirty</th>
                <th rowSpan={2} className="px-3 py-2 text-muted-foreground font-semibold text-right text-[11px] align-middle">TIR Actual</th>
                <th rowSpan={2} className="px-3 py-2 text-muted-foreground font-semibold text-right text-[11px] align-middle" title="Cupones + amortizaciones cobrados en el horizonte">
                  Flujo Acumulado
                </th>
                <th colSpan={7} className="px-3 py-2 text-primary font-semibold text-center text-[11px] border-l border-border">
                  Retorno Total al Horizonte @ Exit Yield
                </th>
              </tr>
              <tr className="bg-muted/20 border-b border-border">
                {EXIT_YIELDS.map((y, i) => (
                  <th key={y} className={`px-3 py-1.5 text-center text-[11px] font-semibold ${i === 0 ? 'border-l border-border' : ''}`}>
                    <span className="text-accent">{(y * 100).toFixed(0)}%</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.ticker} className="border-b border-border/40 hover:bg-secondary/10 transition-colors">
                  <td className="px-3 py-2 text-left font-bold text-primary">{r.ticker}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{fD(pd(r.maturity))}</td>
                  <td className="px-3 py-2 text-right">
                    {editingTicker === r.ticker ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => { if (e.key === "Enter") { saveEdit(); e.preventDefault(); } }}
                        className="bg-background border border-primary rounded px-1 py-0.5 w-20 text-right text-foreground"
                      />
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <span className={r.isLocked ? "text-primary font-bold" : "text-green-400 font-bold"}>
                          {fN(r.pxDirty, 1)}
                        </span>
                        <button onClick={() => startEdit(r.ticker)} className="opacity-40 hover:opacity-100 transition-opacity" title="Editar precio">
                          <Pencil className="h-2.5 w-2.5" />
                        </button>
                        {r.isLocked && (
                          <button onClick={() => resetPrice(r.ticker)} className="opacity-60 hover:opacity-100 transition-opacity text-destructive" title="Volver a precio de mercado">
                            <RotateCcw className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-foreground">{fP(r.tir, 1)}</td>
                  <td className="px-3 py-2 text-right text-foreground" title={r.cfs.length === 0 ? "Sin pagos en el horizonte" : r.cfs.map(cf => `${cf.date}: $${(cf.interest+cf.amort).toFixed(3)}`).join(' · ')}>
                    {fN(r.acumulado, 1)}
                    {r.cfs.length > 0 && (
                      <span className="text-[9px] text-muted-foreground ml-1">({r.cfs.length})</span>
                    )}
                  </td>
                  {EXIT_YIELDS.map((y, i) => {
                    const ret = r.returns[y];
                    const c = colorFor(ret);
                    return (
                      <td
                        key={y}
                        className={`px-3 py-2 text-right font-bold ${i === 0 ? 'border-l border-border' : ''}`}
                        style={{ backgroundColor: c.bg, color: c.text }}
                      >
                        {fP(ret, 1)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
