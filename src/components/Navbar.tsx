import { NavLink } from "react-router-dom";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Calculator, LineChart, LayoutGrid, BarChart3, TrendingUp,
  Activity, Sun, Moon,
} from "lucide-react";

const LINKS: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { to: "/",                label: "Calculadora",   icon: Calculator },
  { to: "/fx",              label: "FX",            icon: LineChart },
  { to: "/mini-dashboard",  label: "Mini Dashboard", icon: LayoutGrid },
  { to: "/curvas",          label: "Curvas",        icon: Activity },
  { to: "/icg",             label: "ICG",           icon: BarChart3 },
  { to: "/analisis",        label: "Análisis",      icon: TrendingUp },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isLight = mounted && theme === "light";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center h-12">
        <div className="flex items-center gap-1 flex-1 overflow-x-auto">
          <span className="text-sm font-bold text-primary mr-4 whitespace-nowrap">analisisdebonos.com</span>
          {LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}
        </div>

        <button
          onClick={() => setTheme(isLight ? "dark" : "light")}
          className="ml-2 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title={isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
          aria-label="Toggle theme"
        >
          {mounted && (isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />)}
        </button>
      </div>
    </nav>
  );
}
