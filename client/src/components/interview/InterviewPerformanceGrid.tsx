import React from "react";
import { TrendingUp, HeartHandshake } from "lucide-react";
import type { AgentProductivity } from "../../types";

interface InterviewPerformanceGridProps {
  productivity: AgentProductivity | undefined;
}

export const InterviewPerformanceGrid: React.FC<InterviewPerformanceGridProps> = ({
  productivity
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
      {/* Servicios Top */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-200">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-cyan-600" />
          Tus Servicios Estrella (Mayor Especialidad)
        </h3>
        <div className="space-y-1.5">
          {productivity?.topServices && productivity.topServices.length > 0 ? (
            productivity.topServices.map((srv, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs"
              >
                <span className="text-xs font-bold text-slate-800">
                  {idx + 1}. {srv.name}
                </span>
                <span className="text-xs font-bold text-cyan-800">
                  {srv.count} órdenes
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic p-2">Sin datos de servicios registrados</p>
          )}
        </div>
      </div>

      {/* Clientes VIP */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-200">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
          <HeartHandshake className="w-4 h-4 text-rose-600" />
          Tus Clientes Habituales (Tu Cartera de Valor)
        </h3>
        <div className="space-y-1.5">
          {productivity?.loyalClients && productivity.loyalClients.length > 0 ? (
            productivity.loyalClients.slice(0, 5).map((cl, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    {cl.name}
                  </span>
                  {cl.phone && (
                    <span className="block text-[10px] text-slate-500 font-mono">
                      📱 {cl.phone}
                    </span>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
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
  );
};
