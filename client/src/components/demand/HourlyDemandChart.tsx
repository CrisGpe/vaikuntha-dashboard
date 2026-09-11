import React, { useState } from "react";
import { Clock, Filter } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface HourlyDemandChartProps {
  hourlyDemand: any[];
  activeModalities: string[];
  activeServicesForHourly: string[];
  serviceDistribution: { name: string; count: number }[];
  clientTypeDistribution: { name: string; value: number }[];
  modalityColors?: Record<string, string>;
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

const DEFAULT_MODALITY_COLORS: Record<string, string> = {
  "Cliente": "#0284c7",
  "Turno": "#0d9488",
  "Cita": "#7c3aed",
  "Asesoría": "#f59e0b",
  "TurnoCaballero": "#059669",
  "TurnoNino": "#ea580c",
  "TurnoNiño": "#ea580c",
  "Correccion": "#dc2626",
  "Producto": "#8b5cf6"
};

export const HourlyDemandChart: React.FC<HourlyDemandChartProps> = ({
  hourlyDemand,
  activeModalities,
  activeServicesForHourly,
  serviceDistribution,
  clientTypeDistribution,
  modalityColors = DEFAULT_MODALITY_COLORS,
  colors = DEFAULT_COLORS
}) => {
  const [hourlyViewMode, setHourlyViewMode] = useState<"total" | "modality" | "service">("total");
  const [selectedServiceGroup, setSelectedServiceGroup] = useState<string>("TOP5");

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
            Curva de Demanda Horaria en el Local
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            {hourlyViewMode === "total" && "Demanda total consolidada por hora para coordinar turnos y descansos"}
            {hourlyViewMode === "modality" && "Comportamiento de afluencia desagregado por forma de ingreso (Cliente, Turno, Cita)"}
            {hourlyViewMode === "service" && "Demanda horaria desagregada por Tipo de OATC (Servicios de belleza y cuidado)"}
          </p>
        </div>

        {/* Selector de Desagregación */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setHourlyViewMode("total")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                hourlyViewMode === "total"
                  ? "bg-white text-cyan-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Demanda Total
            </button>
            <button
              onClick={() => setHourlyViewMode("modality")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                hourlyViewMode === "modality"
                  ? "bg-white text-cyan-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Por Modalidad de Ingreso
            </button>
            <button
              onClick={() => setHourlyViewMode("service")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                hourlyViewMode === "service"
                  ? "bg-white text-cyan-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Por Tipo de OATC
            </button>
          </div>

          {hourlyViewMode === "service" && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <select
                value={selectedServiceGroup}
                onChange={(e) => setSelectedServiceGroup(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer pr-1 max-w-[170px] truncate"
              >
                <option value="TOP5">Top 5 Servicios</option>
                <option value="ALL">Top 8 Servicios</option>
                {serviceDistribution.map((s) => (
                  <option key={s.name} value={s.name}>
                    Solo: {s.name} ({s.count})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="h-60 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourlyDemand} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotalLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} />
            <YAxis
              allowDecimals={false}
              stroke="#94a3b8"
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              domain={[0, (dataMax: number) => Math.max(1, Math.ceil(dataMax))]}
              tickFormatter={(val: number) => `${Math.floor(val)}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const activeItems = payload.filter((p: any) => (Number(p.value) || 0) > 0);
                const totalVal = payload[0]?.payload?.total || 0;

                return (
                  <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl p-3 text-xs min-w-[210px]">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-600" />
                        {label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-50 text-cyan-700 border border-cyan-200">
                        {totalVal} {totalVal === 1 ? "atención" : "atenciones"}
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {hourlyViewMode === "total" ? (
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
                            Demanda Total
                          </span>
                          <span className="font-bold text-slate-900">{totalVal}</span>
                        </div>
                      ) : activeItems.length > 0 ? (
                        activeItems.map((item: any) => (
                          <div key={item.name} className="flex items-center justify-between gap-3 text-slate-700">
                            <span className="flex items-center gap-1.5 truncate max-w-[140px]">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: item.stroke || item.color }}
                              />
                              <span className="truncate">{item.name}</span>
                            </span>
                            <span className="font-bold text-slate-900 shrink-0">{item.value}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 italic text-[11px]">Sin atenciones en esta hora</p>
                      )}
                    </div>
                  </div>
                );
              }}
            />

            {/* Renderizado Condicional de Áreas */}
            {hourlyViewMode === "total" && (
              <Area
                type="monotone"
                dataKey="total"
                name="Demanda Total"
                stroke="#0284c7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorTotalLight)"
              />
            )}

            {hourlyViewMode === "modality" &&
              activeModalities.map((m, idx) => {
                const color = modalityColors[m] || colors[idx % colors.length];
                return (
                  <Area
                    key={m}
                    type="monotone"
                    dataKey={m}
                    name={m}
                    stroke={color}
                    strokeWidth={2.5}
                    fillOpacity={0.12}
                    fill={color}
                  />
                );
              })}

            {hourlyViewMode === "service" &&
              activeServicesForHourly.map((s, idx) => {
                const color = colors[idx % colors.length];
                return (
                  <Area
                    key={s}
                    type="monotone"
                    dataKey={s}
                    name={s}
                    stroke={color}
                    strokeWidth={2.5}
                    fillOpacity={0.12}
                    fill={color}
                  />
                );
              })}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda Dinámica de Categorías Activas */}
      {hourlyViewMode === "modality" && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Modalidades:
          </span>
          {activeModalities.map((m, idx) => {
            const color = modalityColors[m] || colors[idx % colors.length];
            const count = clientTypeDistribution.find((c) => c.name === m)?.value || 0;
            return (
              <div
                key={m}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span>{m}</span>
                <span className="text-slate-400 font-normal">({count})</span>
              </div>
            );
          })}
        </div>
      )}

      {hourlyViewMode === "service" && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Servicios Graficados:
          </span>
          {activeServicesForHourly.map((s, idx) => {
            const color = colors[idx % colors.length];
            const count = serviceDistribution.find((item) => item.name === s)?.count || 0;
            return (
              <div
                key={s}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span>{s}</span>
                <span className="text-slate-400 font-normal">({count})</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
