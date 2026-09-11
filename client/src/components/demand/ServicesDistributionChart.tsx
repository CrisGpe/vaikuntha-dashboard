import React from "react";
import { TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface ServiceItem {
  name: string;
  count: number;
  percentage: string;
}

interface ServicesDistributionChartProps {
  services: ServiceItem[];
  colors?: string[];
}

const DEFAULT_COLORS = [
  "#0284c7",
  "#0d9488",
  "#7c3aed",
  "#db2777",
  "#d97706",
  "#16a34a",
  "#4f46e5",
  "#e11d48",
  "#0891b2",
  "#9333ea"
];

export const ServicesDistributionChart: React.FC<ServicesDistributionChartProps> = ({
  services,
  colors = DEFAULT_COLORS
}) => {
  return (
    <div className="lg:col-span-8 p-4 sm:p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
            Demanda por Tipo de OATC (Volumen de Servicios)
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            Categorías de belleza y cuidado que concentran las órdenes de atención
          </p>
        </div>
        <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
          {services.length} Categorías
        </span>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={services}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              stroke="#94a3b8"
              tickLine={false}
              tick={{ fontSize: 11 }}
              domain={[0, (dataMax: number) => Math.max(1, Math.ceil(dataMax))]}
              tickFormatter={(val: number) => `${Math.floor(val)}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#64748b"
              tick={{ fontSize: 11, fill: "#334155" }}
              tickLine={false}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#e2e8f0",
                borderRadius: "12px",
                color: "#0f172a",
                fontSize: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
              }}
              formatter={(val: any) => [`${val} atenciones`, "Total"]}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {services.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
