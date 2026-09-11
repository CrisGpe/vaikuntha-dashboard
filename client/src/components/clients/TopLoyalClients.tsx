import React from "react";
import { Sparkles, Award, MessageCircle } from "lucide-react";
import type { ClientRecord } from "../../types";

interface TopLoyalClientsProps {
  clients: ClientRecord[];
}

export const TopLoyalClients: React.FC<TopLoyalClientsProps> = ({ clients }) => {
  if (clients.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
          Top Clientes con Mayor Frecuencia de Visita
        </h3>
        <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
          Cartera prioritaria para SaS Vaikuntha
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {clients.map((client, i) => (
          <div
            key={client.id}
            className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="w-7 h-7 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center text-xs font-bold text-cyan-700">
                  #{i + 1}
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-600" />
                  {client.totalVisits} visitas
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-0.5 truncate">{client.name}</h4>
              <p className="text-[11px] text-slate-500 font-mono mb-2">
                {client.phone ? `📱 ${client.phone}` : client.dni ? `🪪 ${client.dni}` : "Sin teléfono"}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {client.services.slice(0, 2).map((s, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] bg-slate-100 text-slate-700 font-semibold border border-slate-200/70"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {client.phone && (
              <a
                href={`https://wa.me/51${client.phone}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Escribir WhatsApp
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
