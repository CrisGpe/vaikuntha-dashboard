import React from "react";
import { Sparkles } from "lucide-react";
import type { AgentDetail } from "../types";
import { SalonSelector } from "./navbar/SalonSelector";
import { AgentSelector } from "./navbar/AgentSelector";
import { DataControlActions } from "./navbar/DataControlActions";
import { TabNavigation } from "./navbar/TabNavigation";

interface NavbarProps {
  activeTab: "demand" | "orders" | "clients" | "interview";
  setActiveTab: (tab: "demand" | "orders" | "clients" | "interview") => void;
  selectedAgent: string;
  setSelectedAgent: (agent: string) => void;
  selectedSalon: string;
  onSalonChange: (salonId: string) => void;
  agents: string[];
  agentDetails?: AgentDetail[];
  includeBorrador: boolean;
  setIncludeBorrador: (val: boolean) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenSettings: () => void;
  source: string;
  spreadsheetTitle?: string;
  onExcelUploaded: (data: any) => void;
  lastSyncTime?: Date | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedAgent,
  setSelectedAgent,
  selectedSalon,
  onSalonChange,
  agents,
  agentDetails,
  includeBorrador,
  setIncludeBorrador,
  onRefresh,
  isRefreshing,
  onOpenSettings,
  source,
  spreadsheetTitle,
  onExcelUploaded,
  lastSyncTime
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-[1560px] mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 py-2">
          {/* Logo, título y Selector de Sede */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-cyan-600/20 shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 leading-none">
                  Vaikuntha
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-cyan-100 text-cyan-800 uppercase tracking-wide">
                  BI Salón
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight">
                {spreadsheetTitle || "Dashboard de Inteligencia Operativa"}
              </p>
            </div>

            {/* Selector Modular de Sede / Salón */}
            <SalonSelector
              selectedSalon={selectedSalon}
              onSalonChange={onSalonChange}
              isLoading={isRefreshing}
            />
          </div>

          {/* Filtros Globales: Agente, Cargar Archivo, Borrador, Acciones */}
          <div className="flex items-center gap-2">
            {/* Selector Modular de Agente con actualización reactiva */}
            <AgentSelector
              selectedAgent={selectedAgent}
              setSelectedAgent={setSelectedAgent}
              agents={agents}
              agentDetails={agentDetails}
              isLoading={isRefreshing}
            />

            {/* Acciones de Control de Datos (.xlsx, Borrador, Sync, Settings) */}
            <DataControlActions
              includeBorrador={includeBorrador}
              setIncludeBorrador={setIncludeBorrador}
              onRefresh={onRefresh}
              isRefreshing={isRefreshing}
              onOpenSettings={onOpenSettings}
              onExcelUploaded={onExcelUploaded}
              lastSyncTime={lastSyncTime}
            />
          </div>
        </div>

        {/* Barra Modular de Navegación de Pestañas */}
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          source={source}
        />
      </div>
    </header>
  );
};
