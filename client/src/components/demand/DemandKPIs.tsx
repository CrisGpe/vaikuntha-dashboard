import React from "react";
import { MetricCard } from "../MetricCard";
import { Sparkles, TrendingUp, Clock, UserCheck } from "lucide-react";

interface DemandKPIsProps {
  totalOrders: number;
  selectedAgent: string;
  topService: { name: string; percentage: string } | undefined;
  topModality: { name: string; value: number } | undefined;
  topAgent: [string, number] | undefined;
}

export const DemandKPIs: React.FC<DemandKPIsProps> = ({
  totalOrders,
  selectedAgent,
  topService,
  topModality,
  topAgent
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        title="Total Atenciones"
        value={totalOrders}
        subtitle={selectedAgent !== "ALL" ? `Órdenes atendidas por ${selectedAgent}` : "Volumen global en el salón"}
        icon={<Sparkles className="w-5 h-5 text-cyan-600" />}
        color="cyan"
      />

      <MetricCard
        title="Servicio Más Demandado"
        value={topService?.name || "N/A"}
        subtitle={topService ? `${topService.percentage}% de la demanda total` : "Sin registros"}
        icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
        color="indigo"
      />

      <MetricCard
        title="Modalidad Dominante"
        value={topModality?.name || "N/A"}
        subtitle={topModality ? `${topModality.value} órdenes registradas` : "Sin datos"}
        icon={<Clock className="w-5 h-5 text-emerald-600" />}
        color="emerald"
      />

      <MetricCard
        title={selectedAgent !== "ALL" ? "Agente Seleccionado" : "Agente Más Solicitado"}
        value={selectedAgent !== "ALL" ? selectedAgent : topAgent?.[0] || "N/A"}
        subtitle={
          selectedAgent !== "ALL"
            ? "Vista individual de productividad"
            : topAgent
            ? `${topAgent[1]} órdenes atendidas`
            : "Sin datos"
        }
        icon={<UserCheck className="w-5 h-5 text-amber-600" />}
        color="amber"
      />
    </div>
  );
};
