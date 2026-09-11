import React from "react";
import { Sparkles, Smartphone, CalendarCheck, ShieldCheck, Award } from "lucide-react";

export const VaikunthaBenefitsSection: React.FC = () => {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 via-blue-50/50 to-indigo-50 border border-cyan-200 mb-5">
      <h3 className="text-xs sm:text-sm font-bold text-cyan-950 mb-1 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-cyan-600" />
        ¿Qué ganas tú personalmente con la implementación de SaS Vaikuntha?
      </h3>
      <p className="text-[11px] sm:text-xs text-slate-600 mb-3 font-medium">
        El objetivo del nuevo software no es controlarte, sino potenciar tus ingresos, proteger tu tiempo y hacer tu día a día más fluido:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-cyan-100 shadow-2xs">
          <Smartphone className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block mb-0.5 text-xs">
              1. Tu agenda en tiempo real en tu celular
            </strong>
            <span className="text-slate-600 text-[11px] font-medium leading-tight block">
              Sabrás tus turnos y citas con antelación sin depender de consultar libretas o la hoja de cálculo.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-cyan-100 shadow-2xs">
          <CalendarCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block mb-0.5 text-xs">
              2. Cero cancelaciones sorpresa
            </strong>
            <span className="text-slate-600 text-[11px] font-medium leading-tight block">
              Recordatorios automatizados por WhatsApp a tus clientas para asegurar que asistan puntuales.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-cyan-100 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block mb-0.5 text-xs">
              3. Historial de fórmulas y preferencias
            </strong>
            <span className="text-slate-600 text-[11px] font-medium leading-tight block">
              Guarda la fórmula de tinte, corte o botox de tus clientes recurrentes para fidelizarlas siempre.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-cyan-100 shadow-2xs">
          <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block mb-0.5 text-xs">
              4. Comisiones transparentes y al día
            </strong>
            <span className="text-slate-600 text-[11px] font-medium leading-tight block">
              Visualiza tus servicios liquidados al momento para mayor tranquilidad y certidumbre económica.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
