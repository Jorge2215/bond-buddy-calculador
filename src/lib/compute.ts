// Cálculo de las series derivadas del dashboard a partir de las bases.
// Replica exactamente el modelo de la hoja "CCLxTCRM":
//   TCRM al Oficial    = TCRM_index * (A3500_ancla / TCRM_index_ancla)
//   TCRM al CCL        = TCRM_al_Oficial * (CCL / A3500)
//   Canje CCL-MEP      = CCL / MEP - 1
//   Brecha CCL - A3500 = CCL / A3500 - 1
//   Brecha MEP - A3500 = MEP / A3500 - 1
// El ancla es la fecha más reciente presente en ambas bases (TCRM y A3500).

import { BASE_A3500 } from "./BASE_A3500";
import { BASE_TCRM } from "./BASE_TCRM";
import { BASE_RP } from "./BASE_RP";
import { BASE_MEP } from "./BASE_MEP";
import { BASE_CCL } from "./BASE_CCL";

export interface SeriesPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface DualPoint {
  date: string;
  a: number | null;
  b: number | null;
}

function sortedDates(obj: Record<string, number>): string[] {
  return Object.keys(obj).sort();
}

// Fecha ancla: última fecha común a TCRM y A3500
function getAnchor(): { date: string; tcrm: number; a3500: number; mult: number } {
  const common = sortedDates(BASE_TCRM).filter((d) => BASE_A3500[d] != null);
  const date = common[common.length - 1];
  const tcrm = BASE_TCRM[date];
  const a3500 = BASE_A3500[date];
  return { date, tcrm, a3500, mult: a3500 / tcrm };
}

// TCRM expresado en pesos del oficial (nivel nominal del ancla)
export function getTCRMOficial(): SeriesPoint[] {
  const { mult } = getAnchor();
  return sortedDates(BASE_TCRM).map((date) => ({
    date,
    value: BASE_TCRM[date] * mult,
  }));
}

// TCRM expresado al CCL
export function getTCRMCCL(): SeriesPoint[] {
  const { mult } = getAnchor();
  const out: SeriesPoint[] = [];
  for (const date of sortedDates(BASE_TCRM)) {
    const a3500 = BASE_A3500[date];
    const ccl = BASE_CCL[date];
    if (a3500 == null || ccl == null || a3500 <= 0) continue;
    const tcrmOficial = BASE_TCRM[date] * mult;
    out.push({ date, value: tcrmOficial * (ccl / a3500) });
  }
  return out;
}

// Riesgo País histórico (puntos básicos)
export function getRiesgoPais(): SeriesPoint[] {
  return sortedDates(BASE_RP).map((date) => ({ date, value: BASE_RP[date] }));
}

// Canje CCL-MEP (en %)
export function getCanje(): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  for (const date of sortedDates(BASE_MEP)) {
    const mep = BASE_MEP[date];
    const ccl = BASE_CCL[date];
    if (mep == null || ccl == null || mep <= 0) continue;
    out.push({ date, value: (ccl / mep - 1) * 100 });
  }
  return out;
}

// Brecha CCL - A3500 (en %)
export function getBrechaCCL(): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  for (const date of sortedDates(BASE_CCL)) {
    const ccl = BASE_CCL[date];
    const a3500 = BASE_A3500[date];
    if (ccl == null || a3500 == null || a3500 <= 0) continue;
    out.push({ date, value: (ccl / a3500 - 1) * 100 });
  }
  return out;
}

// Brecha MEP - A3500 (en %)
export function getBrechaMEP(): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  for (const date of sortedDates(BASE_MEP)) {
    const mep = BASE_MEP[date];
    const a3500 = BASE_A3500[date];
    if (mep == null || a3500 == null || a3500 <= 0) continue;
    out.push({ date, value: (mep / a3500 - 1) * 100 });
  }
  return out;
}

// Combina dos series por fecha (intersección de fechas), para gráficos de doble eje
export function mergeByDate(seriesA: SeriesPoint[], seriesB: SeriesPoint[]): DualPoint[] {
  const mapB = new Map(seriesB.map((p) => [p.date, p.value]));
  const out: DualPoint[] = [];
  for (const p of seriesA) {
    const b = mapB.get(p.date);
    if (b != null) out.push({ date: p.date, a: p.value, b });
  }
  return out;
}

export function getAnchorInfo() {
  return getAnchor();
}

// Filtra una serie por rango de fechas (inclusivo)
export function filterRange<T extends { date: string }>(
  series: T[],
  from?: string,
  to?: string
): T[] {
  return series.filter((p) => {
    if (from && p.date < from) return false;
    if (to && p.date > to) return false;
    return true;
  });
}
