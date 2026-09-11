import React from "react";
import { TrendingUp, HeartHandshake, CalendarCheck } from "lucide-react";
import type { AgentProductivity } from "../../types";

export interface ModalityBreakdownItem {
  name: string;
  count: number;
  percentage: number;
}

interface InterviewPerformanceGridProps {
  productivity: AgentProductivity | undefined;
  modalities?: ModalityBreakdownItem[];
}

const MODALITY_COLORS: Record<string, { bar: string; text: string; dot: string }> = {
  Turno: { bar: "bg-cyan-500", text: "text-cyan-800", dot: "bg-cyan-500" },
  Cliente: { bar: "bg-sky-500", text: "text-sky-800", dot: "bg-sky-500" },
  Cita: { bar: "bg-indigo-500", text: "text-indigo-800", dot: "bg-indigo-500" },
  Asesoría: { bar: "bg-violet-500", text: "text-violet-800", dot: "bg-violet-500" },
  TurnoCaballero: { bar: "bg-emerald-500", text: "text-emerald-800", dot: "bg-emerald-500" },
  TurnoNiño: { bar: "bg-amber-500", text: "text-amber-800", dot: "bg-amber-500" },
  Correccion: { bar: "bg-rose-500", text: "text-rose-800", dot: "bg-rose-500" },
  default: { bar: "bg-slate-500", text: "text-slate-800", dot: "bg-slate-500" }
};

export const InterviewPerformanceGrid: React.FC<InterviewPerformanceGridProps> = ({
  productivity,
  modalities = []
}) => {
  const topModality = modalities.length > 0 ? modalities[0] : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
      {/* 1. Servicios Top */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-cyan-600" />
            Tus Servicios Estrella
          </h3>
          <div className="space-y-1.5">
            {productivity?.topServices && productivity.topServices.length > 0 ? (
              productivity.topServices.slice(0, 5).map((srv, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs"
                >
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[170px]">
                    {idx + 1}. {srv.name}
                  </span>
                  <span className="text-xs font-bold text-cyan-800 shrink-0">
                    {srv.count} {srv.count === 1 ? "orden" : "órdenes"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic p-2">Sin datos de servicios registrados</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Modalidad de Ingreso (Origen de Atenciones) */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
            Modalidad de Ingreso
          </h3>
          <div className="space-y-2">
            {modalities.length > 0 ? (
              modalities.slice(0, 5).map((mod, idx) => {
                const palette = MODALITY_COLORS[mod.name] || MODALITY_COLORS.default;
                return (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${palette.dot}`} />
                        <span className="font-bold text-slate-800">{mod.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span className={palette.text}>{mod.count}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ({mod.percentage}%)
                        </span>
                      </div>
                    </div>
                    {/* Barra de progreso */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${palette.bar} transition-all duration-300`}
                        style={{ width: `${Math.max(3, Math.min(100, mod.percentage))}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic p-2">Sin modalidades registradas</p>
            )}
          </div>
        </div>

        {topModality && (
          <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Modalidad Principal:</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              {topModality.name} ({topModality.percentage}%)
            </span>
          </div>
        )}
      </div>

      {/* 3. Clientes VIP */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-rose-600" />
            Tus Clientes Habituales
          </h3>
          <div className="space-y-1.5">
            {productivity?.loyalClients && productivity.loyalClients.length > 0 ? (
              productivity.loyalClients.slice(0, 5).map((cl, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs"
                >
                  <div className="truncate max-w-[170px]">
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {cl.name}
                    </span>
                    {cl.phone && (
                      <span className="text-[10px] text-slate-500 font-mono block">
                        📱 {cl.phone}
                      </span>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 shrink-0">
                    {cl.visits} visitas
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic p-2">Sin clientes asignados aún</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
