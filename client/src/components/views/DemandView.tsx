import React, { useMemo } from "react";
import type { OrderRecord, AttendanceRecord } from "../../types";
import { DemandKPIs } from "../demand/DemandKPIs";
import { ServicesDistributionChart } from "../demand/ServicesDistributionChart";
import { ModalityPieChart } from "../demand/ModalityPieChart";
import { DayOfWeekDemandChart } from "../demand/DayOfWeekDemandChart";
import { HourlyDemandCenter } from "../demand/HourlyDemandCenter";

interface DemandViewProps {
  orders: OrderRecord[];
  attendance?: AttendanceRecord[];
  selectedAgent: string;
}

export const DemandView: React.FC<DemandViewProps> = ({ orders, attendance = [], selectedAgent }) => {
  const filteredOrders = useMemo(() => {
    if (selectedAgent === "ALL") return orders;
    return orders.filter((o) => o.agent === selectedAgent);
  }, [orders, selectedAgent]);

  const filteredAttendance = useMemo(() => {
    if (selectedAgent === "ALL") return attendance;
    return attendance.filter((a) => a.agent && a.agent.toLowerCase() === selectedAgent.toLowerCase());
  }, [attendance, selectedAgent]);

  const serviceDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      const type = o.serviceType || "Otros";
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: ((count / (filteredOrders.length || 1)) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredOrders]);

  const clientTypeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      const type = o.clientType || "Cliente General";
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredOrders]);

  const topAgent = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      if (o.agent && o.agent !== "Sin Asignar") {
        counts[o.agent] = (counts[o.agent] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  }, [filteredOrders]);

  // Modalidades presentes en las órdenes filtradas
  const activeModalities = useMemo(() => {
    return clientTypeDistribution.map((c) => c.name);
  }, [clientTypeDistribution]);

  // Servicios para desagregación horaria
  const activeServicesForHourly = useMemo(() => {
    return serviceDistribution.slice(0, 8).map((s) => s.name);
  }, [serviceDistribution]);

  return (
    <div className="space-y-3.5">
      {/* 1. KPIs Principales de Demanda */}
      <DemandKPIs
        totalOrders={filteredOrders.length}
        selectedAgent={selectedAgent}
        topService={serviceDistribution[0]}
        topModality={clientTypeDistribution[0]}
        topAgent={topAgent}
      />

      {/* 2. Gráficos de Servicios y Modalidad (Layout 8:4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <ServicesDistributionChart services={serviceDistribution} />
        <ModalityPieChart modalities={clientTypeDistribution} />
      </div>

      {/* 3. Corte por Variable Día (Comportamiento Semanal: Vie-Dom vs Lun-Jue) */}
      <DayOfWeekDemandChart
        orders={filteredOrders}
        activeModalities={activeModalities}
      />

      {/* 4. Centro de Inteligencia Horaria (Curva Dinámica, Heatmap 2D, Capacidad vs Personal, Proyección & Descansos) */}
      <HourlyDemandCenter
        orders={filteredOrders}
        attendance={filteredAttendance}
        activeModalities={activeModalities}
        activeServicesForHourly={activeServicesForHourly}
        serviceDistribution={serviceDistribution}
        clientTypeDistribution={clientTypeDistribution}
      />
    </div>
  );
};
