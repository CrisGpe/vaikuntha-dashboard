import React, { useState } from "react";
import type { DateFilter, DatePreset } from "../types";
import { Calendar, X } from "lucide-react";

interface DateFilterBarProps {
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  minAvailableDate?: string;
  maxAvailableDate?: string;
  totalFilteredOrders: number;
  customCountLabel?: string;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  dateFilter,
  setDateFilter,
  minAvailableDate,
  maxAvailableDate,
  totalFilteredOrders,
  customCountLabel
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(dateFilter.preset === "CUSTOM");
  const [customStart, setCustomStart] = useState(dateFilter.startDate || minAvailableDate || "");
  const [customEnd, setCustomEnd] = useState(dateFilter.endDate || maxAvailableDate || "");

  const handleSelectPreset = (preset: DatePreset) => {
    if (preset === "CUSTOM") {
      setShowCustomPicker(true);
      setDateFilter({
        preset: "CUSTOM",
        startDate: customStart || minAvailableDate,
        endDate: customEnd || maxAvailableDate
      });
      return;
    }

    setShowCustomPicker(false);
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (preset === "ALL") {
      setDateFilter({ preset: "ALL" });
    } else if (preset === "TODAY") {
      setDateFilter({ preset: "TODAY", startDate: todayStr, endDate: todayStr });
    } else if (preset === "LAST_7_DAYS") {
      const past7 = new Date();
      past7.setDate(now.getDate() - 7);
      setDateFilter({
        preset: "LAST_7_DAYS",
        startDate: past7.toISOString().slice(0, 10),
        endDate: todayStr
      });
    } else if (preset === "THIS_MONTH") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      setDateFilter({
        preset: "THIS_MONTH",
        startDate: startOfMonth,
        endDate: todayStr
      });
    } else if (preset === "LAST_30_DAYS") {
      const past30 = new Date();
      past30.setDate(now.getDate() - 30);
      setDateFilter({
        preset: "LAST_30_DAYS",
        startDate: past30.toISOString().slice(0, 10),
        endDate: todayStr
      });
    } else if (preset === "THIS_YEAR") {
      const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
      setDateFilter({
        preset: "THIS_YEAR",
        startDate: startOfYear,
        endDate: todayStr
      });
    }
  };

  const applyCustomDates = () => {
    if (customStart && customEnd) {
      setDateFilter({
        preset: "CUSTOM",
        startDate: customStart,
        endDate: customEnd
      });
    }
  };

  const presets: { id: DatePreset; label: string }[] = [
    { id: "ALL", label: "Todo el Histórico" },
    { id: "TODAY", label: "Hoy" },
    { id: "LAST_7_DAYS", label: "Últimos 7 días" },
    { id: "THIS_MONTH", label: "Este Mes" },
    { id: "LAST_30_DAYS", label: "Últimos 30 días" },
    { id: "THIS_YEAR", label: "Año Actual" },
    { id: "CUSTOM", label: "Personalizado" }
  ];

  return (
    <div className="no-print bg-white border border-slate-200/80 rounded-xl px-3 py-2 shadow-2xs mb-3.5">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
        {/* Presets de Temporalidad */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mr-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-600" />
            <span>Temporalidad:</span>
          </div>

          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                dateFilter.preset === p.id
                  ? "bg-cyan-600 text-white font-bold shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Indicador de registros filtrados */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-mono font-bold">
            {customCountLabel || `${totalFilteredOrders} órdenes en este rango`}
          </span>

          {dateFilter.preset !== "ALL" && (
            <button
              onClick={() => handleSelectPreset("ALL")}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition"
              title="Restablecer a todo el histórico"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Selector de Fechas Personalizadas si se activa CUSTOM */}
      {showCustomPicker && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Desde:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Hasta:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={applyCustomDates}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Aplicar Rango
          </button>
        </div>
      )}
    </div>
  );
};
