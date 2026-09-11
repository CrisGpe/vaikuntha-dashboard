import React, { useState, useMemo } from "react";
import { Calendar, Flame, Clock, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from "recharts";
import type { OrderRecord } from "../../types";

export interface DayOfWeekDemandChartProps {
  orders: OrderRecord[];
  activeModalities?: string[];
}

interface DayData {
  dayName: string;
  shortName: string;
  dayIndex: number;
  isWeekend: boolean;
  total: number;
  percentage: number;
  [key: string]: any;
}

const DAYS_DEFINITION = [
  { key: 1, name: "Lunes", short: "Lun", isWeekend: false },
  { key: 2, name: "Martes", short: "Mar", isWeekend: false },
  { key: 3, name: "Miércoles", short: "Mié", isWeekend: false },
  { key: 4, name: "Jueves", short: "Jue", isWeekend: false },
  { key: 5, name: "Viernes", short: "Vie", isWeekend: true },
  { key: 6, name: "Sábado", short: "Sáb", isWeekend: true },
  { key: 0, name: "Domingo", short: "Dom", isWeekend: true }
];

const MODALITY_COLORS: Record<string, string> = {
  Turno: "#0891b2",
  Cliente: "#0284c7",
  Cita: "#6366f1",
  Asesoría: "#8b5cf6",
  TurnoCaballero: "#10b981",
  TurnoNiño: "#f59e0b",
  Correccion: "#ef4444"
};

const DEFAULT_MODALITY_PALETTE = [
  "#0891b2",
  "#6366f1",
  "#0284c7",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#64748b"
];

export const DayOfWeekDemandChart: React.FC<DayOfWeekDemandChartProps> = ({
  orders,
  activeModalities = []
}) => {
  const [viewMode, setViewMode] = useState<"total" | "modality">("total");

  // Procesamiento y agregación por día de la semana
  const dayStats = useMemo(() => {
    const map: Record<number, DayData> = {};
    DAYS_DEFINITION.forEach((d) => {
      map[d.key] = {
        dayName: d.name,
        shortName: d.short,
        dayIndex: d.key,
        isWeekend: d.isWeekend,
        total: 0,
        percentage: 0
      };
    });

    const detectedModalities = new Set<string>();

    orders.forEach((o) => {
      if (!o.isoDate) return;
      const d = new Date(o.isoDate + "T12:00:00Z");
      const dayIdx = d.getUTCDay();

      if (map[dayIdx]) {
        map[dayIdx].total += 1;

        const modality = o.clientType || "Cliente";
        detectedModalities.add(modality);
        map[dayIdx][modality] = (map[dayIdx][modality] || 0) + 1;
      }
    });

    const totalOrders = orders.length || 1;
    const list = DAYS_DEFINITION.map((d) => {
      const item = map[d.key];
      item.percentage = Number(((item.total / totalOrders) * 100).toFixed(1));
      return item;
    });

    // Métricas ejecutivas
    const weekdayOrders = list
      .filter((d) => !d.isWeekend)
      .reduce((acc, curr) => acc + curr.total, 0);
    const weekendOrders = list
      .filter((d) => d.isWeekend)
      .reduce((acc, curr) => acc + curr.total, 0);

    const weekdayPercentage = Number(((weekdayOrders / totalOrders) * 100).toFixed(1));
    const weekendPercentage = Number(((weekendOrders / totalOrders) * 100).toFixed(1));

    // Día pico y día más ocioso
    const sortedByTotal = [...list].sort((a, b) => b.total - a.total);
    const peakDay = sortedByTotal[0] || list[0];
    const idleDay = sortedByTotal[sortedByTotal.length - 1] || list[0];

    const modalitiesList =
      activeModalities.length > 0
        ? activeModalities
        : Array.from(detectedModalities).slice(0, 6);

    return {
      list,
      weekdayOrders,
      weekendOrders,
      weekdayPercentage,
      weekendPercentage,
      peakDay,
      idleDay,
      modalitiesList,
      totalOrders: orders.length
    };
  }, [orders, activeModalities]);

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
      {/* Cabecera y Controles */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            Corte por Variable Día (Comportamiento Semanal)
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            Acumulación hacia el fin de semana (Vie - Dom) vs días de baja demanda / ociosidad (Lun - Jue)
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-lg border border-slate-200 self-stretch md:self-auto">
          <button
            onClick={() => setViewMode("total")}
            className={`flex-1 md:flex-initial px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
              viewMode === "total"
                ? "bg-white text-indigo-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Total Órdenes
          </button>
          <button
            onClick={() => setViewMode("modality")}
            className={`flex-1 md:flex-initial px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
              viewMode === "modality"
                ? "bg-white text-indigo-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Por Modalidad
          </button>
        </div>
      </div>

      {/* 3 Tarjetas de Resumen Ejecutivo de la Dinámica Semanal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
        {/* Fin de Semana (Carga Alta) */}
        <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/70 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-900">
              <Flame className="w-3.5 h-3.5 text-indigo-600" />
              Fin de Semana (Vie–Dom)
            </div>
            <p className="text-lg sm:text-xl font-extrabold text-indigo-950 mt-0.5">
              {dayStats.weekendOrders.toLocaleString("es-ES")}{" "}
              <span className="text-xs font-bold text-indigo-700 font-mono">
                ({dayStats.weekendPercentage}%)
              </span>
            </p>
            <span className="text-[10px] text-indigo-700/80 font-medium">
              3 días concentran más de la mitad
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            Pico de Demanda 🔥
          </span>
        </div>

        {/* Semana Laboral (Días Ociosos) */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Días Ociosos (Lun–Jue)
            </div>
            <p className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
              {dayStats.weekdayOrders.toLocaleString("es-ES")}{" "}
              <span className="text-xs font-bold text-slate-500 font-mono">
                ({dayStats.weekdayPercentage}%)
              </span>
            </p>
            <span className="text-[10px] text-slate-500 font-medium">
              4 días con capacidad disponible
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Capacidad Ociosa ⏳
          </span>
        </div>

        {/* Brecha Pico vs Valle */}
        <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-200/70 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-900">
              <BarChart3 className="w-3.5 h-3.5 text-cyan-600" />
              Día Pico vs Valle
            </div>
            <p className="text-xs font-bold text-slate-800 mt-1">
              Pico: <strong className="text-cyan-800 font-black">{dayStats.peakDay?.dayName}</strong>{" "}
              ({dayStats.peakDay?.total} ord - {dayStats.peakDay?.percentage}%)
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Valle: <strong className="text-slate-700">{dayStats.idleDay?.dayName}</strong>{" "}
              ({dayStats.idleDay?.total} ord - {dayStats.idleDay?.percentage}%)
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
            {(dayStats.peakDay?.total / (dayStats.idleDay?.total || 1)).toFixed(1)}x brecha
          </span>
        </div>
      </div>

      {/* Gráfico Recharts */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dayStats.list}
            margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="shortName"
              tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
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
              formatter={(val: any, name: any) => [
                `${Number(val).toLocaleString("es-ES")} órdenes`,
                name === "total" ? "Total Atenciones" : name
              ]}
              labelFormatter={(lbl, items) => {
                const day = items[0]?.payload as DayData | undefined;
                if (!day) return lbl;
                return `${day.dayName} • ${day.total.toLocaleString("es-ES")} órdenes (${day.percentage}% del total)`;
              }}
            />

            {viewMode === "total" ? (
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {dayStats.list.map((entry) => (
                  <Cell
                    key={`cell-${entry.dayName}`}
                    fill={entry.isWeekend ? "#4f46e5" : "#94a3b8"}
                  />
                ))}
              </Bar>
            ) : (
              <>
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  iconType="circle"
                />
                {dayStats.modalitiesList.map((m, idx) => {
                  const color =
                    MODALITY_COLORS[m] ||
                    DEFAULT_MODALITY_PALETTE[idx % DEFAULT_MODALITY_PALETTE.length];
                  return (
                    <Bar
                      key={m}
                      dataKey={m}
                      name={m}
                      stackId="modalities"
                      fill={color}
                      radius={
                        idx === dayStats.modalitiesList.length - 1
                          ? [6, 6, 0, 0]
                          : [0, 0, 0, 0]
                      }
                    />
                  );
                })}
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda de Días y Tipología */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-indigo-600" />
            <span className="font-semibold text-slate-700">Fin de Semana (Vie, Sáb, Dom)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-400" />
            <span className="font-medium text-slate-600">Días de Semana (Lun a Jue)</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 italic">
          *Datos calculados dinámicamente según filtros de fecha y agente seleccionados
        </span>
      </div>
    </div>
  );
};
