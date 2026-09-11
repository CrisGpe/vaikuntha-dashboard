import { useMemo, useEffect } from "react";
import type { DashboardResponse, DateFilter, OrderRecord, AttendanceRecord } from "../types";

export const useFilteredData = (
  data: DashboardResponse | null,
  selectedAgent: string,
  setSelectedAgent: (agent: string) => void,
  dateFilter: DateFilter
) => {
  // Guardián reactivo: Si el agente seleccionado no existe en el catálogo activo (ej. tras cambio de sede), restablecer a "ALL"
  useEffect(() => {
    if (selectedAgent !== "ALL" && data?.agents && data.agents.length > 0) {
      const exists = data.agents.some((ag) => ag.toLowerCase() === selectedAgent.toLowerCase());
      if (!exists) {
        console.log(`[useFilteredData] Agente [${selectedAgent}] no existe en la sede actual. Restableciendo a "ALL".`);
        setSelectedAgent("ALL");
      }
    }
  }, [data?.agents, selectedAgent, setSelectedAgent]);

  // Filtrado temporal de órdenes
  const temporallyFilteredOrders = useMemo(() => {
    if (!data?.orders) return [];
    if (dateFilter.preset === "ALL") return data.orders;

    return data.orders.filter((o: OrderRecord) => {
      if (!o.isoDate) return true;
      if (dateFilter.startDate && o.isoDate < dateFilter.startDate) return false;
      if (dateFilter.endDate && o.isoDate > dateFilter.endDate) return false;
      return true;
    });
  }, [data?.orders, dateFilter]);

  // Filtrado temporal de asistencia
  const temporallyFilteredAttendance = useMemo(() => {
    if (!data?.attendance) return [];
    if (dateFilter.preset === "ALL") return data.attendance;

    return data.attendance.filter((a: AttendanceRecord) => {
      if (!a.isoDate) return true;
      if (dateFilter.startDate && a.isoDate < dateFilter.startDate) return false;
      if (dateFilter.endDate && a.isoDate > dateFilter.endDate) return false;
      return true;
    });
  }, [data?.attendance, dateFilter]);

  // Filtrado cruzado: fecha + agente (para Demanda y Órdenes)
  const fullyFilteredOrders = useMemo(() => {
    if (selectedAgent === "ALL") return temporallyFilteredOrders;
    return temporallyFilteredOrders.filter(
      (o) => o.agent && o.agent.toLowerCase() === selectedAgent.toLowerCase()
    );
  }, [temporallyFilteredOrders, selectedAgent]);

  const fullyFilteredAttendance = useMemo(() => {
    if (selectedAgent === "ALL") return temporallyFilteredAttendance;
    return temporallyFilteredAttendance.filter(
      (a) => a.agent && a.agent.toLowerCase() === selectedAgent.toLowerCase()
    );
  }, [temporallyFilteredAttendance, selectedAgent]);

  return {
    temporallyFilteredOrders,
    temporallyFilteredAttendance,
    fullyFilteredOrders,
    fullyFilteredAttendance
  };
};
