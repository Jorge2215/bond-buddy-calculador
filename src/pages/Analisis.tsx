import { useState } from "react";
import { TrendingUp, Globe } from "lucide-react";
import AnalisisCer from "./AnalisisCer";
import AnalisisGlobales from "./AnalisisGlobales";

type Tab = "cer" | "globales";

export default function Analisis() {
  const [tab, setTab] = useState<Tab>("cer");

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-4 space-y-4">
        {/* Tab bar */}
        <div className="border-b border-border flex items-center gap-1">
          {([
            ["cer", "CER vs Tasa Fija", TrendingUp],
            ["globales", "Retorno Total Globales", Globe],
          ] as [Tab, string, typeof TrendingUp][]).map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === k
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {tab === "cer" ? <AnalisisCer /> : <AnalisisGlobales />}
      </main>
    </div>
  );
}
