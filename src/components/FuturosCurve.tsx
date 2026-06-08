import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Label, ReferenceLine,
} from "recharts";
import {
  fetchDollarFutures, calcImpliedTNA, calcDirectRate,
  getRepresentativePrice, type DollarFuture, type FuturesResponse,
} from "@/lib/futurosService";
import { TrendingUp, RefreshCw, AlertCircle } from "lucide-react";

interface Props {
  spot: number; // A3500 spot rate
}

function formatPercent(n: number | null, decimals = 2): string {
  if (n === null || !isFinite(n)) return "—";
  return (n * 100).toFixed(decimals) + "%";
}

function formatNumber(n: number | null, decimals = 2): string {
  if (n === null || !isFinite(n)) return "—";
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatInt(n: number | null): string {
  if (n === null || !isFinite(n)) return "—";
  return Math.round(n).toLocaleString("es-AR");
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${d} ${months[parseInt(m) - 1]} ${y.slice(2)}`;
}

function formatSymbolShort(symbol: string): string {
  // "DLR/MAY26" -> "MAY26"
  const parts = symbol.split("/");
  return parts[1] || symbol;
}

export function FuturosCurve({ spot }: Props) {
  const [data, setData] = useState<FuturesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (isInitial = false) => {
    if (!isInitial) setRefreshing(true);
    try {
      const res = await fetchDollarFutures();
      if (res) {
        setData(res);
        setError(null);
      } else {
        setError("No se pudieron obtener los futuros");
      }
    } catch (e: any) {
      setError(e?.message || "Error desconocido");
    } finally {
      if (isInitial) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load(true);
    const interval = setInterval(() => load(false), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 flex items-center justify-center gap-2 text-muted-foreground text-sm">
        <RefreshCw className="h-4 w-4 animate-spin" /> Cargando futuros DLR...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-card p-4 flex items-center gap-2 text-destructive text-sm">
        <AlertCircle className="h-4 w-4" />
        {error || "Sin datos de futuros"}
      </div>
    );
  }

  // Build chart data: solo contratos con precio válido
  const chartData = data.futures
    .map((f) => {
      const price = getRepresentativePrice(f);
      const tna = calcImpliedTNA(price, spot, f.daysToExpiry);
      return {
        symbol: formatSymbolShort(f.symbol),
        days: f.daysToExpiry,
        tna: tna !== null ? tna * 100 : null,
        price,
      };
    })
    .filter((d) => d.tna !== null);

  const avgTNA = chartData.length
    ? chartData.reduce((a, b) => a + (b.tna || 0), 0) / chartData.length
    : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Curva de Futuros DLR (Matba Rofex)
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="font-mono">Spot A3500: ${formatNumber(spot)}</span>
          <span className="text-border">·</span>
          <span>Actualizado: {new Date(data.timestamp).toLocaleTimeString("es-AR")}</span>
          {refreshing && <RefreshCw className="h-3 w-3 animate-spin" />}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          TNA Implícita vs Días al Vencimiento
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis
              type="number"
              dataKey="days"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              domain={["dataMin", "dataMax"]}
            >
              <Label value="Días al vencimiento" position="bottom" offset={10}
                style={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            </XAxis>
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              tickFormatter={(v) => `${v.toFixed(0)}%`}
              width={48}
            >
              <Label value="TNA %" angle={-90} position="insideLeft" offset={-5}
                style={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            </YAxis>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d: any = payload[0].payload;
                return (
                  <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-lg">
                    <p className="font-semibold text-foreground">{d.symbol}</p>
                    <p className="text-muted-foreground font-mono">Precio: ${formatNumber(d.price)}</p>
                    <p className="text-muted-foreground font-mono">Días: {d.days}</p>
                    <p className="text-primary font-mono">TNA: {d.tna?.toFixed(2)}%</p>
                  </div>
                );
              }}
            />
            <ReferenceLine y={avgTNA} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" opacity={0.5}
              label={{ value: `Prom. ${avgTNA.toFixed(1)}%`, fill: "hsl(var(--muted-foreground))", fontSize: 9, position: "insideTopRight" }} />
            <Line
              type="monotone"
              dataKey="tna"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4, fill: "hsl(var(--primary))" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Contratos DLR</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {data.futures.length} contratos activos · TNA calculada con base A3500 = ${formatNumber(spot)}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Contrato</th>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Vto.</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Días</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Bid</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Offer</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Último</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Settle</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Vol.</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">OI</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Tasa Dir.</th>
                <th className="text-right px-3 py-2 text-primary font-semibold">TNA</th>
              </tr>
            </thead>
            <tbody>
              {data.futures.map((f) => {
                const price = getRepresentativePrice(f);
                const tna = calcImpliedTNA(price, spot, f.daysToExpiry);
                const directRate = calcDirectRate(price, spot);
                return (
                  <tr key={f.symbol} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-3 py-2 text-foreground font-semibold">{formatSymbolShort(f.symbol)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{formatDate(f.expiration)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{f.daysToExpiry}</td>
                    <td className="px-3 py-2 text-right text-foreground">{formatNumber(f.bid)}</td>
                    <td className="px-3 py-2 text-right text-foreground">{formatNumber(f.offer)}</td>
                    <td className="px-3 py-2 text-right text-foreground font-semibold">{formatNumber(f.last)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{formatNumber(f.settlement)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{formatInt(f.volume)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{formatInt(f.openInterest)}</td>
                    <td className="px-3 py-2 text-right text-foreground">{formatPercent(directRate)}</td>
                    <td className="px-3 py-2 text-right text-primary font-semibold">{formatPercent(tna)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-muted-foreground text-center">
        Fuente: Matba Rofex vía Primary API (reMarkets). Datos con posible delay. TNA = (Futuro/Spot − 1) × (365/días).
      </p>
    </div>
  );
}
