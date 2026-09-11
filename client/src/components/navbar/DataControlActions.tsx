import React, { useRef } from "react";
import { Upload, RefreshCw, Settings } from "lucide-react";
import { api } from "../../services/api";

interface DataControlActionsProps {
  includeBorrador: boolean;
  setIncludeBorrador: (val: boolean) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenSettings: () => void;
  onExcelUploaded: (data: any) => void;
  lastSyncTime?: Date | null;
}

export const DataControlActions: React.FC<DataControlActionsProps> = ({
  includeBorrador,
  setIncludeBorrador,
  onRefresh,
  isRefreshing,
  onOpenSettings,
  onExcelUploaded,
  lastSyncTime
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.uploadExcel(file, includeBorrador);
      onExcelUploaded(res);
    } catch (err: any) {
      alert(`Error al cargar hoja de cálculo: ${err.message}`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Botón Cargar Hoja Real (Excel .xlsx descargado de Google Sheets) */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 transition shadow-2xs cursor-pointer"
        title="Carga directa de tu Google Sheet descargado (.xlsx)"
      >
        <Upload className="w-3.5 h-3.5 text-cyan-600" />
        <span className="hidden md:inline">Cargar .xlsx</span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="hidden"
        />
      </button>

      {/* Toggle Borrador del Día */}
      <button
        onClick={() => setIncludeBorrador(!includeBorrador)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
          includeBorrador
            ? "bg-slate-100 text-slate-900 border-slate-300 font-bold"
            : "bg-white text-slate-500 border-slate-200 hover:text-slate-800 hover:bg-slate-50"
        }`}
        title="Alternar inclusión de órdenes de hoy en pestaña Borrador"
      >
        <div
          className={`w-3 h-3 rounded flex items-center justify-center text-[9px] ${
            includeBorrador ? "bg-cyan-600 text-white font-bold" : "border border-slate-300"
          }`}
        >
          {includeBorrador && "✓"}
        </div>
        <span className="hidden lg:inline">Borrador</span>
      </button>

      {/* Última Sincronización */}
      {lastSyncTime && (
        <span className="hidden xl:inline-block text-[10px] font-medium text-slate-400">
          Sinc: {lastSyncTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      )}

      {/* Botón Refrescar */}
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition cursor-pointer ${
          isRefreshing ? "text-cyan-700 bg-cyan-50/50 border-cyan-200" : "text-slate-600 hover:text-slate-900"
        }`}
        title="Forzar actualización inmediata desde Google Sheets"
      >
        <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-cyan-600" : ""}`} />
        <span className="text-xs font-semibold hidden sm:inline">
          {isRefreshing ? "Sincronizando..." : "Sincronizar"}
        </span>
      </button>

      {/* Botón Configuración */}
      <button
        onClick={onOpenSettings}
        className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 transition cursor-pointer"
        title="Configurar origen de datos"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
