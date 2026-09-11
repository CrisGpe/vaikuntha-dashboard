import React, { useMemo } from "react";
import type { ClientRecord } from "../../types";
import { ClientsKPIs } from "../clients/ClientsKPIs";
import { TopLoyalClients } from "../clients/TopLoyalClients";
import { ClientsTable } from "../clients/ClientsTable";

interface ClientsViewProps {
  clients: ClientRecord[];
  selectedAgent: string;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ clients, selectedAgent }) => {
  const filteredClients = useMemo(() => {
    if (selectedAgent === "ALL") return clients;
    return clients.filter(
      (c) => c.preferredAgent && c.preferredAgent.toLowerCase() === selectedAgent.toLowerCase()
    );
  }, [clients, selectedAgent]);

  const total = filteredClients.length;
  const recurrent = filteredClients.filter((c) => c.totalVisits > 1).length;
  const recurrenceRate = total > 0 ? ((recurrent / total) * 100).toFixed(1) : "0";
  const withPhone = filteredClients.filter((c) => c.phone).length;
  const withPhoneRate = total > 0 ? ((withPhone / total) * 100).toFixed(1) : "0";

  const topLoyal = useMemo(() => {
    return [...filteredClients].sort((a, b) => b.totalVisits - a.totalVisits).slice(0, 4);
  }, [filteredClients]);

  return (
    <div className="space-y-3.5">
      {/* 1. KPIs de Cartera y Fidelización */}
      <ClientsKPIs
        totalClients={total}
        recurrentCount={recurrent}
        recurrenceRate={recurrenceRate}
        withPhoneCount={withPhone}
        withPhoneRate={withPhoneRate}
        topClient={topLoyal[0]}
        selectedAgent={selectedAgent}
      />

      {/* 2. Clientes VIP Más Fieles (Top 4) */}
      <TopLoyalClients clients={topLoyal} />

      {/* 3. Directorio Consolidado de Clientes con Búsqueda */}
      <ClientsTable clients={filteredClients} />
    </div>
  );
};
