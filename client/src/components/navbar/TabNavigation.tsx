import React from "react";
import { BarChart3, ClipboardList, Users, FileCheck2 } from "lucide-react";

interface TabNavigationProps {
  activeTab: "demand" | "orders" | "clients" | "interview";
  setActiveTab: (tab: "demand" | "orders" | "clients" | "interview") => void;
  source: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  source
}) => {
  const isMock = source === "mock_data";
  const isExcel = source === "excel_upload";

  return (
    <div className="flex items-center justify-between border-t border-slate-100 py-1">
      <nav className="flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={() => setActiveTab("demand")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "demand"
              ? "bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-2xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-cyan-600" />
          <span>Demanda de Servicios</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "orders"
              ? "bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-2xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5 text-cyan-600" />
          <span>Órdenes & Asistencia</span>
        </button>

        <button
          onClick={() => setActiveTab("clients")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "clients"
              ? "bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-2xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-cyan-600" />
          <span>Cartera de Clientes</span>
        </button>

        <button
          onClick={() => setActiveTab("interview")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "interview"
              ? "bg-gradient-to-r from-cyan-100/80 to-blue-100/80 text-cyan-950 border border-cyan-300 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5 text-cyan-700" />
          <span>Ficha de Entrevista 1-a-1</span>
        </button>
      </nav>

      {/* Badge informativo de modo */}
      <div className="hidden md:flex items-center gap-2 text-xs">
        <span
          className={`w-2 h-2 rounded-full ${
            isExcel ? "bg-cyan-500" : isMock ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
          }`}
        />
        <span className="text-slate-500 text-[11px] font-medium">
          {isExcel
            ? "Archivo Real (.xlsx)"
            : isMock
            ? "Modo Respaldo"
            : "Google Sheets En Vivo"}
        </span>
      </div>
    </div>
  );
};
