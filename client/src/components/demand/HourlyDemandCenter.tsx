import React, { useState, useMemo } from "react";
import {
  Clock,
  Filter,
  Flame,
  Users,
  Sparkles,
  TrendingUp,
  Calendar
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import type { OrderRecord, AttendanceRecord } from "../../types";
import { HourlyHeatmapSubView } from "./HourlyHeatmapSubView";
import { HourlyCapacitySubView } from "./HourlyCapacitySubView";
import { HourlyIntelligenceSubView } from "./HourlyIntelligenceSubView";

interface HourlyDemandCenterProps {
  orders: OrderRecord[];
  attendance: AttendanceRecord[];
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
  Cliente: "#0284c7",
  Turno: "#0d9488",
  Cita: "#7c3aed",
  Asesoría: "#f59e0b",
  TurnoCaballero: "#059669",
  TurnoNino: "#ea580c",
  TurnoNiño: "#ea580c",
  Correccion: "#dc2626",
  Producto: "#8b5cf6"
};

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

const DAY_FILTER_OPTIONS = [
  { value: "ALL", label: "Todos los Días" },
  { value: "WEEKEND", label: "Fin de Semana (Vie - Dom)" },
  { value: "WEEKDAY", label: "Días Laborables (Lun - Jue)" },
  { value: "6", label: "Solo Sábados" },
  { value: "5", label: "Solo Viernes" },
  { value: "0", label: "Solo Domingos" },
  { value: "1", label: "Solo Lunes" },
  { value: "2", label: "Solo Martes" },
  { value: "3", label: "Solo Miércoles" },
  { value: "4", label: "Solo Jueves" }
];

export const HourlyDemandCenter: React.FC<HourlyDemandCenterProps> = ({
  orders,
  attendance,
  activeModalities,
  activeServicesForHourly,
  serviceDistribution,
  clientTypeDistribution,
  modalityColors = DEFAULT_MODALITY_COLORS,
  colors = DEFAULT_COLORS
}) => {
  // Pestaña activa principal
  const [activeTab, setActiveTab] = useState<"curve" | "heatmap" | "capacity" | "intelligence">("curve");

  // Filtros internos de la pestaña "Curva Dinámica"
  const [curveMetric, setCurveMetric] = useState<"avg" | "total">("avg");
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>("ALL");
  const [breakdownMode, setBreakdownMode] = useState<"total" | "modality" | "service">("total");
  const [selectedServiceGroup, setSelectedServiceGroup] = useState<string>("TOP5");

  // Filtrado de órdenes según el día seleccionado para la Curva
  const curveFilteredOrders = useMemo(() => {
    if (selectedDayFilter === "ALL") return orders;

    return orders.filter((o) => {
      if (!o.isoDate) return true;
      const d = new Date(o.isoDate + "T12:00:00Z");
      const dayIdx = d.getUTCDay();

      if (selectedDayFilter === "WEEKEND") {
        return dayIdx === 5 || dayIdx === 6 || dayIdx === 0;
      }
      if (selectedDayFilter === "WEEKDAY") {
        return dayIdx >= 1 && dayIdx <= 4;
      }
      return dayIdx === parseInt(selectedDayFilter, 10);
    });
  }, [orders, selectedDayFilter]);

  // Cálculo de ocurrencias de fechas en el subconjunto de días para promediar
  const distinctDatesCount = useMemo(() => {
    const dates = new Set<string>();
    curveFilteredOrders.forEach((o) => {
      if (o.isoDate) dates.add(o.isoDate);
    });
    return Math.max(dates.size, 1);
  }, [curveFilteredOrders]);

  // Cálculo de la Curva Horaria Dinámica (Promedio Típico vs Total)
  const dynamicHourlyData = useMemo(() => {
    const map: Record<string, Record<string, any>> = {};
    HOURS.forEach((h) => {
      map[h] = { hour: h, totalCount: 0, total: 0 };
    });

    curveFilteredOrders.forEach((o) => {
      if (!o.registerTime) return;
      const match = o.registerTime.match(/(\d{1,2}):\d{2}\s*(AM|PM)?/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const p = (match[2] || "AM").toUpperCase();
        const formatted = h < 10 ? `0${h}:00 ${p}` : `${h}:00 ${p}`;
        if (map[formatted]) {
          map[formatted].totalCount += 1;

          const modality = o.clientType || "Cliente";
          map[formatted][`${modality}_count`] = (map[formatted][`${modality}_count`] || 0) + 1;

          const srv = o.serviceType || "Otros";
          map[formatted][`${srv}_count`] = (map[formatted][`${srv}_count`] || 0) + 1;
        }
      }
    });

    // Transformar a Promedio o Total según curveMetric
    return HOURS.map((h) => {
      const row = map[h];
      const isAvg = curveMetric === "avg";
      const divisor = distinctDatesCount;

      const item: Record<string, any> = {
        hour: h,
        rawCount: row.totalCount,
        total: isAvg ? Number((row.totalCount / divisor).toFixed(1)) : row.totalCount
      };

      // Modalidades
      activeModalities.forEach((m) => {
        const count = row[`${m}_count`] || 0;
        item[m] = isAvg ? Number((count / divisor).toFixed(1)) : count;
      });

      // Servicios
      activeServicesForHourly.forEach((s) => {
        const count = row[`${s}_count`] || 0;
        item[s] = isAvg ? Number((count / divisor).toFixed(1)) : count;
      });

      return item;
    });
  }, [curveFilteredOrders, curveMetric, distinctDatesCount, activeModalities, activeServicesForHourly]);

  // Servicios filtrados por el selector de grupos
  const visibleServices = useMemo(() => {
    if (selectedServiceGroup === "TOP5") return activeServicesForHourly.slice(0, 5);
    if (selectedServiceGroup === "ALL") return activeServicesForHourly;
    return activeServicesForHourly.filter((s) => s === selectedServiceGroup);
  }, [activeServicesForHourly, selectedServiceGroup]);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
      {/* 1. Encabezado y Selector de Pestañas de Inteligencia */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-600" />
            Centro de Inteligencia Horaria & Demanda
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Analítica de patrones de afluencia, mapa térmico semanal, balance de capacidad vs personal y recomendaciones operativas.
          </p>
        </div>

        {/* 4 Pestañas Principales */}
        <div className="flex flex-wrap items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("curve")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "curve"
                ? "bg-white text-cyan-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-cyan-600" />
            Curva Dinámica
          </button>
          <button
            onClick={() => setActiveTab("heatmap")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "heatmap"
                ? "bg-white text-cyan-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            Heatmap 2D
          </button>
          <button
            onClick={() => setActiveTab("capacity")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "capacity"
                ? "bg-white text-cyan-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            Capacidad vs Personal
          </button>
          <button
            onClick={() => setActiveTab("intelligence")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "intelligence"
                ? "bg-white text-cyan-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Proyección & Descansos
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: CURVA DINÁMICA DE DEMANDA */}
      {activeTab === "curve" && (
        <div className="space-y-4">
          {/* Controles Avanzados de la Curva */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
            {/* Selector de Promedio vs Total & Filtro de Día */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Métrica: Promedio Típico vs Total */}
              <div className="flex items-center p-0.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setCurveMetric("avg")}
                  className={`px-3 py-1 rounded-md transition cursor-pointer ${
                    curveMetric === "avg"
                      ? "bg-cyan-600 text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Promedia las órdenes entre la cantidad de días evaluados en el rango"
                >
                  Promedio Diario Típico
                </button>
                <button
                  onClick={() => setCurveMetric("total")}
                  className={`px-3 py-1 rounded-md transition cursor-pointer ${
                    curveMetric === "total"
                      ? "bg-cyan-600 text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Muestra el número total absoluto de órdenes acumuladas"
                >
                  Total Acumulado
                </button>
              </div>

              {/* Selector de Día de la Semana */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                <Calendar className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                <span className="font-semibold text-slate-500">Corte por Día:</span>
                <select
                  value={selectedDayFilter}
                  onChange={(e) => setSelectedDayFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
                >
                  {DAY_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selector de Desagregación (Total, Modalidad, Servicio) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center p-0.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setBreakdownMode("total")}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    breakdownMode === "total"
                      ? "bg-slate-800 text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Total
                </button>
                <button
                  onClick={() => setBreakdownMode("modality")}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    breakdownMode === "modality"
                      ? "bg-slate-800 text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Por Modalidad
                </button>
                <button
                  onClick={() => setBreakdownMode("service")}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    breakdownMode === "service"
                      ? "bg-slate-800 text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Por OATC
                </button>
              </div>

              {breakdownMode === "service" && (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs">
                  <Filter className="w-3 h-3 text-cyan-600 shrink-0" />
                  <select
                    value={selectedServiceGroup}
                    onChange={(e) => setSelectedServiceGroup(e.target.value)}
                    className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer pr-1 max-w-[150px] truncate"
                  >
                    <option value="TOP5">Top 5 Servicios</option>
                    <option value="ALL">Top 8 Servicios</option>
                    {serviceDistribution.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Gráfico Recharts con Curva Suavizada */}
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicHourlyData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDynamicTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} />
                <YAxis
                  allowDecimals={curveMetric === "avg"}
                  stroke="#94a3b8"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  domain={[0, (dataMax: number) => Math.max(1, Math.ceil(dataMax * 1.1))]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const totalVal = payload[0]?.payload?.total || 0;
                    const rawVal = payload[0]?.payload?.rawCount || 0;
                    const activeItems = payload.filter((p: any) => (Number(p.value) || 0) > 0);

                    return (
                      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl p-3 text-xs min-w-[210px]">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-cyan-600" />
                            {label}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-50 text-cyan-700 border border-cyan-200">
                            {curveMetric === "avg"
                              ? `~${totalVal} atenc./día`
                              : `${totalVal} atenciones`}
                          </span>
                        </div>

                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {breakdownMode === "total" ? (
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
                                {curveMetric === "avg" ? "Promedio Diario" : "Total Acumulado"}
                              </span>
                              <div className="text-right">
                                <strong className="text-slate-900">{totalVal}</strong>
                                {curveMetric === "avg" && (
                                  <span className="text-[10px] text-slate-400 block font-normal">
                                    ({rawVal} en {distinctDatesCount} días)
                                  </span>
                                )}
                              </div>
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

                {breakdownMode === "total" && (
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Demanda"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorDynamicTotal)"
                  />
                )}

                {breakdownMode === "modality" &&
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

                {breakdownMode === "service" &&
                  visibleServices.map((s, idx) => {
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
          {breakdownMode === "modality" && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
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

          {breakdownMode === "service" && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Servicios Graficados:
              </span>
              {visibleServices.map((s, idx) => {
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

          {/* Subleyenda descriptiva */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Mostrando:{" "}
              <strong className="text-slate-700">
                {curveMetric === "avg" ? "Promedio Diario Típico" : "Total Acumulado"}
              </strong>{" "}
              &middot; Filtro:{" "}
              <strong className="text-slate-700">
                {DAY_FILTER_OPTIONS.find((d) => d.value === selectedDayFilter)?.label}
              </strong>{" "}
              ({distinctDatesCount} días en el cálculo)
            </span>
            <span className="text-[11px] text-slate-400">
              Usa los botones superiores para conmutar al Heatmap 2D o revisar el cruce con el personal
            </span>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: HEATMAP 2D */}
      {activeTab === "heatmap" && <HourlyHeatmapSubView orders={orders} />}

      {/* PESTAÑA 3: CAPACIDAD VS ASISTENCIA */}
      {activeTab === "capacity" && <HourlyCapacitySubView orders={orders} attendance={attendance} />}

      {/* PESTAÑA 4: PROYECCIÓN & DESCANSOS */}
      {activeTab === "intelligence" && <HourlyIntelligenceSubView orders={orders} />}
    </div>
  );
};
