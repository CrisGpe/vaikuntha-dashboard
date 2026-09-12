import React from "react";
import { Crown } from "lucide-react";
import { formatPEN } from "../../utils/formatters";

export interface AgentSalesSummary {
  agent: string;
  amount: number;
  count: number;
  avgTicket: number;
  percentage: number;
  role?: string;
  ficha?: number | string;
}

interface SalesAgentRankingProps {
  agentsRanking: AgentSalesSummary[];
  selectedAgent: string;
  onSelectAgent: (agent: string) => void;
}

export const SalesAgentRanking: React.FC<SalesAgentRankingProps> = ({
  agentsRanking,
  selectedAgent,
  onSelectAgent
}) => {
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Ranking de Ventas por Estilista
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Participación y productividad comercial de cada colaborador
              </p>
            </div>
          </div>

          {selectedAgent !== "ALL" && (
            <button
              onClick={() => onSelectAgent("ALL")}
              className="text-[11px] font-bold text-cyan-700 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-2 py-1 rounded-lg border border-cyan-200 transition cursor-pointer"
            >
              Ver Todo el Salón
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {agentsRanking.map((ag, idx) => {
            const isSelected = selectedAgent.toLowerCase() === ag.agent.toLowerCase();
            const rank = idx + 1;

            return (
              <div
                key={ag.agent}
                onClick={() => onSelectAgent(isSelected ? "ALL" : ag.agent)}
                className={`p-2.5 rounded-xl border transition cursor-pointer group ${
                  isSelected
                    ? "bg-cyan-50/80 border-cyan-300 shadow-xs ring-1 ring-cyan-400"
                    : "bg-slate-50/60 hover:bg-slate-50 border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Medalla o número de posición */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        rank === 1
                          ? "bg-amber-400 text-amber-950 shadow-xs"
                          : rank === 2
                          ? "bg-slate-300 text-slate-900"
                          : rank === 3
                          ? "bg-amber-700/80 text-amber-50"
                          : "bg-slate-200/70 text-slate-600 font-mono"
                      }`}
                    >
                      {rank}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate block">
                          {ag.agent}
                        </span>
                        {ag.ficha && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 text-slate-700 font-mono font-bold shrink-0">
                            #{ag.ficha}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        {ag.count} ítems &middot; Ticket prom. {formatPEN(ag.avgTicket)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-slate-900 block">
                      {formatPEN(ag.amount)}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 font-mono">
                      {ag.percentage}% del total
                    </span>
                  </div>
                </div>

                {/* Barra de progreso de contribución */}
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      rank === 1
                        ? "bg-amber-500"
                        : rank === 2
                        ? "bg-teal-500"
                        : rank === 3
                        ? "bg-cyan-500"
                        : "bg-indigo-500"
                    }`}
                    style={{ width: `${Math.max(2, Math.min(100, ag.percentage))}%` }}
                  />
                </div>
              </div>
            );
          })}

          {agentsRanking.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6 italic">
              No hay datos de ventas disponibles para los filtros seleccionados
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
