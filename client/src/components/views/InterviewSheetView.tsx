import React from "react";
import type { OrderRecord, AttendanceRecord, AgentProductivity, ClientRecord } from "../../types";
import { InterviewHeader } from "../interview/InterviewHeader";
import { InterviewSummaryKPIs } from "../interview/InterviewSummaryKPIs";
import { InterviewPerformanceGrid } from "../interview/InterviewPerformanceGrid";
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
}

export const InterviewSheetView: React.FC<InterviewSheetViewProps> = ({
  selectedAgent,
  setSelectedAgent,
  agents,
  orders,
  attendance,
  clients,
  productivity
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
  const agentOrders = orders.filter((o) => o.agent === currentAgent);
  const agentAttendance = attendance.filter((a) => a.agent.toLowerCase() === currentAgent.toLowerCase());
  const agentClients = clients.filter(
    (c) => c.preferredAgent && c.preferredAgent.toLowerCase() === currentAgent.toLowerCase()
  );

  const completed = agentOrders.filter((o) => o.status === "COMPLETADO").length;
  const canceled = agentOrders.filter((o) => o.status === "CANCELADO").length;
  const successRate = agentOrders.length > 0 ? ((completed / agentOrders.length) * 100).toFixed(1) : "100";
  const totalWorkedHours = agentAttendance.reduce((acc, a) => acc + a.totalWorkMinutes, 0) / 60;

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
        />

        {/* 4. Servicios Estrella y Cartera VIP */}
        <InterviewPerformanceGrid productivity={prod} />

        {/* 5. Beneficios para el Colaborador (Gestión del Cambio) */}
        <VaikunthaBenefitsSection />

        {/* 6. Acuerdos, Expectativas y Firmas */}
        <InterviewAgreementsNotes currentAgent={currentAgent} />
      </div>
    </div>
  );
};
