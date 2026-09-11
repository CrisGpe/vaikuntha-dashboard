import React, { useMemo } from "react";
import type { OrderRecord } from "../../types";
import { DemandKPIs } from "../demand/DemandKPIs";
import { ServicesDistributionChart } from "../demand/ServicesDistributionChart";
import { ModalityPieChart } from "../demand/ModalityPieChart";
import { DayOfWeekDemandChart } from "../demand/DayOfWeekDemandChart";
import { HourlyDemandChart } from "../demand/HourlyDemandChart";

interface DemandViewProps {
  orders: OrderRecord[];
  selectedAgent: string;
}

export const DemandView: React.FC<DemandViewProps> = ({ orders, selectedAgent }) => {
  const filteredOrders = useMemo(() => {
    if (selectedAgent === "ALL") return orders;
    return orders.filter((o) => o.agent === selectedAgent);
  }, [orders, selectedAgent]);

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

  // Cálculo integral de demanda horaria
  const hourlyDemand = useMemo(() => {
    const hours = [
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "01:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
      "05:00 PM",
      "06:00 PM",
      "07:00 PM",
      "08:00 PM"
    ];

    const map: Record<string, Record<string, any>> = {};
    hours.forEach((h) => {
      map[h] = { hour: h, total: 0 };
    });

    filteredOrders.forEach((o) => {
      if (!o.registerTime) return;
      const match = o.registerTime.match(/(\d{1,2}):\d{2}\s*(AM|PM)?/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const p = (match[2] || "AM").toUpperCase();
        const formatted = h < 10 ? `0${h}:00 ${p}` : `${h}:00 ${p}`;
        if (map[formatted]) {
          map[formatted].total += 1;

          const modality = o.clientType || "Cliente";
          map[formatted][modality] = (map[formatted][modality] || 0) + 1;

          const srv = o.serviceType || "Otros";
          map[formatted][srv] = (map[formatted][srv] || 0) + 1;
        }
      }
    });

    return Object.values(map);
  }, [filteredOrders]);

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

      {/* 4. Curva de Demanda Horaria Continua */}
      <HourlyDemandChart
        hourlyDemand={hourlyDemand}
        activeModalities={activeModalities}
        activeServicesForHourly={activeServicesForHourly}
        serviceDistribution={serviceDistribution}
        clientTypeDistribution={clientTypeDistribution}
      />
    </div>
  );
};
