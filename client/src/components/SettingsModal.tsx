import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  UploadCloud,
  FileSpreadsheet,
  Globe,
  Key
} from "lucide-react";
import { api } from "../services/api";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSpreadsheetId: string;
  serviceAccountEmail?: string;
  source: string;
  onSpreadsheetChange: (newUrl: string) => void;
  onExcelUploaded: (data: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentSpreadsheetId,
  serviceAccountEmail,
  source,
  onSpreadsheetChange,
  onExcelUploaded
}) => {
  const [urlInput, setUrlInput] = useState(
    `https://docs.google.com/spreadsheets/d/${currentSpreadsheetId}/edit`
  );
  const [jsonInput, setJsonInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExcelUploading, setIsExcelUploading] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    if (serviceAccountEmail) {
      navigator.clipboard.writeText(serviceAccountEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onSpreadsheetChange(urlInput.trim());
      onClose();
    }
  };

  const handleExcelFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsExcelUploading(true);
      const res = await api.uploadExcel(file);
      onExcelUploaded(res);
      onClose();
    } catch (err: any) {
      alert(`Error al cargar Excel: ${err.message}`);
    } finally {
      setIsExcelUploading(false);
    }
  };

  const handleUploadJson = async () => {
    if (!jsonInput.trim()) return;
    try {
      setIsUploading(true);
      setUploadStatus(null);
      const res = await api.uploadCredentials(jsonInput.trim());
      setUploadStatus(res.message || "Credenciales guardadas correctamente.");
      setJsonInput("");
    } catch (err: any) {
      setUploadStatus(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const isMock = source === "mock_data";
  const isExcel = source === "excel_upload";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-2xl text-cyan-700">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Conexión de Datos</h2>
            <p className="text-xs text-slate-500 font-medium">
              Conecta tu Google Sheet en vivo o cambia de hoja de cálculo
            </p>
          </div>
        </div>

        {/* Estado actual */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Origen de Datos Actual
          </span>
          {isExcel ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
              Archivo Excel (.xlsx) Cargado
            </span>
          ) : !isMock ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Google Sheets en Vivo Conectado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Modo Respaldo
            </span>
          )}
        </div>

        {/* Cargar .xlsx descargado de Google Sheets */}
        <div className="mb-6 p-5 rounded-2xl bg-cyan-50/50 border border-cyan-200">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-cyan-600" />
                Cargar Archivo Local (.xlsx)
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Si deseas trabajar offline en tus reuniones, descarga tu Google Sheet (<strong>Archivo → Descargar → Microsoft Excel .xlsx</strong>) y cárgalo aquí.
              </p>
            </div>
          </div>

          <div className="mt-3">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-300 hover:border-cyan-500 rounded-2xl p-4 cursor-pointer bg-white hover:bg-cyan-50/40 transition">
              <FileSpreadsheet className="w-8 h-8 text-cyan-600 mb-1" />
              <span className="text-xs font-bold text-slate-800">
                {isExcelUploading ? "Procesando archivo..." : "Seleccionar archivo .xlsx"}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                Procesa automáticamente pestañas OATC, Borrador, Asistencia, Clientes y Agentes
              </span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelFileSelect}
                disabled={isExcelUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Conectar URL con Acceso General */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-emerald-600" />
            Conectar URL de Google Sheets
          </h3>
          <p className="text-xs text-slate-600 mb-3 font-medium">
            Pega aquí el enlace de cualquier hoja de Google Drive que tenga acceso de lectura:
          </p>
          <form onSubmit={handleSaveUrl} className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Conectar URL
            </button>
          </form>
        </div>

        {/* Cuenta de Servicio (GCP) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
            <Key className="w-3.5 h-3.5 text-indigo-600" />
            Cuenta de Servicio (Opcional - Google Cloud)
          </h3>
          <p className="text-[11px] text-slate-500 mb-2 font-medium">
            Para hojas 100% privadas compartidas con la Service Account:
          </p>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-2 mb-3">
            <span className="text-[11px] font-mono text-cyan-800 flex-1 truncate">
              {serviceAccountEmail || "vaikuntha-sync@sa-vaikuntha.iam.gserviceaccount.com"}
            </span>
            <button
              onClick={handleCopyEmail}
              className="flex items-center gap-1 px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-lg text-[10px] font-bold transition"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? "¡Copiado!" : "Copiar"}</span>
            </button>
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={2}
            placeholder="Pegar contenido de service_account.json..."
            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-[10px] font-mono text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {uploadStatus && (
            <p className={`text-[10px] mt-1 ${uploadStatus.startsWith("Error") ? "text-rose-600" : "text-emerald-600"}`}>
              {uploadStatus}
            </p>
          )}
          <div className="flex justify-end mt-2">
            <button
              onClick={handleUploadJson}
              disabled={isUploading || !jsonInput.trim()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl text-[10px] font-bold transition"
            >
              Guardar Credenciales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
