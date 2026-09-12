import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { formatPEN } from "../../utils/formatters";

export interface ProductSalesSummary {
  name: string;
  amount: number;
  count: number;
  percentage: number;
}

interface SalesProductsRankingProps {
  productsRanking: ProductSalesSummary[];
}

export const SalesProductsRanking: React.FC<SalesProductsRankingProps> = ({
  productsRanking
}) => {
  const [sortBy, setSortBy] = useState<"amount" | "count">("amount");

  const sortedList = [...productsRanking].sort((a, b) => {
    if (sortBy === "amount") return b.amount - a.amount;
    return b.count - a.count;
  }).slice(0, 10);

  const maxVal = sortedList.length > 0
    ? (sortBy === "amount" ? sortedList[0].amount : sortedList[0].count)
    : 1;

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Top Servicios & Productos
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Catálogo de mayor rentabilidad e impacto en facturación
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
            <button
              onClick={() => setSortBy("amount")}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                sortBy === "amount"
                  ? "bg-white text-indigo-900 shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Por Monto (S/)
            </button>
            <button
              onClick={() => setSortBy("count")}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                sortBy === "count"
                  ? "bg-white text-indigo-900 shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Por Cantidad
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {sortedList.map((item, idx) => {
            const barPercent = Math.max(3, Math.min(100, (sortBy === "amount" ? item.amount / maxVal : item.count / maxVal) * 100));

            return (
              <div
                key={item.name}
                className="p-2.5 rounded-xl bg-slate-50/60 border border-slate-200/80 hover:bg-slate-50 transition"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate block">
                        {idx + 1}. {item.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {item.count} unidades vendidas
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-indigo-950 block">
                      {formatPEN(item.amount)}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 font-mono">
                      {item.percentage}% del total
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${barPercent}%` }}
                  />
                </div>
              </div>
            );
          })}

          {sortedList.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6 italic">
              No hay productos registrados
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
