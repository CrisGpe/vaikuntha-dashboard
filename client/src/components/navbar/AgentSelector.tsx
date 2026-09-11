import React from "react";
import { Users, Loader2 } from "lucide-react";
import type { AgentDetail } from "../../types";

interface AgentSelectorProps {
  selectedAgent: string;
  setSelectedAgent: (agent: string) => void;
  agents: string[];
  agentDetails?: AgentDetail[];
  isLoading?: boolean;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({
  selectedAgent,
  setSelectedAgent,
  agents,
  agentDetails,
  isLoading = false
}) => {
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 shadow-2xs">
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 text-cyan-600 animate-spin shrink-0" />
      ) : (
        <Users className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
      )}
      <div className="flex flex-col">
        <span className="text-[8px] font-extrabold uppercase text-slate-400 tracking-wider">
          Agente {isLoading ? "(Actualizando...)" : `(${agents.length})`}
        </span>
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          disabled={isLoading && agents.length === 0}
          className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1 max-w-[180px] sm:max-w-[260px] md:max-w-[300px] truncate disabled:opacity-50"
          title="Filtrar métricas por colaborador específico o ver todos"
        >
          <option value="ALL" className="bg-white text-slate-900 font-bold">
            Todos los Agentes ({agents.length})
          </option>

          {agentDetails && agentDetails.length > 0
            ? agentDetails.map((ag) => (
                <option key={ag.name} value={ag.name} className="bg-white text-slate-900">
                  {ag.nickname ? `${ag.nickname} · ${ag.name}` : ag.name} {ag.role ? `(${ag.role})` : ""}
                </option>
              ))
            : agents.map((ag) => (
                <option key={ag} value={ag} className="bg-white text-slate-900">
                  {ag}
                </option>
              ))}
        </select>
      </div>
    </div>
  );
};
