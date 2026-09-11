import React, { useState, useCallback } from "react";
import type { DateFilter } from "./types";
import { useDashboardData } from "./hooks/useDashboardData";
import { useFilteredData } from "./hooks/useFilteredData";
import { Navbar } from "./components/Navbar";
import { DateFilterBar } from "./components/DateFilterBar";
import { SettingsModal } from "./components/SettingsModal";
import { DemandView } from "./components/views/DemandView";
import { OrdersView } from "./components/views/OrdersView";
import { ClientsView } from "./components/views/ClientsView";
import { InterviewSheetView } from "./components/views/InterviewSheetView";
import { AlertCircle, RefreshCw } from "lucide-react";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"demand" | "orders" | "clients" | "interview">("demand");
  const [selectedAgent, setSelectedAgent] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilter>({ preset: "ALL" });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Callback ejecutado de inmediato al conmutar de sede para resetear filtros
  const handleSalonChangeCallback = useCallback(() => {
    setSelectedAgent("ALL");
    setDateFilter({ preset: "ALL" });
  }, []);

  // Hook centralizado de estado y sincronización de datos
  const {
    selectedSalon,
    setSelectedSalon,
    includeBorrador,
    setIncludeBorrador,
    data,
    loading,
    isRefreshing,
    error,
    lastSyncTime,
    refresh,
    handleExcelUploaded,
    updateSpreadsheet
  } = useDashboardData(handleSalonChangeCallback);

  // Hook centralizado de filtrado con guardián reactivo de agentes por sede
  const {
    temporallyFilteredOrders,
    temporallyFilteredAttendance
  } = useFilteredData(data, selectedAgent, setSelectedAgent, dateFilter);

  const source = data?.metadata.source || "mock_data";
  const isMock = source === "mock_data";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. Barra de Navegación Modular */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        selectedSalon={selectedSalon}
        onSalonChange={setSelectedSalon}
        agents={data?.agents || []}
        agentDetails={data?.agentDetails || []}
        includeBorrador={includeBorrador}
        setIncludeBorrador={setIncludeBorrador}
        onRefresh={refresh}
        isRefreshing={isRefreshing}
        onOpenSettings={() => setIsSettingsOpen(true)}
        source={source}
        spreadsheetTitle={data?.metadata.spreadsheetTitle}
        onExcelUploaded={handleExcelUploaded}
        lastSyncTime={lastSyncTime}
      />

      {/* 2. Banner de Permisos de Google Sheets (si aplica) */}
      {data?.metadata.needsPermission && (
        <div className="no-print bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900">
          <div className="max-w-[1560px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Sede Luxury RD seleccionada:</strong> La hoja en Google Sheets aún requiere permisos de lectura. Puedes abrirla y otorgar acceso público o arrastrar el archivo <em>.xlsx</em>.
              </span>
            </span>
            <a
              href="https://docs.google.com/spreadsheets/d/1w2ZiQPfDfUWM6ODpHQoKn14FGBwwNhzIKxe5-RmEfBw/edit?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold border border-amber-300 transition shrink-0"
            >
              Abrir Google Sheets Luxury RD ↗
            </a>
          </div>
        </div>
      )}

      {/* 3. Banner Informativo de Modo Respaldo */}
      {isMock && !data?.metadata.needsPermission && (
        <div className="no-print bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900">
          <div className="max-w-[1560px] mx-auto flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Modo Demostración / Respaldo activo:</strong> Visualizando datos sintéticos mientras se conecta a Google Sheets.
              </span>
            </span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="underline font-bold hover:text-amber-800 ml-4 cursor-pointer"
            >
              Conectar Google Sheets
            </button>
          </div>
        </div>
      )}

      {/* 4. Banner de Error si falla la conexión */}
      {error && (
        <div className="no-print bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs text-rose-800">
          <div className="max-w-[1560px] mx-auto flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </span>
            <button
              onClick={refresh}
              className="font-bold underline hover:text-rose-900 ml-4 cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* 5. Contenedor Principal de Alta Densidad */}
      <main className="flex-1 max-w-[1560px] w-full mx-auto px-3 sm:px-5 lg:px-6 py-3.5 space-y-3.5">
        {/* Barra de Filtros de Período (Activa en Demanda, Órdenes y Clientes) */}
        {activeTab !== "interview" && (
          <DateFilterBar
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            minAvailableDate={data?.dateRange?.minDate}
            maxAvailableDate={data?.dateRange?.maxDate}
            totalFilteredOrders={temporallyFilteredOrders.length}
          />
        )}

        {/* Estado de Carga Inicial */}
        {loading && !data ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600">
              Sincronizando datos de {selectedSalon === "luxury_rd" ? "Luxury RD" : "Gloss"} desde Google Sheets...
            </p>
          </div>
        ) : (
          <>
            {activeTab === "demand" && (
              <DemandView
                orders={temporallyFilteredOrders}
                selectedAgent={selectedAgent}
              />
            )}

            {activeTab === "orders" && (
              <OrdersView
                orders={temporallyFilteredOrders}
                attendance={temporallyFilteredAttendance}
                selectedAgent={selectedAgent}
                productivity={data?.productivity || {}}
              />
            )}

            {activeTab === "clients" && (
              <ClientsView
                clients={data?.clients || []}
                selectedAgent={selectedAgent}
              />
            )}

            {activeTab === "interview" && (
              <InterviewSheetView
                selectedAgent={selectedAgent}
                setSelectedAgent={setSelectedAgent}
                agents={data?.agents || []}
                orders={temporallyFilteredOrders}
                attendance={temporallyFilteredAttendance}
                clients={data?.clients || []}
                productivity={data?.productivity || {}}
              />
            )}
          </>
        )}
      </main>

      {/* 6. Pie de Página Compacto */}
      <footer className="no-print border-t border-slate-200/80 py-2.5 bg-white text-center text-xs text-slate-400">
        <div className="max-w-[1560px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SaS Vaikuntha &copy; {new Date().getFullYear()} &middot; Transformación Digital para Salones</span>
          <span>
            Sede:{" "}
            <strong className="text-slate-700">
              {selectedSalon === "luxury_rd" ? "Luxury RD" : "Gloss (Sede Principal)"}
            </strong>{" "}
            &middot; {data?.metadata.counts.totalOrders || 0} órdenes en base &middot; {data?.agents.length || 0} agentes
          </span>
        </div>
      </footer>

      {/* 7. Modal de Configuración */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSpreadsheetChange={updateSpreadsheet}
        onExcelUploaded={handleExcelUploaded}
        currentSpreadsheetId={data?.metadata.spreadsheetId || ""}
        serviceAccountEmail={data?.metadata.serviceAccountEmail}
        source={source}
      />
    </div>
  );
};
export default App;
