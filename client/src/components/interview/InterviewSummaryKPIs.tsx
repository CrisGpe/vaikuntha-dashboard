import React from "react";

interface InterviewSummaryKPIsProps {
  totalOrders: number;
  completed: number;
  canceled: number;
  successRate: string;
  loyalClientsCount: number;
  totalWorkedHours: number;
}

export const InterviewSummaryKPIs: React.FC<InterviewSummaryKPIsProps> = ({
  totalOrders,
  completed,
  canceled,
  successRate,
  loyalClientsCount,
  totalWorkedHours
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500">
          Total Atenciones
        </span>
        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{totalOrders}</p>
        <p className="text-[10px] text-emerald-700 mt-0.5 font-bold">
          {completed} Completadas con éxito
        </p>
      </div>

      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500">
          Tasa de Éxito
        </span>
        <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-0.5">
          {successRate}%
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">
          {canceled} cancelaciones
        </p>
      </div>

      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500">
          Cartera Fiel Asignada
        </span>
        <p className="text-xl sm:text-2xl font-bold text-cyan-800 mt-0.5">
          {loyalClientsCount}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">
          Clientes que te prefieren
        </p>
      </div>

      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500">
          Horas de Turno
        </span>
        <p className="text-xl sm:text-2xl font-bold text-amber-700 mt-0.5">
          {totalWorkedHours > 0 ? `${totalWorkedHours.toFixed(1)}h` : "8h"}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">
          Registradas en Asistencia
        </p>
      </div>
    </div>
  );
};
