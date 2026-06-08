import { CashFlowRow } from "@/lib/bondCalculator";

interface CashFlowTableProps {
  rows: CashFlowRow[];
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' });
}

function fmt(n: number, decimals = 2): string {
  if (n === 0) return "-";
  return n.toFixed(decimals);
}

export function CashFlowTable({ rows }: CashFlowTableProps) {
  const futureRows = rows.filter(r => r.cashFlow > 0);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Flujos de Caja Futuros</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{futureRows.length} períodos restantes</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">#</th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">Fecha</th>
              <th className="text-right px-3 py-2 text-muted-foreground font-medium">Principal</th>
              <th className="text-right px-3 py-2 text-muted-foreground font-medium">Amort.</th>
              <th className="text-right px-3 py-2 text-muted-foreground font-medium">Interés</th>
              <th className="text-right px-3 py-2 text-muted-foreground font-medium">Flujo</th>
              <th className="text-right px-3 py-2 text-muted-foreground font-medium">Días</th>
              <th className="text-right px-3 py-2 text-muted-foreground font-medium">VPN</th>
              <th className="text-right px-3 py-2 text-muted-foreground font-medium">Duration</th>
            </tr>
          </thead>
          <tbody>
            {futureRows.map((row, i) => (
              <tr
                key={row.period}
                className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
              >
                <td className="px-3 py-2 text-muted-foreground">{row.period}</td>
                <td className="px-3 py-2 text-foreground">{formatDate(row.date)}</td>
                <td className="px-3 py-2 text-right text-foreground">{fmt(row.principal + row.amortPayment)}</td>
                <td className="px-3 py-2 text-right text-warning">{fmt(row.amortPayment)}</td>
                <td className="px-3 py-2 text-right text-info">{fmt(row.interestPayment, 3)}</td>
                <td className="px-3 py-2 text-right text-positive font-medium">{fmt(row.cashFlow)}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{row.daysFromSettlement}</td>
                <td className="px-3 py-2 text-right text-foreground">{fmt(row.pvAtMarket)}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{fmt(row.durationComponent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
