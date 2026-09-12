import React, { useMemo } from "react";
import { Users, AlertTriangle, CheckCircle2, Coffee, Clock, Activity } from "lucide-react";
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import type { OrderRecord, AttendanceRecord } from "../../types";

export interface HourlyCapacitySubViewProps {
  orders: OrderRecord[];
  attendance: AttendanceRecord[];
}

const HOURS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM"
];

function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr || typeof timeStr !== "string") return null;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[4];

  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export const HourlyCapacitySubView: React.FC<HourlyCapacitySubViewProps> = ({ orders, attendance }) => {
  const capacityData = useMemo(() => {
    // Obtener días evaluados
    const uniqueDates = Array.from(
      new Set([...orders.map((o) => o.isoDate), ...attendance.map((a) => a.isoDate)].filter(Boolean))
    );
    const dayCount = Math.max(uniqueDates.length, 1);

    // Mapeo por hora
    const stats: Record<
      string,
      {
        hour: string;
        clientsTotal: number;
        clientsAvg: number;
        staffTotalHours: number;
        staffAvg: number;
        ratio: number;
        status: "overload" | "optimal" | "idle";
      }
    > = {};

    HOURS.forEach((h) => {
      stats[h] = {
        hour: h,
        clientsTotal: 0,
        clientsAvg: 0,
        staffTotalHours: 0,
        staffAvg: 0,
        ratio: 0,
        status: "optimal"
      };
    });

    // 1. Contar órdenes por hora
    orders.forEach((o) => {
      if (!o.registerTime) return;
      const match = o.registerTime.match(/(\d{1,2}):\d{2}\s*(AM|PM)?/i);
      if (!match) return;

      let h = parseInt(match[1], 10);
      const p = (match[2] || "AM").toUpperCase();
      const formattedHour = h < 10 ? `0${h}:00 ${p}` : `${h}:00 ${p}`;

      if (stats[formattedHour]) {
        stats[formattedHour].clientsTotal += 1;
      }
    });

    // 2. Contar estilistas presentes por hora
    // Para cada registro de asistencia, chequear en qué horas estuvo activo
    attendance.forEach((att) => {
      const entryMin = parseTimeToMinutes(att.entryTime);
      if (entryMin === null) return;

      // Si no hay exitTime, asumir turno típico hasta las 8:00 PM (1200 min) o entry + 8h
      const exitMin = parseTimeToMinutes(att.exitTime) || Math.min(entryMin + 8 * 60, 20 * 60);
      const breakStartMin = parseTimeToMinutes(att.breakStart);
      const breakEndMin = parseTimeToMinutes(att.breakEnd);

      HOURS.forEach((h) => {
        const match = h.match(/(\d{1,2}):\d{2}\s*(AM|PM)?/i);
        if (!match) return;

        let hourVal = parseInt(match[1], 10);
        const p = (match[2] || "AM").toUpperCase();
        if (p === "PM" && hourVal < 12) hourVal += 12;
        if (p === "AM" && hourVal === 12) hourVal = 0;

        const checkMin = hourVal * 60 + 30; // Punto medio de la hora

        // Verificar si estaba dentro de su horario
        if (checkMin >= entryMin && checkMin <= exitMin) {
          // Verificar si no estaba en refrigerio
          const isOnBreak =
            breakStartMin !== null &&
            breakEndMin !== null &&
            checkMin >= breakStartMin &&
            checkMin <= breakEndMin;

          if (!isOnBreak) {
            stats[h].staffTotalHours += 1;
          }
        }
      });
    });

    // 3. Consolidar promedios y ratios
    const list = HOURS.map((h) => {
      const item = stats[h];
      const clientsAvg = Number((item.clientsTotal / dayCount).toFixed(1));
      const staffAvg = Number((item.staffTotalHours / dayCount).toFixed(1));

      // Ratio: Clientes por estilista
      const ratio = staffAvg > 0 ? Number((clientsAvg / staffAvg).toFixed(2)) : clientsAvg > 0 ? 2.0 : 0;

      let status: "overload" | "optimal" | "idle" = "optimal";
      if (ratio > 1.25) {
        status = "overload";
      } else if (ratio < 0.65 && clientsAvg < 2) {
        status = "idle";
      }

      return {
        ...item,
        clientsAvg,
        staffAvg,
        ratio,
        status
      };
    });

    // Encontrar extremos
    let highestRatioItem = list[0];
    let mostIdleItem = list[0];

    list.forEach((it) => {
      if (it.ratio > highestRatioItem.ratio) highestRatioItem = it;
      if (it.staffAvg > 0 && it.ratio < mostIdleItem.ratio) mostIdleItem = it;
    });

    return {
      list,
      dayCount,
      highestRatioItem,
      mostIdleItem
    };
  }, [orders, attendance]);

  return (
    <div className="space-y-4">
      {/* Resumen Superior de Estado de Capacidad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 bg-rose-50/70 border border-rose-200/90 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
              Punto de Máxima Saturación
            </span>
            <p className="text-sm font-extrabold text-slate-900">
              {capacityData.highestRatioItem?.hour} &middot; Ratio {capacityData.highestRatioItem?.ratio}x
            </p>
            <span className="text-xs text-rose-600 font-medium">
              {capacityData.highestRatioItem?.clientsAvg} clientes vs {capacityData.highestRatioItem?.staffAvg} estilistas en promedio
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/90 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Zona de Máxima Disponibilidad
            </span>
            <p className="text-sm font-extrabold text-slate-900">
              {capacityData.mostIdleItem?.hour} &middot; Ratio {capacityData.mostIdleItem?.ratio}x
            </p>
            <span className="text-xs text-emerald-700 font-medium">
              Oportunidad ideal para servicios complejos de larga duración
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Días Analizados
            </span>
            <p className="text-sm font-extrabold text-slate-900">
              {capacityData.dayCount} días en el rango
            </p>
            <span className="text-xs text-slate-500 font-medium">
              Cálculo por asistencia real y órdenes registradas
            </span>
          </div>
        </div>
      </div>

      {/* Gráfico Comparativo: Demanda vs Estilistas en Turno */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-600" />
              Curva de Capacidad: Clientes Simultáneos vs Estilistas en Turno (Promedio por Hora)
            </h4>
            <p className="text-[11px] text-slate-500">
              Compara el flujo de clientes que ingresan contra la cantidad de estilistas activos en salón.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-cyan-700">
              <span className="w-3 h-3 rounded-full bg-cyan-600" /> Clientes Promedio
            </span>
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-3 h-3 rounded bg-emerald-500/50 border border-emerald-500" /> Estilistas en Turno
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={capacityData.list} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="clientFlowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0]?.payload;
                  if (!item) return null;

                  return (
                    <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl p-3 text-xs min-w-[220px]">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-cyan-600" />
                          {label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            item.status === "overload"
                              ? "bg-rose-100 text-rose-800"
                              : item.status === "idle"
                              ? "bg-sky-100 text-sky-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {item.status === "overload"
                            ? "🚨 Sobrecarga"
                            : item.status === "idle"
                            ? "🟢 Capacidad Libre"
                            : "✅ Balanceado"}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-600" />
                            Clientes Promedio:
                          </span>
                          <strong className="text-slate-900">{item.clientsAvg}</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded bg-emerald-500" />
                            Estilistas en Turno:
                          </span>
                          <strong className="text-slate-900">{item.staffAvg}</strong>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-slate-700">
                          <span>Ratio de Saturación:</span>
                          <strong
                            className={`font-mono ${
                              item.ratio > 1.25 ? "text-rose-600" : "text-emerald-700"
                            }`}
                          >
                            {item.ratio} clientes / estilista
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="staffAvg"
                name="Estilistas en Turno"
                fill="#10b981"
                opacity={0.35}
                radius={[4, 4, 0, 0]}
              />
              <Area
                type="monotone"
                dataKey="clientsAvg"
                name="Clientes Promedio"
                stroke="#0284c7"
                strokeWidth={2.5}
                fill="url(#clientFlowGradient)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Matriz de Diagnóstico por Hora */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Diagnóstico Operativo Hora por Hora
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Evaluación de balance entre oferta y demanda
          </span>
        </div>
        <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
          {capacityData.list.map((item) => (
            <div
              key={item.hour}
              className="p-2.5 sm:px-4 flex items-center justify-between hover:bg-slate-50/60 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-800 w-20">{item.hour}</span>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  {item.clientsAvg} clientes &middot; {item.staffAvg} estilistas
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-slate-700 mr-2">
                  {item.ratio}x
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                    item.status === "overload"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : item.status === "idle"
                      ? "bg-sky-50 text-sky-800 border border-sky-200"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {item.status === "overload" && (
                    <>
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Saturación Alta
                    </>
                  )}
                  {item.status === "idle" && (
                    <>
                      <Coffee className="w-3 h-3 text-sky-600" />
                      Capacidad Libre
                    </>
                  )}
                  {item.status === "optimal" && (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Equilibrado
                    </>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
