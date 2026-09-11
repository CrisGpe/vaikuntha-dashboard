import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  color?: "cyan" | "emerald" | "amber" | "indigo" | "rose" | "purple";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "cyan"
}) => {
  const colorStyles = {
    cyan: "bg-cyan-50/70 border-cyan-100 text-cyan-600",
    emerald: "bg-emerald-50/70 border-emerald-100 text-emerald-600",
    amber: "bg-amber-50/70 border-amber-100 text-amber-600",
    indigo: "bg-indigo-50/70 border-indigo-100 text-indigo-600",
    rose: "bg-rose-50/70 border-rose-100 text-rose-600",
    purple: "bg-purple-50/70 border-purple-100 text-purple-600"
  };

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-200 relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2.5">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-2xl font-black mt-0.5 text-slate-900 tracking-tight">{value}</p>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-tight">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg border shrink-0 ${colorStyles[color]}`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          <span
            className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
              trend.isPositive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {trend.value}
          </span>
          <span className="text-slate-400 text-[10px]">en este período</span>
        </div>
      )}
    </div>
  );
};
