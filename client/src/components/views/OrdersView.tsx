import React, { useMemo } from "react";
import type { OrderRecord, AttendanceRecord, AgentProductivity } from "../../types";
import { OrdersKPIs } from "../orders/OrdersKPIs";
import { CancellationAnalysis } from "../orders/CancellationAnalysis";
import { AttendanceTable } from "../orders/AttendanceTable";
import { OrdersDetailTable } from "../orders/OrdersDetailTable";

interface OrdersViewProps {
  orders: OrderRecord[];
  attendance: AttendanceRecord[];
  selectedAgent: string;
  productivity: Record<string, AgentProductivity>;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  attendance,
  selectedAgent,
  productivity
}) => {
  const filteredOrders = useMemo(() => {
    if (selectedAgent === "ALL") return orders;
    return orders.filter((o) => o.agent === selectedAgent);
  }, [orders, selectedAgent]);

  const filteredAttendance = useMemo(() => {
    if (selectedAgent === "ALL") return attendance;
    return attendance.filter((a) => a.agent.toLowerCase() === selectedAgent.toLowerCase());
  }, [attendance, selectedAgent]);

  const total = filteredOrders.length;
  const completed = filteredOrders.filter((o) => o.status === "COMPLETADO").length;
  const canceled = filteredOrders.filter((o) => o.status === "CANCELADO").length;

  const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : "0";
  const cancelRate = total > 0 ? ((canceled / total) * 100).toFixed(1) : "0";

  const durations = filteredOrders
    .map((o) => o.durationMinutes)
    .filter((d): d is number => typeof d === "number" && d > 0);
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

  const lostMinutes = canceled * (avgDuration || 60);
  const lostHours = (lostMinutes / 60).toFixed(1);
  const recoverableHours = ((lostMinutes * 0.65) / 60).toFixed(1);
  const recoverableOrders = Math.max(1, Math.round(canceled * 0.65));

  const currentProd = selectedAgent !== "ALL" ? productivity[selectedAgent] : null;

  const cancellationReasons = useMemo(() => {
    const reasons: Record<string, number> = {};
    orders
      .filter((o) => o.status === "CANCELADO" && (selectedAgent === "ALL" || o.agent === selectedAgent))
      .forEach((o) => {
        const text = o.cancelReason || o.observation || "Sin motivo especificado";
        const clean = text.replace(/el motivo fue:\s*"?/i, "").replace(/"$/, "").trim();
        reasons[clean] = (reasons[clean] || 0) + 1;
      });
    return Object.entries(reasons).map(([reason, count]) => ({ reason, count }));
  }, [orders, selectedAgent]);

  return (
    <div className="space-y-3.5">
      {/* 1. KPIs Principales de Órdenes */}
      <OrdersKPIs
        total={total}
        completed={completed}
        canceled={canceled}
        completionRate={completionRate}
        cancelRate={cancelRate}
        avgDuration={avgDuration}
        currentProd={currentProd}
        selectedAgent={selectedAgent}
      />

      {/* 2. Análisis de Cancelaciones y Respaldo del 65% */}
      <CancellationAnalysis
        canceled={canceled}
        lostHours={lostHours}
        recoverableHours={recoverableHours}
        recoverableOrders={recoverableOrders}
        cancellationReasons={cancellationReasons}
      />

      {/* 3. Cruce de Asistencia y Turnos */}
      <AttendanceTable attendance={filteredAttendance} />

      {/* 4. Tabla Interactiva de Órdenes */}
      <OrdersDetailTable orders={filteredOrders} />
    </div>
  );
};
