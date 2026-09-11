import React from "react";
import { MetricCard } from "../MetricCard";
import { CheckCircle2, XCircle, Clock, Zap } from "lucide-react";
import type { AgentProductivity } from "../../types";

interface OrdersKPIsProps {
  total: number;
  completed: number;
  canceled: number;
  completionRate: string;
  cancelRate: string;
  avgDuration: number;
  currentProd: AgentProductivity | null;
  selectedAgent: string;
}

export const OrdersKPIs: React.FC<OrdersKPIsProps> = ({
  total,
  completed,
  canceled,
  completionRate,
  cancelRate,
  avgDuration,
  currentProd,
  selectedAgent
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        title="Tasa de Cumplimiento"
        value={`${completionRate}%`}
        subtitle={`${completed} completadas de ${total} órdenes`}
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        color="emerald"
        trend={{ value: `${completionRate}% éxito`, isPositive: parseFloat(completionRate) > 80 }}
      />

      <MetricCard
        title="Órdenes Canceladas"
        value={canceled}
        subtitle={`${cancelRate}% del volumen total`}
        icon={<XCircle className="w-5 h-5 text-rose-600" />}
        color="rose"
      />

      <MetricCard
        title="Tiempo Promedio de Atención"
        value={`${avgDuration} min`}
        subtitle="Entre registro y hora de resolución"
        icon={<Clock className="w-5 h-5 text-cyan-600" />}
        color="cyan"
      />

      <MetricCard
        title="Productividad / Hora"
        value={currentProd ? `${currentProd.ordersPerHour} ord/h` : "1.25 ord/h"}
        subtitle={
          selectedAgent !== "ALL"
            ? `Calculado sobre ${Math.round(currentProd?.totalWorkMinutes || 0) / 60}h de asistencia`
            : "Promedio estimado general"
        }
        icon={<Zap className="w-5 h-5 text-amber-600" />}
        color="amber"
      />
    </div>
  );
};
