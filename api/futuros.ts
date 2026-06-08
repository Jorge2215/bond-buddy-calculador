// Vercel Serverless Function: proxy a la API de reMarkets (Primary)
// Cachea token por 23h y precios por 30s en memoria del runtime

const API_BASE = "https://api.remarkets.primary.com.ar";
const PRODUCT = "DLR"; // Solo Dólar futuro

interface CachedToken {
  token: string;
  expiresAt: number;
}

interface CachedPrices {
  data: any;
  expiresAt: number;
}

// Caches en memoria del runtime (persiste entre invocations en warm functions)
let tokenCache: CachedToken | null = null;
let pricesCache: CachedPrices | null = null;

const TOKEN_TTL_MS = 23 * 60 * 60 * 1000; // 23 horas
const PRICES_TTL_MS = 30 * 1000; // 30 segundos

// Mes en español de tres letras a número (formato Primary: ENE26 = 2026-01)
const MONTH_MAP: Record<string, number> = {
  ENE: 1, FEB: 2, MAR: 3, ABR: 4, MAY: 5, JUN: 6,
  JUL: 7, AGO: 8, SEP: 9, OCT: 10, NOV: 11, DIC: 12,
};

function parseExpirationFromSymbol(symbol: string): Date | null {
  // Symbol format: "DLR/MAY26" o "MERV - XMEV - DLR/MAY26 - 24hs"
  const match = symbol.match(/DLR\/([A-Z]{3})(\d{2})/);
  if (!match) return null;
  const month = MONTH_MAP[match[1]];
  const year = 2000 + parseInt(match[2], 10);
  if (!month) return null;
  // Vencimiento = último día hábil del mes. Aproximamos al último día calendario.
  const lastDay = new Date(year, month, 0); // día 0 del mes siguiente = último del actual
  return lastDay;
}

async function getToken(user: string, password: string): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  const res = await fetch(`${API_BASE}/auth/getToken`, {
    method: "POST",
    headers: {
      "X-Username": user,
      "X-Password": password,
    },
  });

  if (!res.ok) {
    throw new Error(`Auth failed: ${res.status} ${res.statusText}`);
  }

  const token = res.headers.get("X-Auth-Token");
  if (!token) {
    throw new Error("No X-Auth-Token in response headers");
  }

  tokenCache = { token, expiresAt: now + TOKEN_TTL_MS };
  return token;
}

async function getDLRSymbols(token: string): Promise<string[]> {
  // Trae todos los instrumentos disponibles y filtra los DLR
  const res = await fetch(`${API_BASE}/rest/instruments/all`, {
    headers: { "X-Auth-Token": token },
  });
  if (!res.ok) throw new Error(`Instruments fetch failed: ${res.status}`);
  const data = await res.json();
  const symbols: string[] = [];
  for (const inst of data?.instruments || []) {
    const symbol = inst?.instrumentId?.symbol;
    // Filtramos solo futuros DLR (no opciones, no mayoristas con sufijo A)
    if (symbol && /DLR\/[A-Z]{3}\d{2}$/.test(symbol)) {
      symbols.push(symbol);
    }
  }
  return symbols;
}

async function getMarketData(token: string, symbol: string): Promise<any> {
  // Entries: BI=bid, OF=offer, LA=last, CL=close, SE=settlement, OP=open, HI=high, LO=low, TV=trade volume, OI=open interest
  const url = `${API_BASE}/rest/marketdata/get?marketId=ROFX&symbol=${encodeURIComponent(symbol)}&entries=BI,OF,LA,CL,SE,OP,HI,LO,TV,OI`;
  const res = await fetch(url, {
    headers: { "X-Auth-Token": token },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.marketData || null;
}

export default async function handler(req: any, res: any) {
  // CORS - permite que tu propio dominio consulte
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "public, max-age=30");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = process.env.PRIMARY_USER;
  const password = process.env.PRIMARY_PASS;

  if (!user || !password) {
    return res.status(500).json({
      error: "Missing PRIMARY_USER or PRIMARY_PASS env vars",
    });
  }

  // Cache check
  const now = Date.now();
  if (pricesCache && pricesCache.expiresAt > now) {
    return res.status(200).json(pricesCache.data);
  }

  try {
    const token = await getToken(user, password);
    const symbols = await getDLRSymbols(token);

    // Trae market data en paralelo para todos los DLR
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const md = await getMarketData(token, symbol);
        if (!md) return null;

        const expiration = parseExpirationFromSymbol(symbol);
        if (!expiration) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysToExpiry = Math.round(
          (expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Skip already-expired contracts
        if (daysToExpiry <= 0) return null;

        return {
          symbol,
          expiration: expiration.toISOString().split("T")[0],
          daysToExpiry,
          bid: md.BI?.[0]?.price ?? null,
          bidSize: md.BI?.[0]?.size ?? null,
          offer: md.OF?.[0]?.price ?? null,
          offerSize: md.OF?.[0]?.size ?? null,
          last: md.LA?.price ?? null,
          lastSize: md.LA?.size ?? null,
          close: md.CL?.price ?? null,
          settlement: md.SE?.price ?? null,
          open: md.OP ?? null,
          high: md.HI ?? null,
          low: md.LO ?? null,
          volume: md.TV ?? null,
          openInterest: md.OI?.size ?? null,
        };
      })
    );

    const futures = results
      .filter((r) => r !== null)
      .sort((a: any, b: any) => a.daysToExpiry - b.daysToExpiry);

    const payload = {
      product: PRODUCT,
      timestamp: new Date().toISOString(),
      futures,
    };

    pricesCache = { data: payload, expiresAt: now + PRICES_TTL_MS };
    return res.status(200).json(payload);
  } catch (err: any) {
    // Si falla por token vencido, invalidar y reintentar una vez
    tokenCache = null;
    return res.status(500).json({
      error: err?.message || "Unknown error",
    });
  }
}
