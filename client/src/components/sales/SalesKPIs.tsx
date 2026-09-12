import React from "react";
import { CircleDollarSign, ShoppingBag, Receipt, Award, Sparkles, CalendarDays } from "lucide-react";
import { formatPEN } from "../../utils/formatters";

interface SalesKPIsProps {
  totalSalesAmount: number;
  totalSalesCount: number;
  averageTicket: number;
  topAgent?: { name: string; amount: number; count: number };
  topProduct?: { name: string; amount: number; count: number };
  dailyAverage?: number;
  activeDaysCount?: number;
}

export const SalesKPIs: React.FC<SalesKPIsProps> = ({
  totalSalesAmount,
  totalSalesCount,
  averageTicket,
  topAgent,
  topProduct,
  dailyAverage,
  activeDaysCount
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {/* 1. Facturación Total */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border border-emerald-200/90 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase text-emerald-800 tracking-wider">
            Total Facturado
          </span>
          <CircleDollarSign className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-xl sm:text-2xl font-black text-emerald-950 mt-1 truncate">
          {formatPEN(totalSalesAmount)}
        </p>
        <p className="text-[10px] text-emerald-700 mt-0.5 font-bold">
          Ingresos acumulados
        </p>
      </div>

      {/* 2. Ítems y Servicios Vendidos */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 tracking-wider">
            Ítems Vendidos
          </span>
          <ShoppingBag className="w-4 h-4 text-cyan-600" />
        </div>
        <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
          {totalSalesCount.toLocaleString("es-PE")}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
          Líneas de transacción
        </p>
      </div>

      {/* 3. Ticket Promedio */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 tracking-wider">
            Ticket Promedio
          </span>
          <Receipt className="w-4 h-4 text-teal-600" />
        </div>
        <p className="text-xl sm:text-2xl font-extrabold text-teal-800 mt-1 truncate">
          {formatPEN(averageTicket)}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
          Por servicio / ítem
        </p>
      </div>

      {/* 4. Estilista Líder */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 tracking-wider">
            Estilista #1 Ventas
          </span>
          <Award className="w-4 h-4 text-amber-500" />
        </div>
        <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 truncate" title={topAgent?.name}>
          {topAgent ? topAgent.name : "N/A"}
        </p>
        <p className="text-[10px] text-amber-700 mt-0.5 font-bold truncate">
          {topAgent ? `${formatPEN(topAgent.amount)} (${topAgent.count} vtas)` : "Sin datos"}
        </p>
      </div>

      {/* 5. Producto / Servicio Estrella */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 tracking-wider">
            Servicio Estrella
          </span>
          <Sparkles className="w-4 h-4 text-indigo-500" />
        </div>
        <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 truncate" title={topProduct?.name}>
          {topProduct ? topProduct.name : "N/A"}
        </p>
        <p className="text-[10px] text-indigo-700 mt-0.5 font-bold truncate">
          {topProduct ? `${formatPEN(topProduct.amount)} (${topProduct.count} vtas)` : "Sin datos"}
        </p>
      </div>

      {/* 6. Promedio Diario */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 tracking-wider">
            Promedio Diario
          </span>
          <CalendarDays className="w-4 h-4 text-cyan-600" />
        </div>
        <p className="text-xl sm:text-2xl font-extrabold text-cyan-800 mt-1 truncate">
          {formatPEN(dailyAverage || 0)}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">
          {activeDaysCount ? `En ${activeDaysCount} días con ventas` : "Por día activo"}
        </p>
      </div>
    </div>
  );
};
