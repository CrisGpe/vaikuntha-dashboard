import React from "react";
import { Building2 } from "lucide-react";
import { SALONS } from "../../types";

interface SalonSelectorProps {
  selectedSalon: string;
  onSalonChange: (salonId: string) => void;
  isLoading?: boolean;
}

export const SalonSelector: React.FC<SalonSelectorProps> = ({
  selectedSalon,
  onSalonChange,
  isLoading = false
}) => {
  return (
    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 shadow-2xs">
      <Building2 className={`w-3.5 h-3.5 text-cyan-600 shrink-0 ${isLoading ? "animate-pulse" : ""}`} />
      <div className="flex flex-col">
        <span className="text-[8px] font-extrabold uppercase text-slate-400 tracking-wider">
          Sede / Salón {isLoading && "⏳"}
        </span>
        <select
          value={selectedSalon}
          onChange={(e) => onSalonChange(e.target.value)}
          className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
          title="Selecciona la sede o salón para visualizar sus datos"
        >
          {SALONS.map((salon) => (
            <option key={salon.id} value={salon.id} className="bg-white text-slate-900 font-bold">
              {salon.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
