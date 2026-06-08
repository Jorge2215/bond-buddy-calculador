// Cliente del frontend que consume nuestro propio endpoint /api/futuros

export interface DollarFuture {
  symbol: string;
  expiration: string; // YYYY-MM-DD
  daysToExpiry: number;
  bid: number | null;
  bidSize: number | null;
  offer: number | null;
  offerSize: number | null;
  last: number | null;
  lastSize: number | null;
  close: number | null;
  settlement: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  openInterest: number | null;
}

export interface FuturesResponse {
  product: string;
  timestamp: string;
  futures: DollarFuture[];
}

export async function fetchDollarFutures(): Promise<FuturesResponse | null> {
  try {
    const res = await fetch("/api/futuros");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Calcula la TNA implícita de un futuro vs el spot A3500
// Tasa directa = (Precio_Futuro / Spot) - 1
// TNA = Tasa directa * (365 / días)
export function calcImpliedTNA(
  futurePrice: number | null,
  spot: number,
  daysToExpiry: number
): number | null {
  if (!futurePrice || futurePrice <= 0 || !spot || spot <= 0 || daysToExpiry <= 0) {
    return null;
  }
  const directRate = futurePrice / spot - 1;
  return directRate * (365 / daysToExpiry);
}

// Tasa directa al vencimiento (no anualizada)
export function calcDirectRate(
  futurePrice: number | null,
  spot: number
): number | null {
  if (!futurePrice || futurePrice <= 0 || !spot || spot <= 0) return null;
  return futurePrice / spot - 1;
}

// Helper para obtener el precio "más representativo" de un futuro
// Orden de prioridad: last > settlement > close > mid(bid,offer)
export function getRepresentativePrice(f: DollarFuture): number | null {
  if (f.last && f.last > 0) return f.last;
  if (f.settlement && f.settlement > 0) return f.settlement;
  if (f.close && f.close > 0) return f.close;
  if (f.bid && f.offer && f.bid > 0 && f.offer > 0) {
    return (f.bid + f.offer) / 2;
  }
  return null;
}
