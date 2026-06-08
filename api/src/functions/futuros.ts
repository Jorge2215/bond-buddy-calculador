import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

const API_BASE = "https://api.remarkets.primary.com.ar";
const PRODUCT = "DLR";

interface CachedToken {
  token: string;
  expiresAt: number;
}

interface MarketDataLevel {
  price?: number | null;
  size?: number | null;
}

interface MarketDataItem {
  price?: number | null;
  size?: number | null;
}

interface MarketData {
  BI?: MarketDataLevel[];
  OF?: MarketDataLevel[];
  LA?: MarketDataItem;
  CL?: MarketDataItem;
  SE?: MarketDataItem;
  OP?: number | null;
  HI?: number | null;
  LO?: number | null;
  TV?: number | null;
  OI?: MarketDataItem;
}

interface Instrument {
  instrumentId?: {
    symbol?: string;
  };
}

interface InstrumentsResponse {
  instruments?: Instrument[];
}

interface FutureContract {
  symbol: string;
  expiration: string;
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

interface FuturesPayload {
  product: string;
  timestamp: string;
  futures: FutureContract[];
}

interface CachedPrices {
  data: FuturesPayload;
  expiresAt: number;
}

let tokenCache: CachedToken | null = null;
let pricesCache: CachedPrices | null = null;

const TOKEN_TTL_MS = 23 * 60 * 60 * 1000;
const PRICES_TTL_MS = 30 * 1000;

const MONTH_MAP: Record<string, number> = {
  ENE: 1,
  FEB: 2,
  MAR: 3,
  ABR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AGO: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DIC: 12,
};

function parseExpirationFromSymbol(symbol: string): Date | null {
  const match = symbol.match(/DLR\/([A-Z]{3})(\d{2})/);
  if (!match) return null;
  const month = MONTH_MAP[match[1]];
  const year = 2000 + parseInt(match[2], 10);
  if (!month) return null;
  const lastDay = new Date(year, month, 0);
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
  const res = await fetch(`${API_BASE}/rest/instruments/all`, {
    headers: { "X-Auth-Token": token },
  });
  if (!res.ok) throw new Error(`Instruments fetch failed: ${res.status}`);
  const data = (await res.json()) as InstrumentsResponse;
  const symbols: string[] = [];
  for (const inst of data.instruments || []) {
    const symbol = inst.instrumentId?.symbol;
    if (symbol && /DLR\/[A-Z]{3}\d{2}$/.test(symbol)) {
      symbols.push(symbol);
    }
  }
  return symbols;
}

async function getMarketData(token: string, symbol: string): Promise<MarketData | null> {
  const url = `${API_BASE}/rest/marketdata/get?marketId=ROFX&symbol=${encodeURIComponent(symbol)}&entries=BI,OF,LA,CL,SE,OP,HI,LO,TV,OI`;
  const res = await fetch(url, {
    headers: { "X-Auth-Token": token },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { marketData?: MarketData };
  return data.marketData || null;
}

app.http("futuros", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "futuros",
  handler: async (_request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
    const headers: Record<string, string> = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Cache-Control": "public, max-age=30",
      "Content-Type": "application/json",
    };

    if (_request.method !== "GET") {
      return {
        status: 405,
        headers,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    const user = process.env.PRIMARY_USER;
    const password = process.env.PRIMARY_PASS;

    if (!user || !password) {
      return {
        status: 500,
        headers,
        body: JSON.stringify({ error: "Missing PRIMARY_USER or PRIMARY_PASS env vars" }),
      };
    }

    const now = Date.now();
    if (pricesCache && pricesCache.expiresAt > now) {
      return {
        status: 200,
        headers,
        body: JSON.stringify(pricesCache.data),
      };
    }

    try {
      const token = await getToken(user, password);
      const symbols = await getDLRSymbols(token);

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
        .filter((result): result is FutureContract => result !== null)
        .sort((a, b) => a.daysToExpiry - b.daysToExpiry);

      const payload = {
        product: PRODUCT,
        timestamp: new Date().toISOString(),
        futures,
      };

      pricesCache = { data: payload, expiresAt: now + PRICES_TTL_MS };
      return {
        status: 200,
        headers,
        body: JSON.stringify(payload),
      };
    } catch (err: unknown) {
      tokenCache = null;
      return {
        status: 500,
        headers,
        body: JSON.stringify({
          error: err instanceof Error ? err.message : "Unknown error",
        }),
      };
    }
  },
});
