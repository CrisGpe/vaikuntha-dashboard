import React, { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import type { SaleRecord } from "../../types";
import { formatPEN } from "../../utils/formatters";

interface SalesDayOfWeekChartProps {
  sales: SaleRecord[];
}

interface DaySalesData {
  name: string;
  shortName: string;
  dayIndex: number;
  isWeekend: boolean;
  totalAmount: number;
  count: number;
  percentage: number;
}

const DAYS_META = [
  { name: "Lunes", shortName: "Lun", dayIndex: 1, isWeekend: false },
  { name: "Martes", shortName: "Mar", dayIndex: 2, isWeekend: false },
  { name: "Miércoles", shortName: "Mié", dayIndex: 3, isWeekend: false },
  { name: "Jueves", shortName: "Jue", dayIndex: 4, isWeekend: false },
  { name: "Viernes", shortName: "Vie", dayIndex: 5, isWeekend: true },
  { name: "Sábado", shortName: "Sáb", dayIndex: 6, isWeekend: true },
  { name: "Domingo", shortName: "Dom", dayIndex: 0, isWeekend: true }
];

export const SalesDayOfWeekChart: React.FC<SalesDayOfWeekChartProps> = ({ sales }) => {
  const { daysData, weekendAmount, weekdayAmount, weekendPercent, weekdayPercent, maxDayAmount, peakDay, valleyDay } = useMemo(() => {
    const amountByDayIndex: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const countByDayIndex: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    sales.forEach((s) => {
      if (!s.isoDate) return;
      // Normalizar UTC para consistencia absoluta de día
      const d = new Date(s.isoDate + "T12:00:00Z");
      const dayIdx = d.getUTCDay();
      amountByDayIndex[dayIdx] = (amountByDayIndex[dayIdx] || 0) + (s.amount || 0);
      countByDayIndex[dayIdx] = (countByDayIndex[dayIdx] || 0) + (s.quantity || 1);
    });

    const grandTotal = Object.values(amountByDayIndex).reduce((a, b) => a + b, 0) || 1;

    const days: DaySalesData[] = DAYS_META.map((meta) => {
      const totalAmount = Math.round(amountByDayIndex[meta.dayIndex] * 100) / 100;
      const count = countByDayIndex[meta.dayIndex] || 0;
      const percentage = Number(((totalAmount / grandTotal) * 100).toFixed(1));
      return {
        ...meta,
        totalAmount,
        count,
        percentage
      };
    });

    // Totales fin de semana (Vie: 5, Sáb: 6, Dom: 0) vs Días laborables (Lun: 1, Mar: 2, Mié: 3, Jue: 4)
    const weAmount = days.filter((d) => d.isWeekend).reduce((acc, d) => acc + d.totalAmount, 0);
    const wdAmount = days.filter((d) => !d.isWeekend).reduce((acc, d) => acc + d.totalAmount, 0);

    const wePct = Number(((weAmount / grandTotal) * 100).toFixed(1));
    const wdPct = Number(((wdAmount / grandTotal) * 100).toFixed(1));

    const maxAmt = Math.max(...days.map((d) => d.totalAmount), 1);

    const sorted = [...days].sort((a, b) => b.totalAmount - a.totalAmount);
    const peak = sorted[0];
    const valley = sorted[sorted.length - 1];

    return {
      daysData: days,
      weekendAmount: weAmount,
      weekdayAmount: wdAmount,
      weekendPercent: wePct,
      weekdayPercent: wdPct,
      maxDayAmount: maxAmt,
      peakDay: peak,
      valleyDay: valley
    };
  }, [sales]);

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs mb-4">
      {/* Cabecera y Resumen Estratégico */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Comportamiento de Facturación por Día de la Semana
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Análisis de concentración de ingresos: Fin de Semana (Vie–Dom) vs Días de Menor Ocupación (Lun–Jue)
              </p>
            </div>
          </div>
        </div>

        {/* 2 Badges Comparativos */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Fin de Semana (Vie-Dom)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-black text-emerald-950">{formatPEN(weekendAmount)}</span>
              <span className="text-[11px] font-extrabold text-emerald-700">({weekendPercent}%)</span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-600 block">Días de Semana (Lun-Jue)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-black text-slate-900">{formatPEN(weekdayAmount)}</span>
              <span className="text-[11px] font-extrabold text-slate-600">({weekdayPercent}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Columnas Verticales */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-3 pb-1 items-end min-h-[190px]">
        {daysData.map((d) => {
          const heightPercent = Math.max(12, Math.round((d.totalAmount / maxDayAmount) * 100));

          return (
            <div key={d.name} className="flex flex-col items-center h-full justify-end group">
              {/* Tooltip / Valor encima de la barra */}
              <div className="text-center mb-1.5 opacity-90 group-hover:opacity-100 transition">
                <span className="text-[10px] sm:text-[11px] font-black text-slate-800 block">
                  {formatPEN(d.totalAmount)}
                </span>
                <span className="text-[9px] text-slate-500 font-mono block">
                  {d.percentage}%
                </span>
              </div>

              {/* Columna interactiva */}
              <div className="w-full bg-slate-100 rounded-t-lg overflow-hidden h-[120px] flex items-end">
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 flex flex-col justify-end p-1 ${
                    d.isWeekend
                      ? "bg-gradient-to-t from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-sm"
                      : "bg-gradient-to-t from-slate-400 to-slate-300 hover:from-slate-500 hover:to-slate-400"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                >
                  <span className="text-[8px] font-bold text-white text-center truncate hidden sm:block">
                    {d.count} vtas
                  </span>
                </div>
              </div>

              {/* Etiqueta del Día */}
              <div className="mt-2 text-center">
                <span className={`text-[11px] font-bold block ${d.isWeekend ? "text-emerald-900" : "text-slate-600"}`}>
                  {d.shortName}
                </span>
                {d.isWeekend && (
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded">
                    Pico
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight Contextual para la Toma de Decisiones */}
      {peakDay && valleyDay && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 gap-1.5">
          <span>
            Día de mayor recaudación: <strong className="text-emerald-800 font-bold">{peakDay.name} ({formatPEN(peakDay.totalAmount)})</strong>
            {" · "}
            Día más desocupado: <strong className="text-slate-700 font-bold">{valleyDay.name} ({formatPEN(valleyDay.totalAmount)})</strong>
          </span>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
            Brecha Fin de Semana: {(weekendAmount / (weekdayAmount || 1)).toFixed(1)}× ingresos vs días valle
          </span>
        </div>
      )}
    </div>
  );
};
