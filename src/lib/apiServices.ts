// API services for bond prices, exchange rates, and holidays

const DATA912_BASE = 'https://data912.com';
const DOLAR_API_BASE = 'https://dolarapi.com/v1';
const ARGENTINA_DATOS_BASE = 'https://api.argentinadatos.com/v1';

export interface BondPrice {
  date: string;
  o: number;
  h: number;
  l: number;
  c: number; // close price
  v: number;
}

export interface LiveBondPrice {
  symbol: string;
  c: number; // close/last price
  px_bid: number;
  px_ask: number;
}

export interface ExchangeRate {
  casa: string;
  compra: number;
  venta: number;
  fecha?: string;
  fechaActualizacion?: string;
}

export interface Holiday {
  fecha: string;
  tipo: string;
  nombre: string;
}

// Fetch bond historical prices from data912
export async function fetchBondPrices(ticker: string): Promise<BondPrice[]> {
  const res = await fetch(`${DATA912_BASE}/historical/bonds/${ticker}`);
  if (!res.ok) throw new Error(`Failed to fetch prices for ${ticker}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data;
}

// Fetch live bond prices from data912 (bonds + notes)
export async function fetchLiveBondPrices(): Promise<LiveBondPrice[]> {
  const [bondsRes, notesRes] = await Promise.all([
    fetch(`${DATA912_BASE}/live/arg_bonds`).catch(() => null),
    fetch(`${DATA912_BASE}/live/arg_notes`).catch(() => null),
  ]);
  let bonds: LiveBondPrice[] = [];
  let notes: LiveBondPrice[] = [];
  if (bondsRes?.ok) {
    const d = await bondsRes.json();
    if (Array.isArray(d)) bonds = d;
  }
  if (notesRes?.ok) {
    const d = await notesRes.json();
    if (Array.isArray(d)) notes = d;
  }
  // Merge, bonds take priority on duplicates
  const map = new Map<string, LiveBondPrice>();
  for (const n of notes) map.set(n.symbol, n);
  for (const b of bonds) map.set(b.symbol, b);
  return Array.from(map.values());
}

// Fetch live MEP rate from data912
export async function fetchLiveMEP(): Promise<number | null> {
  try {
    const res = await fetch(`${DATA912_BASE}/live/mep`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    // Find GD30 or first available for MEP reference
    const gd30 = data.find((d: any) => d.ticker === 'GD30' || d.ticker === 'AL30');
    const entry = gd30 || data[0];
    return entry?.close || entry?.mark || null;
  } catch { return null; }
}

// Fetch live CCL rate from data912
export async function fetchLiveCCL(): Promise<number | null> {
  try {
    const res = await fetch(`${DATA912_BASE}/live/ccl`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const gd30 = data.find((d: any) => d.ticker === 'GD30' || d.ticker === 'AL30');
    const entry = gd30 || data[0];
    return entry?.close || entry?.mark || null;
  } catch { return null; }
}

// Fetch dollar mayorista (proxy del A3500 intradía y cierre oficial)
export async function fetchMayorista(): Promise<ExchangeRate | null> {
  try {
    const res = await fetch(`${DOLAR_API_BASE}/dolares/mayorista`);
    if (!res.ok) return null;
    const data: ExchangeRate = await res.json();
    return data || null;
  } catch { return null; }
}

// Fetch current exchange rates (MEP, CCL, Mayorista/A3500)
export async function fetchCurrentExchangeRates(): Promise<{
  mep: ExchangeRate;
  ccl: ExchangeRate;
  mayorista: ExchangeRate;
} | null> {
  try {
    const res = await fetch(`${DOLAR_API_BASE}/dolares`);
    if (!res.ok) return null;
    const data: ExchangeRate[] = await res.json();
    const mep = data.find(d => d.casa === 'bolsa');
    const ccl = data.find(d => d.casa === 'contadoconliqui');
    const mayorista = data.find(d => d.casa === 'mayorista');
    if (!mep || !ccl || !mayorista) return null;
    return { mep, ccl, mayorista };
  } catch { return null; }
}

// Fetch historical exchange rates for MEP (bolsa), CCL or Mayorista
export async function fetchHistoricalExchangeRates(
  type: 'bolsa' | 'contadoconliqui' | 'mayorista'
): Promise<ExchangeRate[]> {
  const res = await fetch(`${ARGENTINA_DATOS_BASE}/cotizaciones/dolares/${type}`);
  if (!res.ok) throw new Error(`Failed to fetch historical ${type} rates`);
  return res.json();
}

// Fetch Argentine holidays for a given year
export async function fetchHolidays(year: number): Promise<Holiday[]> {
  const res = await fetch(`${ARGENTINA_DATOS_BASE}/feriados/${year}`);
  if (!res.ok) throw new Error(`Failed to fetch holidays for ${year}`);
  return res.json();
}

// Check if a date is a business day in Argentina
export function isBusinessDay(date: Date, holidays: Holiday[]): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  const dateStr = date.toISOString().split('T')[0];
  return !holidays.some(h => h.fecha === dateStr);
}

// Get the last business day on or before a date
export function getLastBusinessDay(date: Date, holidays: Holiday[]): Date {
  const d = new Date(date);
  while (!isBusinessDay(d, holidays)) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}

// Get the next business day after a date (T+1 hábil)
export function getNextBusinessDay(date: Date, holidays: Holiday[]): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  while (!isBusinessDay(d, holidays)) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

// Get the close price for a specific date from historical data
export function getPriceForDate(prices: BondPrice[], dateStr: string): number | null {
  const entry = prices.find(p => p.date === dateStr);
  return entry ? entry.c : null;
}

// Get exchange rate for a specific date from historical data
export function getExchangeRateForDate(rates: ExchangeRate[], dateStr: string): number | null {
  const entry = rates.find(r => r.fecha === dateStr);
  return entry ? entry.venta : null;
}

// Find closest available rate on or before date
export function getClosestExchangeRate(rates: ExchangeRate[], dateStr: string): number | null {
  if (!Array.isArray(rates)) return null;
  const sorted = rates.filter(r => r.fecha && r.fecha <= dateStr).sort((a, b) => b.fecha!.localeCompare(a.fecha!));
  return sorted.length > 0 ? sorted[0].venta : null;
}

// Find closest available price on or before date
export function getClosestPrice(prices: BondPrice[], dateStr: string): number | null {
  if (!Array.isArray(prices)) return null;
  const sorted = prices.filter(p => p.date <= dateStr).sort((a, b) => b.date.localeCompare(a.date));
  return sorted.length > 0 ? sorted[0].c : null;
}

// Get live price for a specific ticker
export function getLivePrice(livePrices: LiveBondPrice[], ticker: string): number | null {
  const entry = livePrices.find(p => p.symbol === ticker);
  return entry ? entry.c : null;
}
