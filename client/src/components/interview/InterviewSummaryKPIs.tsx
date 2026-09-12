import React from "react";

interface InterviewSummaryKPIsProps {
  totalOrders: number;
  completed: number;
  canceled: number;
  successRate: string;
  loyalClientsCount: number;
  totalWorkedHours: number;
  totalSalesAmount?: number;
  totalSalesCount?: number;
  averageTicket?: number;
}

const formatPEN = (val: number): string => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
};

export const InterviewSummaryKPIs: React.FC<InterviewSummaryKPIsProps> = ({
  totalOrders,
  completed,
  canceled,
  successRate,
  loyalClientsCount,
  totalWorkedHours,
  totalSalesAmount,
  totalSalesCount,
  averageTicket
}) => {
  const hasSales = totalSalesAmount !== undefined && totalSalesAmount > 0;

  return (
    <div
      className={`grid gap-3 mb-5 ${
        hasSales
          ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
          : "grid-cols-2 sm:grid-cols-4"
      }`}
    >
      {/* 1. Facturación Total (Si existen ventas) */}
      {hasSales && (
        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase text-emerald-800 tracking-wider">
            Total Facturado
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-emerald-900 mt-0.5 truncate">
            {formatPEN(totalSalesAmount || 0)}
          </p>
          <p className="text-[10px] text-emerald-700 mt-0.5 font-bold">
            {totalSalesCount || 0} ítems vendidos
          </p>
        </div>
      )}

      {/* 2. Ticket Promedio (Si existen ventas) */}
      {hasSales && (
        <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/80">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase text-teal-800 tracking-wider">
            Ticket Promedio
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-teal-900 mt-0.5 truncate">
            {formatPEN(averageTicket || 0)}
          </p>
          <p className="text-[10px] text-teal-700 mt-0.5 font-medium">
            Promedio por ítem / servicio
          </p>
        </div>
      )}

      {/* 3. Total Atenciones */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 tracking-wider">
          Total Atenciones
        </span>
        <p className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">{totalOrders}</p>
        <p className="text-[10px] text-emerald-700 mt-0.5 font-bold">
          {completed} Completadas con éxito
        </p>
      </div>

      {/* 4. Tasa de Éxito */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 tracking-wider">
          Tasa de Éxito
        </span>
        <p className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-0.5">
          {successRate}%
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
          {canceled} cancelaciones
        </p>
      </div>

      {/* 5. Cartera Fiel */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 tracking-wider">
          Cartera Fiel
        </span>
        <p className="text-lg sm:text-xl font-extrabold text-cyan-800 mt-0.5">
          {loyalClientsCount}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
          Clientes que te prefieren
        </p>
      </div>

      {/* 6. Horas de Turno */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 tracking-wider">
          Horas de Turno
        </span>
        <p className="text-lg sm:text-xl font-extrabold text-amber-700 mt-0.5">
          {totalWorkedHours > 0 ? `${totalWorkedHours.toFixed(1)}h` : "8h"}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
          En Asistencia registrada
        </p>
      </div>
    </div>
  );
};
