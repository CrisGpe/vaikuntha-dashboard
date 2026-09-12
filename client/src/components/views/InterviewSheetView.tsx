import React, { useMemo } from "react";
import type { OrderRecord, AttendanceRecord, AgentProductivity, ClientRecord, SaleRecord } from "../../types";
import { InterviewHeader } from "../interview/InterviewHeader";
import { InterviewSummaryKPIs } from "../interview/InterviewSummaryKPIs";
import { InterviewPerformanceGrid } from "../interview/InterviewPerformanceGrid";
import { InterviewWeeklyDistribution } from "../interview/InterviewWeeklyDistribution";
import { VaikunthaBenefitsSection } from "../interview/VaikunthaBenefitsSection";
import { InterviewAgreementsNotes } from "../interview/InterviewAgreementsNotes";

interface InterviewSheetViewProps {
  selectedAgent: string;
  setSelectedAgent: (agent: string) => void;
  agents: string[];
  orders: OrderRecord[];
  attendance: AttendanceRecord[];
  clients: ClientRecord[];
  productivity: Record<string, AgentProductivity>;
  sales?: SaleRecord[];
}

export const InterviewSheetView: React.FC<InterviewSheetViewProps> = ({
  selectedAgent,
  setSelectedAgent,
  agents,
  orders,
  attendance,
  clients,
  productivity,
  sales = []
}) => {
  // Asegurar que currentAgent siempre pertenezca a la lista de agentes del salón actual
  const currentAgent =
    selectedAgent !== "ALL" && agents.includes(selectedAgent)
      ? selectedAgent
      : agents[0] || "";

  const handlePrint = () => {
    window.print();
  };

  const prod = productivity[currentAgent];
  const agentOrders = useMemo(() => orders.filter((o) => o.agent === currentAgent), [orders, currentAgent]);
  const agentAttendance = useMemo(
    () => attendance.filter((a) => a.agent.toLowerCase() === currentAgent.toLowerCase()),
    [attendance, currentAgent]
  );
  const agentClients = useMemo(
    () => clients.filter((c) => c.preferredAgent && c.preferredAgent.toLowerCase() === currentAgent.toLowerCase()),
    [clients, currentAgent]
  );

  const agentSales = useMemo(() => {
    if (!sales || sales.length === 0) return [];
    return sales.filter((s) => s.agent.toLowerCase() === currentAgent.toLowerCase());
  }, [sales, currentAgent]);

  const totalSalesAmount = useMemo(() => {
    if (agentSales.length > 0) {
      return Math.round(agentSales.reduce((acc, s) => acc + s.amount, 0) * 100) / 100;
    }
    return prod?.totalSalesAmount;
  }, [agentSales, prod]);

  const totalSalesCount = useMemo(() => {
    if (agentSales.length > 0) {
      return agentSales.reduce((acc, s) => acc + s.quantity, 0);
    }
    return prod?.totalSalesCount;
  }, [agentSales, prod]);

  const averageTicket = useMemo(() => {
    if (totalSalesCount && totalSalesCount > 0 && totalSalesAmount) {
      return Math.round((totalSalesAmount / totalSalesCount) * 100) / 100;
    }
    return prod?.averageTicket;
  }, [totalSalesAmount, totalSalesCount, prod]);

  const reactiveProd = useMemo(() => {
    if (!prod) return undefined;
    if (agentSales.length === 0) return prod;

    const itemMap: Record<string, { count: number; amount: number }> = {};
    agentSales.forEach((s) => {
      const k = s.item || "Varios";
      if (!itemMap[k]) itemMap[k] = { count: 0, amount: 0 };
      itemMap[k].count += s.quantity;
      itemMap[k].amount += s.amount;
    });

    const topSoldItems = Object.entries(itemMap)
      .map(([name, stat]) => ({
        name,
        count: stat.count,
        amount: Math.round(stat.amount * 100) / 100
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      ...prod,
      totalSalesAmount,
      totalSalesCount,
      averageTicket,
      topSoldItems
    };
  }, [prod, agentSales, totalSalesAmount, totalSalesCount, averageTicket]);

  const completed = useMemo(() => agentOrders.filter((o) => o.status === "COMPLETADO").length, [agentOrders]);
  const canceled = useMemo(() => agentOrders.filter((o) => o.status === "CANCELADO").length, [agentOrders]);
  const successRate = agentOrders.length > 0 ? ((completed / agentOrders.length) * 100).toFixed(1) : "100";
  const totalWorkedHours = useMemo(
    () => agentAttendance.reduce((acc, a) => acc + a.totalWorkMinutes, 0) / 60,
    [agentAttendance]
  );

  // Desglose de atenciones por Modalidad de Ingreso
  const agentModalities = useMemo(() => {
    const counts: Record<string, number> = {};
    agentOrders.forEach((o) => {
      const type = (o.clientType && o.clientType.trim()) || "Turno";
      counts[type] = (counts[type] || 0) + 1;
    });

    const total = agentOrders.length || 1;
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Number(((count / total) * 100).toFixed(1))
      }))
      .sort((a, b) => b.count - a.count);
  }, [agentOrders]);

  return (
    <div className="space-y-3.5">
      {/* 1. Barra de Control de la Entrevista */}
      <InterviewHeader
        currentAgent={currentAgent}
        setSelectedAgent={setSelectedAgent}
        agents={agents}
        onPrint={handlePrint}
      />

      {/* 2. Documento Imprimible / Ficha Ejecutiva */}
      <div className="p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xs relative print:border-0 print:p-0">
        {/* Cabecera Corporativa de la Ficha */}
        <div className="border-b border-slate-200 pb-3.5 mb-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200">
                  Plan de Gestión del Cambio
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Transición Tecnológica SaS Vaikuntha
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {currentAgent}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Ficha de Desempeño Operativo y Oportunidad Comercial Individual
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xl sm:text-2xl font-black text-cyan-700">VAIKUNTHA</div>
              <p className="text-xs text-slate-400 font-mono">
                Fecha: {new Date().toLocaleDateString("es-ES")}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Resumen Cuantitativo del Colaborador */}
        <InterviewSummaryKPIs
          totalOrders={agentOrders.length}
          completed={completed}
          canceled={canceled}
          successRate={successRate}
          loyalClientsCount={agentClients.length}
          totalWorkedHours={totalWorkedHours}
          totalSalesAmount={totalSalesAmount}
          totalSalesCount={totalSalesCount}
          averageTicket={averageTicket}
        />

        {/* 4. Servicios Estrella, Facturación, Modalidad de Ingreso y Cartera VIP */}
        <InterviewPerformanceGrid productivity={reactiveProd} modalities={agentModalities} />

        {/* 5. Distribución de Demanda por Día de la Semana (Ritmo Semanal) */}
        <InterviewWeeklyDistribution orders={agentOrders} />

        {/* 6. Beneficios para el Colaborador (Gestión del Cambio) */}
        <VaikunthaBenefitsSection />

        {/* 7. Acuerdos, Expectativas y Firmas */}
        <InterviewAgreementsNotes currentAgent={currentAgent} />
      </div>
    </div>
  );
};
