import React from "react";
import { MetricCard } from "../MetricCard";
import { Users, HeartHandshake, PhoneCall, Award } from "lucide-react";
import type { ClientRecord } from "../../types";

interface ClientsKPIsProps {
  totalClients: number;
  recurrentCount: number;
  recurrenceRate: string;
  withPhoneCount: number;
  withPhoneRate: string;
  topClient: ClientRecord | undefined;
  selectedAgent: string;
}

export const ClientsKPIs: React.FC<ClientsKPIsProps> = ({
  totalClients,
  recurrentCount,
  recurrenceRate,
  withPhoneCount,
  withPhoneRate,
  topClient,
  selectedAgent
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        title="Cartera de Clientes"
        value={totalClients}
        subtitle={selectedAgent !== "ALL" ? `Clientes de ${selectedAgent}` : "Clientes únicos en la base"}
        icon={<Users className="w-5 h-5 text-cyan-600" />}
        color="cyan"
      />

      <MetricCard
        title="Índice de Fidelización"
        value={`${recurrenceRate}%`}
        subtitle={`${recurrentCount} clientes con 2 o más atenciones`}
        icon={<HeartHandshake className="w-5 h-5 text-rose-600" />}
        color="rose"
        trend={{ value: `${recurrenceRate}% recurrente`, isPositive: parseFloat(recurrenceRate) > 20 }}
      />

      <MetricCard
        title="Contactabilidad Celular"
        value={`${withPhoneRate}%`}
        subtitle={`${withPhoneCount} clientes con celular registrado`}
        icon={<PhoneCall className="w-5 h-5 text-emerald-600" />}
        color="emerald"
      />

      <MetricCard
        title="Top Cliente VIP"
        value={topClient?.name || "N/A"}
        subtitle={`${topClient?.totalVisits || 0} visitas acumuladas`}
        icon={<Award className="w-5 h-5 text-amber-600" />}
        color="amber"
      />
    </div>
  );
};
