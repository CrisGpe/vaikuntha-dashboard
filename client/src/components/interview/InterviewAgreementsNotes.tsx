import React, { useState, useEffect } from "react";
import { MessageSquareQuote, CheckCircle2, Save } from "lucide-react";

interface InterviewAgreementsNotesProps {
  currentAgent: string;
}

export const InterviewAgreementsNotes: React.FC<InterviewAgreementsNotesProps> = ({
  currentAgent
}) => {
  const [notes, setNotes] = useState("");
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    if (currentAgent) {
      const saved = localStorage.getItem(`vaikuntha_interview_${currentAgent}`);
      setNotes(saved || "");
    }
  }, [currentAgent]);

  const handleSaveNotes = () => {
    if (currentAgent) {
      localStorage.setItem(`vaikuntha_interview_${currentAgent}`, notes);
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2500);
    }
  };

  return (
    <div className="border-t border-slate-200 pt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <MessageSquareQuote className="w-4 h-4 text-cyan-600" />
          Acuerdos, Expectativas y Feedback de la Reunión 1-a-1
        </h3>
        {savedStatus && (
          <span className="no-print text-xs text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> ¡Guardado en laptop!
          </span>
        )}
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder={`Escribe aquí los compromisos asumidos con ${currentAgent}, sus dudas sobre SaS Vaikuntha y fecha de inicio de capacitación...`}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-medium"
      />

      <div className="no-print flex justify-end mt-2.5">
        <button
          onClick={handleSaveNotes}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Save className="w-3.5 h-3.5 text-cyan-400" />
          <span>Guardar Notas del Colaborador</span>
        </button>
      </div>

      {/* Firmas para la Ficha Impresa */}
      <div className="hidden print:grid grid-cols-2 gap-16 mt-16 pt-8 border-t border-slate-300 text-center text-xs">
        <div>
          <div className="border-b border-black w-3/4 mx-auto mb-2" />
          <p className="font-bold text-slate-900">{currentAgent}</p>
          <p className="text-slate-600 text-[10px]">Colaborador / Agente</p>
        </div>
        <div>
          <div className="border-b border-black w-3/4 mx-auto mb-2" />
          <p className="font-bold text-slate-900">Líder de Transformación SaS Vaikuntha</p>
          <p className="text-slate-600 text-[10px]">Gestión del Cambio</p>
        </div>
      </div>
    </div>
  );
};
