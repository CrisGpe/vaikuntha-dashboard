import React, { useState } from "react";
import { AlertTriangle, HelpCircle, ChevronDown, ChevronUp, Info } from "lucide-react";

interface CancellationItem {
  reason: string;
  count: number;
}

interface CancellationAnalysisProps {
  canceled: number;
  lostHours: string;
  recoverableHours: string;
  recoverableOrders: number;
  cancellationReasons: CancellationItem[];
}

export const CancellationAnalysis: React.FC<CancellationAnalysisProps> = ({
  canceled,
  lostHours,
  recoverableHours,
  recoverableOrders,
  cancellationReasons
}) => {
  const [showRationale, setShowRationale] = useState(false);

  if (cancellationReasons.length === 0) return null;

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-rose-50/70 border border-rose-200 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-rose-900">
              Análisis de Cancelaciones detectadas en Observaciones
            </h3>
            <p className="text-xs text-rose-700">
              {canceled} órdenes canceladas en este período representaron aprox.{" "}
              <strong>~{lostHours} horas</strong> de sillón vacío no facturado.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRationale(!showRationale)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-800 hover:bg-rose-100/70 transition shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>¿Cómo respaldar el 65% ante los usuarios?</span>
          {showRationale ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="p-3 bg-white/90 border border-rose-200/80 rounded-xl mb-3 text-xs text-rose-950">
        <span className="font-bold text-rose-900">Proyección con SaS Vaikuntha (Benchmark Sectorial 50% - 65%): </span>
        La confirmación interactiva por WhatsApp y la reasignación inmediata de turnos permiten recuperar hasta{" "}
        <strong className="text-rose-800 underline decoration-rose-300 underline-offset-2">
          ~{recoverableHours} horas ({recoverableOrders} atenciones)
        </strong>{" "}
        para el equipo en este período.
      </div>

      {/* Desglose Explicativo Expandible */}
      {showRationale && (
        <div className="mb-4 p-4 rounded-xl bg-white border border-rose-200 text-xs text-slate-700 space-y-3 animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Info className="w-4 h-4 text-cyan-600 shrink-0" />
            <span className="font-bold text-slate-900">
              Fundamento Metodológico y Argumentario para la Entrevista Comercial:
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center text-[10px] font-bold">1</span>
                Benchmark de la Industria
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Estudios empíricos en salones (Fresha, Mindbody, Treatwell) demuestran que la confirmación obligatoria por WhatsApp 24h y 2h antes reduce las cancelaciones de última hora entre un <strong>50% y 68%</strong> frente a libretas o Excel.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center text-[10px] font-bold">2</span>
                Mapeo con su Realidad
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                No es una promesa abstracta: en su propia hoja se registran motivos como <em>"cancelo su cita"</em> o <em>"solo consulto"</em>. Cada caso detectado aquí fue un hueco improductivo no anticipado para el estilista.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center text-[10px] font-bold">3</span>
                Mecanismo Operativo Real
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Al avisar con anticipación mediante WhatsApp, el recepcionista reasigna inmediatamente el turno a clientes en espera o sala (modalidad "Turno"), protegiendo los ingresos y horas del estilista.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {cancellationReasons.map((item, i) => (
          <div
            key={i}
            className="p-3 bg-white border border-rose-200/80 rounded-xl flex items-start justify-between shadow-2xs"
          >
            <p className="text-xs text-slate-800 font-medium">{item.reason}</p>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 ml-2 shrink-0">
              {item.count} casos
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
