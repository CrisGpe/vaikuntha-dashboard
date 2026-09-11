import React from "react";
import { FileCheck2, Printer } from "lucide-react";

interface InterviewHeaderProps {
  currentAgent: string;
  setSelectedAgent: (agent: string) => void;
  agents: string[];
  onPrint: () => void;
}

export const InterviewHeader: React.FC<InterviewHeaderProps> = ({
  currentAgent,
  setSelectedAgent,
  agents,
  onPrint
}) => {
  return (
    <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700">
          <FileCheck2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">Ficha de Entrevista Individual 1-a-1</h2>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Material ejecutivo de apoyo para la reunión de gestión del cambio hacia SaS Vaikuntha
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <select
          value={currentAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          {agents.map((ag) => (
            <option key={ag} value={ag}>
              Colaborador: {ag}
            </option>
          ))}
        </select>

        <button
          onClick={onPrint}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimir / PDF</span>
        </button>
      </div>
    </div>
  );
};
