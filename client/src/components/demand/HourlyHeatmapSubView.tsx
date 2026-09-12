import React, { useState, useMemo } from "react";
import { Flame, Clock, Sparkles, TrendingUp, HelpCircle } from "lucide-react";
import type { OrderRecord } from "../../types";

export interface HourlyHeatmapSubViewProps {
  orders: OrderRecord[];
}

const DAYS_CONFIG = [
  { key: 1, name: "Lunes", short: "Lun", isWeekend: false },
  { key: 2, name: "Martes", short: "Mar", isWeekend: false },
  { key: 3, name: "Miércoles", short: "Mié", isWeekend: false },
  { key: 4, name: "Jueves", short: "Jue", isWeekend: false },
  { key: 5, name: "Viernes", short: "Vie", isWeekend: true },
  { key: 6, name: "Sábado", short: "Sáb", isWeekend: true },
  { key: 0, name: "Domingo", short: "Dom", isWeekend: true }
];

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

interface CellData {
  dayKey: number;
  dayName: string;
  dayShort: string;
  hour: string;
  total: number;
  occurrenceCount: number;
  avg: number;
  services: Record<string, number>;
  modalities: Record<string, number>;
}

export const HourlyHeatmapSubView: React.FC<HourlyHeatmapSubViewProps> = ({ orders }) => {
  const [metricMode, setMetricMode] = useState<"avg" | "total">("avg");
  const [hoveredCell, setHoveredCell] = useState<CellData | null>(null);

  // 1. Contar ocurrencias reales de cada día de la semana en las fechas del rango
  const dayOccurrences = useMemo(() => {
    const occurrences: Record<number, Set<string>> = {
      0: new Set(),
      1: new Set(),
      2: new Set(),
      3: new Set(),
      4: new Set(),
      5: new Set(),
      6: new Set()
    };

    orders.forEach((o) => {
      if (!o.isoDate) return;
      const d = new Date(o.isoDate + "T12:00:00Z");
      const dayIdx = d.getUTCDay();
      occurrences[dayIdx]?.add(o.isoDate);
    });

    const result: Record<number, number> = {};
    for (let i = 0; i <= 6; i++) {
      result[i] = occurrences[i]?.size || 0;
    }
    return result;
  }, [orders]);

  // 2. Construir matriz Día x Hora
  const { matrix, maxAvg, maxTotal, hottestCell, quietestCell, morningVsAfternoon } = useMemo<{
    matrix: Record<string, CellData>;
    maxAvg: number;
    maxTotal: number;
    hottestCell: CellData | null;
    quietestCell: CellData | null;
    morningVsAfternoon: { morning: number; afternoon: number };
  }>(() => {
    const data: Record<string, CellData> = {};

    DAYS_CONFIG.forEach((d) => {
      const occ = Math.max(dayOccurrences[d.key] || 0, 1);
      HOURS.forEach((h) => {
        const id = `${d.key}_${h}`;
        data[id] = {
          dayKey: d.key,
          dayName: d.name,
          dayShort: d.short,
          hour: h,
          total: 0,
          occurrenceCount: occ,
          avg: 0,
          services: {},
          modalities: {}
        };
      });
    });

    let morningCount = 0;
    let afternoonCount = 0;

    orders.forEach((o) => {
      if (!o.isoDate || !o.registerTime) return;
      const d = new Date(o.isoDate + "T12:00:00Z");
      const dayIdx = d.getUTCDay();

      const match = o.registerTime.match(/(\d{1,2}):\d{2}\s*(AM|PM)?/i);
      if (!match) return;

      let h = parseInt(match[1], 10);
      const p = (match[2] || "AM").toUpperCase();
      const formattedHour = h < 10 ? `0${h}:00 ${p}` : `${h}:00 ${p}`;

      const cellId = `${dayIdx}_${formattedHour}`;
      if (data[cellId]) {
        data[cellId].total += 1;

        const srv = o.serviceType || "Otros";
        data[cellId].services[srv] = (data[cellId].services[srv] || 0) + 1;

        const mod = o.clientType || "Cliente";
        data[cellId].modalities[mod] = (data[cellId].modalities[mod] || 0) + 1;

        // Morning vs Afternoon
        if (p === "AM" || (p === "PM" && h === 12)) {
          morningCount++;
        } else {
          afternoonCount++;
        }
      }
    });

    // Calcular promedios
    let maxA = 0;
    let maxT = 0;
    let hot: CellData | null = null;
    let quiet: CellData | null = null;
    let minT = Infinity;

    Object.values(data).forEach((cell) => {
      const occ = Math.max(dayOccurrences[cell.dayKey] || 0, 1);
      cell.avg = Number((cell.total / occ).toFixed(1));

      if (cell.avg > maxA) {
        maxA = cell.avg;
        hot = cell;
      }
      if (cell.total > maxT) {
        maxT = cell.total;
      }
      if (cell.total > 0 && cell.total < minT) {
        minT = cell.total;
        quiet = cell;
      }
    });

    return {
      matrix: data,
      maxAvg: Math.max(maxA, 1),
      maxTotal: Math.max(maxT, 1),
      hottestCell: hot,
      quietestCell: quiet,
      morningVsAfternoon: { morning: morningCount, afternoon: afternoonCount }
    };
  }, [orders, dayOccurrences]);

  // Color según intensidad
  const getCellColor = (val: number, max: number) => {
    if (val === 0) {
      return "bg-slate-50/70 text-slate-300 border-slate-100 hover:border-slate-300";
    }
    const ratio = val / max;
    if (ratio <= 0.2) {
      return "bg-sky-50 text-sky-800 border-sky-100 hover:border-sky-300";
    }
    if (ratio <= 0.4) {
      return "bg-cyan-100 text-cyan-950 border-cyan-200 hover:border-cyan-400";
    }
    if (ratio <= 0.65) {
      return "bg-amber-100/90 text-amber-950 border-amber-200 hover:border-amber-400";
    }
    if (ratio <= 0.85) {
      return "bg-orange-200 text-orange-950 border-orange-300 hover:border-orange-400 font-semibold";
    }
    return "bg-rose-500 text-white border-rose-600 hover:bg-rose-600 font-bold shadow-xs";
  };

  const currentMax = metricMode === "avg" ? maxAvg : maxTotal;

  return (
    <div className="space-y-4">
      {/* Controles superiores del Heatmap */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-bold text-slate-700">Modo de Intensidad Térmica:</span>
          <div className="flex items-center p-0.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setMetricMode("avg")}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                metricMode === "avg"
                  ? "bg-cyan-600 text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Promedio Típico / Día
            </button>
            <button
              onClick={() => setMetricMode("total")}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                metricMode === "total"
                  ? "bg-cyan-600 text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Total Acumulado
            </button>
          </div>
        </div>

        {/* Escala de Color Térmica */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
          <span>Baja</span>
          <span className="w-3 h-3 rounded bg-sky-50 border border-sky-200" />
          <span className="w-3 h-3 rounded bg-cyan-100 border border-cyan-200" />
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
          <span className="w-3 h-3 rounded bg-orange-200 border border-orange-300" />
          <span className="w-3 h-3 rounded bg-rose-500 border border-rose-600" />
          <span className="font-bold text-slate-700">Pico Crítico</span>
        </div>
      </div>

      {/* Matriz 2D Responsive */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[760px]">
          {/* Fila de Encabezados de Horas */}
          <div className="grid grid-cols-[100px_repeat(12,1fr)] gap-1.5 mb-1.5 text-center">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left pl-1">
              Día \ Franja
            </div>
            {HOURS.map((h) => (
              <div key={h} className="text-[11px] font-bold text-slate-600 py-1 bg-slate-100/60 rounded-md">
                {h.replace(":00", "")}
              </div>
            ))}
          </div>

          {/* Filas de Días */}
          <div className="space-y-1.5">
            {DAYS_CONFIG.map((day) => {
              const occ = dayOccurrences[day.key] || 0;
              return (
                <div key={day.key} className="grid grid-cols-[100px_repeat(12,1fr)] gap-1.5 items-center">
                  {/* Etiqueta del Día */}
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between pr-2">
                    <span className="flex items-center gap-1">
                      {day.name}
                      {day.isWeekend && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Fin de semana de alta afluencia" />
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">({occ}d)</span>
                  </div>

                  {/* Celdas de las 12 horas */}
                  {HOURS.map((h) => {
                    const cellId = `${day.key}_${h}`;
                    const cell = matrix[cellId];
                    const val = cell ? (metricMode === "avg" ? cell.avg : cell.total) : 0;
                    const isHovered = hoveredCell && hoveredCell.dayKey === day.key && hoveredCell.hour === h;

                    return (
                      <div
                        key={h}
                        onMouseEnter={() => cell && setHoveredCell(cell)}
                        className={`h-10 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer select-none relative ${getCellColor(
                          val,
                          currentMax
                        )} ${isHovered ? "ring-2 ring-cyan-500 ring-offset-1 z-10 scale-105" : ""}`}
                      >
                        <span className="text-xs font-semibold">{val > 0 ? (metricMode === "avg" ? val.toFixed(1) : val) : "-"}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tarjeta de Inspección de Celda Activa */}
      {hoveredCell ? (
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {hoveredCell.dayName} a las {hoveredCell.hour}
              </h4>
              <p className="text-xs text-slate-500">
                Promedio: <strong className="text-slate-800">{hoveredCell.avg} atenciones/día</strong> &middot; Total acumulado:{" "}
                <strong className="text-slate-800">{hoveredCell.total} órdenes</strong> en {hoveredCell.occurrenceCount} {hoveredCell.dayName.toLowerCase()}s
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top Servicios:</span>
            {Object.entries(hoveredCell.services).length > 0 ? (
              Object.entries(hoveredCell.services)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([name, cnt]) => (
                  <span
                    key={name}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700"
                  >
                    {name} <strong className="text-cyan-700">({cnt})</strong>
                  </span>
                ))
            ) : (
              <span className="text-xs text-slate-400 italic">Sin atenciones registradas</span>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          Pasa el cursor sobre cualquier celda de la matriz para ver el desglose detallado de servicios y promedios por día.
        </div>
      )}

      {/* Métricas y Patrones Destacados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">Pico Más Caliente</span>
            <p className="text-xs font-extrabold text-slate-900 truncate">
              {hottestCell ? `${hottestCell.dayName} · ${hottestCell.hour}` : "N/D"}
            </p>
            <span className="text-[11px] text-rose-600 font-semibold">
              {hottestCell ? `~${hottestCell.avg} atenciones/día (${hottestCell.total} total)` : "-"}
            </span>
          </div>
        </div>

        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Turno Vespertino vs Mañana</span>
            <p className="text-xs font-extrabold text-slate-900">
              {morningVsAfternoon.afternoon > morningVsAfternoon.morning ? "Predominio Tarde/Noche" : "Predominio Matutino"}
            </p>
            <span className="text-[11px] text-emerald-700 font-semibold">
              {Math.round(
                (morningVsAfternoon.afternoon / (morningVsAfternoon.morning + morningVsAfternoon.afternoon || 1)) * 100
              )}% del volumen desde las 2:00 PM
            </span>
          </div>
        </div>

        <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-200/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-cyan-800 uppercase tracking-wider block">Ventana Más Tranquila</span>
            <p className="text-xs font-extrabold text-slate-900 truncate">
              {quietestCell ? `${quietestCell.dayName} · ${quietestCell.hour}` : "Primeras horas"}
            </p>
            <span className="text-[11px] text-cyan-700 font-semibold">
              Ideal para capacitaciones y descansos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
