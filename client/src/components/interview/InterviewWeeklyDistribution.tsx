import React, { useMemo } from "react";
import { CalendarDays, Sparkles } from "lucide-react";
import type { OrderRecord } from "../../types";

interface InterviewWeeklyDistributionProps {
  orders: OrderRecord[];
}

const DAYS_META = [
  { key: 1, name: "Lunes", short: "Lun", isWeekend: false },
  { key: 2, name: "Martes", short: "Mar", isWeekend: false },
  { key: 3, name: "Miércoles", short: "Mié", isWeekend: false },
  { key: 4, name: "Jueves", short: "Jue", isWeekend: false },
  { key: 5, name: "Viernes", short: "Vie", isWeekend: true },
  { key: 6, name: "Sábado", short: "Sáb", isWeekend: true },
  { key: 0, name: "Domingo", short: "Dom", isWeekend: true }
];

export const InterviewWeeklyDistribution: React.FC<InterviewWeeklyDistributionProps> = ({ orders }) => {
  const stats = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };

    orders.forEach((o) => {
      if (!o.isoDate) return;
      const d = new Date(o.isoDate + "T12:00:00Z");
      const dayIdx = d.getUTCDay();
      if (counts[dayIdx] !== undefined) {
        counts[dayIdx] += 1;
      }
    });

    const total = orders.length || 1;
    const daysData = DAYS_META.map((d) => {
      const count = counts[d.key] || 0;
      const percentage = Number(((count / total) * 100).toFixed(1));
      return {
        ...d,
        count,
        percentage
      };
    });

    const maxCount = Math.max(...daysData.map((d) => d.count), 1);

    const weekendTotal = daysData
      .filter((d) => d.isWeekend)
      .reduce((sum, d) => sum + d.count, 0);
    const weekdayTotal = daysData
      .filter((d) => !d.isWeekend)
      .reduce((sum, d) => sum + d.count, 0);

    const weekendPercent = Number(((weekendTotal / total) * 100).toFixed(1));
    const weekdayPercent = Number(((weekdayTotal / total) * 100).toFixed(1));

    const sorted = [...daysData].sort((a, b) => b.count - a.count);
    const peakDay = sorted[0];
    const idleDay = sorted[sorted.length - 1];

    return {
      daysData,
      maxCount,
      weekendTotal,
      weekdayTotal,
      weekendPercent,
      weekdayPercent,
      peakDay,
      idleDay
    };
  }, [orders]);

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-200 mb-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-indigo-600" />
            Distribución de tu Demanda por Día de la Semana
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Concentración de tu producción entre días pico (fin de semana) y días de menor ocupación
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            Fin de Semana: {stats.weekendPercent}%
          </span>
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            Lun–Jue: {stats.weekdayPercent}%
          </span>
        </div>
      </div>

      {/* 7 Columnas / Días */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-3">
        {stats.daysData.map((d) => {
          const isPeak = d.key === stats.peakDay?.key && d.count > 0;
          const isIdle = d.key === stats.idleDay?.key && d.count > 0;
          const heightPercent = Math.max(8, Math.round((d.count / stats.maxCount) * 100));

          return (
            <div
              key={d.key}
              className={`p-2 rounded-xl flex flex-col items-center justify-between border transition ${
                isPeak
                  ? "bg-indigo-50/80 border-indigo-300 shadow-2xs"
                  : d.isWeekend
                  ? "bg-white border-slate-200/90"
                  : "bg-slate-100/70 border-slate-200"
              }`}
            >
              <div className="text-center mb-1">
                <span className={`text-[11px] font-bold ${isPeak ? "text-indigo-900" : "text-slate-700"}`}>
                  {d.short}
                </span>
                {isPeak && (
                  <span className="block text-[9px] font-extrabold uppercase text-indigo-700 tracking-wider">
                    Pico
                  </span>
                )}
                {isIdle && !isPeak && (
                  <span className="block text-[9px] font-semibold uppercase text-slate-400">
                    Bajo
                  </span>
                )}
              </div>

              {/* Barra vertical comparativa */}
              <div className="w-full h-16 sm:h-20 bg-slate-200/50 rounded-lg flex items-end p-1 my-1">
                <div
                  className={`w-full rounded-md transition-all duration-500 ${
                    isPeak
                      ? "bg-indigo-600"
                      : d.isWeekend
                      ? "bg-indigo-400"
                      : "bg-slate-400"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              <div className="text-center mt-1">
                <span className="text-xs font-bold text-slate-900 block">
                  {d.count}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  {d.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight Contextual para la Entrevista */}
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-slate-200/90 text-xs">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-slate-700">
          <strong className="text-slate-900 font-bold">Oportunidad de Nivelación Comercial: </strong>
          Tu día de mayor actividad es el <strong className="text-indigo-800">{stats.peakDay?.name}</strong> con {stats.peakDay?.count} órdenes ({stats.peakDay?.percentage}%).
          Los días <strong className="text-slate-900 font-semibold">Lunes a Jueves</strong> concentran solo el {stats.weekdayPercent}% de tu carga, lo que representa una capacidad disponible ideal para agendamiento previo con SaS Vaikuntha.
        </div>
      </div>
    </div>
  );
};
