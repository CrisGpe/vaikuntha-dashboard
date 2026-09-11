import React from "react";
import { PieChart as PieIcon } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface ModalityItem {
  name: string;
  value: number;
}

interface ModalityPieChartProps {
  modalities: ModalityItem[];
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

export const ModalityPieChart: React.FC<ModalityPieChartProps> = ({
  modalities,
  colors = DEFAULT_COLORS
}) => {
  return (
    <div className="lg:col-span-4 p-4 sm:p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 mb-0.5">
          <PieIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          Modalidad de Ingreso
        </h3>
        <p className="text-[11px] text-slate-500 font-medium">
          Turnos en sala vs Citas vs Asesorías
        </p>
      </div>

      <div className="h-48 w-full my-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={modalities}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {modalities.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#e2e8f0",
                borderRadius: "12px",
                color: "#0f172a",
                fontSize: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100">
        {modalities.slice(0, 4).map((item, i) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="text-slate-700 font-medium">{item.name}</span>
            </div>
            <span className="text-slate-900 font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
