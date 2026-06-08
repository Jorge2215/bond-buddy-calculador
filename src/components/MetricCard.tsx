import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: ReactNode;
  variant?: "default" | "positive" | "negative" | "warning" | "info";
  className?: string;
}

const variantStyles = {
  default: "border-border",
  positive: "border-positive/30",
  negative: "border-negative/30",
  warning: "border-warning/30",
  info: "border-info/30",
};

const valueStyles = {
  default: "text-foreground",
  positive: "text-positive",
  negative: "text-negative",
  warning: "text-warning",
  info: "text-info",
};

export function MetricCard({ label, value, sublabel, icon, variant = "default", className }: MetricCardProps) {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-4 transition-all hover:bg-secondary/50",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className={cn("text-2xl font-semibold font-mono tabular-nums", valueStyles[variant])}>
        {value}
      </div>
      {sublabel && (
        <div className="text-xs text-muted-foreground mt-1">{sublabel}</div>
      )}
    </div>
  );
}
