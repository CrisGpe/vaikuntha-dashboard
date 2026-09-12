import React, { useMemo } from "react";
import { CircleDollarSign, ArrowRight } from "lucide-react";
import type { SaleRecord, AgentDetail } from "../../types";
import { SalesKPIs } from "../sales/SalesKPIs";
import { SalesDayOfWeekChart } from "../sales/SalesDayOfWeekChart";
import { SalesAgentRanking } from "../sales/SalesAgentRanking";
import type { AgentSalesSummary } from "../sales/SalesAgentRanking";
import { SalesProductsRanking } from "../sales/SalesProductsRanking";
import type { ProductSalesSummary } from "../sales/SalesProductsRanking";
import { SalesDetailTable } from "../sales/SalesDetailTable";

interface SalesViewProps {
  sales: SaleRecord[];
  allSales: SaleRecord[];
  selectedAgent: string;
  setSelectedAgent: (agent: string) => void;
  agentDetails?: AgentDetail[];
  selectedSalon: string;
  onSalonChange: (salonId: string) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  sales,
  allSales,
  selectedAgent,
  setSelectedAgent,
  agentDetails = [],
  selectedSalon,
  onSalonChange
}) => {
  // 1. Filtrar ventas por agente si hay un estilista seleccionado
  const filteredSales = useMemo(() => {
    if (selectedAgent === "ALL") return sales;
    return sales.filter((s) => s.agent.toLowerCase() === selectedAgent.toLowerCase());
  }, [sales, selectedAgent]);

  // 2. Cálculos generales de facturación para el conjunto filtrado
  const {
    totalSalesAmount,
    totalSalesCount,
    averageTicket,
    activeDaysCount,
    dailyAverage,
    topAgent,
    topProduct
  } = useMemo(() => {
    if (filteredSales.length === 0) {
      return {
        totalSalesAmount: 0,
        totalSalesCount: 0,
        averageTicket: 0,
        activeDaysCount: 0,
        dailyAverage: 0,
        topAgent: undefined,
        topProduct: undefined
      };
    }

    const totalAmt = Math.round(filteredSales.reduce((acc, s) => acc + s.amount, 0) * 100) / 100;
    const totalCnt = filteredSales.reduce((acc, s) => acc + s.quantity, 0);
    const avgTkt = totalCnt > 0 ? Math.round((totalAmt / totalCnt) * 100) / 100 : 0;

    const uniqueDays = new Set<string>();
    filteredSales.forEach((s) => {
      if (s.isoDate) uniqueDays.add(s.isoDate);
    });
    const daysCount = uniqueDays.size;
    const dailyAvg = daysCount > 0 ? Math.round((totalAmt / daysCount) * 100) / 100 : 0;

    // Top Agente
    const agentMap: Record<string, { amount: number; count: number }> = {};
    filteredSales.forEach((s) => {
      const ag = s.agent || "Sin Asignar";
      if (!agentMap[ag]) agentMap[ag] = { amount: 0, count: 0 };
      agentMap[ag].amount += s.amount;
      agentMap[ag].count += s.quantity;
    });
    const sortedAgents = Object.entries(agentMap)
      .map(([name, data]) => ({ name, amount: Math.round(data.amount * 100) / 100, count: data.count }))
      .sort((a, b) => b.amount - a.amount);
    const topAg = sortedAgents[0];

    // Top Producto / Servicio
    const prodMap: Record<string, { amount: number; count: number }> = {};
    filteredSales.forEach((s) => {
      const item = s.item || "Varios";
      if (!prodMap[item]) prodMap[item] = { amount: 0, count: 0 };
      prodMap[item].amount += s.amount;
      prodMap[item].count += s.quantity;
    });
    const sortedProds = Object.entries(prodMap)
      .map(([name, data]) => ({ name, amount: Math.round(data.amount * 100) / 100, count: data.count }))
      .sort((a, b) => b.amount - a.amount);
    const topPr = sortedProds[0];

    return {
      totalSalesAmount: totalAmt,
      totalSalesCount: totalCnt,
      averageTicket: avgTkt,
      activeDaysCount: daysCount,
      dailyAverage: dailyAvg,
      topAgent: topAg,
      topProduct: topPr
    };
  }, [filteredSales]);

  // 3. Ranking de Agentes completo sobre el conjunto temporal
  const agentsRanking: AgentSalesSummary[] = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    sales.forEach((s) => {
      const ag = s.agent || "Sin Asignar";
      if (!map[ag]) map[ag] = { amount: 0, count: 0 };
      map[ag].amount += s.amount;
      map[ag].count += s.quantity;
    });

    const grandTotal = Object.values(map).reduce((acc, v) => acc + v.amount, 0) || 1;

    return Object.entries(map)
      .map(([agent, data]) => {
        const detail = agentDetails.find((d) => d.name.toLowerCase() === agent.toLowerCase());
        const amount = Math.round(data.amount * 100) / 100;
        const avgTicket = data.count > 0 ? Math.round((amount / data.count) * 100) / 100 : 0;
        const percentage = Number(((amount / grandTotal) * 100).toFixed(1));

        return {
          agent,
          amount,
          count: data.count,
          avgTicket,
          percentage,
          ficha: detail?.ficha,
          role: detail?.role
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [sales, agentDetails]);

  // 4. Ranking de Productos y Servicios
  const productsRanking: ProductSalesSummary[] = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    filteredSales.forEach((s) => {
      const it = s.item || "Varios";
      if (!map[it]) map[it] = { amount: 0, count: 0 };
      map[it].amount += s.amount;
      map[it].count += s.quantity;
    });

    const grandTotal = Object.values(map).reduce((acc, v) => acc + v.amount, 0) || 1;

    return Object.entries(map)
      .map(([name, data]) => {
        const amount = Math.round(data.amount * 100) / 100;
        const percentage = Number(((amount / grandTotal) * 100).toFixed(1));
        return {
          name,
          amount,
          count: data.count,
          percentage
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredSales]);

  // Estado si la sede no tiene datos de ventas sincronizados (ej. Gloss)
  if (allSales.length === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-2xl bg-white border border-slate-200 shadow-xs text-center max-w-2xl mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <CircleDollarSign className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">
          Sin Registros de Ventas en esta Sede
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-md mx-auto">
          La sede actualmente seleccionada no tiene una pestaña de ventas sincronizada en su Google Sheet.
          Para ver el análisis de facturación completo, puedes cambiar a la sede <strong>Luxury RD</strong> o agregar la hoja correspondiente.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {selectedSalon !== "luxury_rd" && (
            <button
              onClick={() => onSalonChange("luxury_rd")}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ver Ventas en Luxury RD</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Barra de Resumen / Filtro Activo */}
      <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900">
              Análisis Comercial
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Ventas & Facturación del Salón
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Métricas de ingresos, ticket promedio y rendimiento financiero por colaborador
          </p>
        </div>

        {selectedAgent !== "ALL" && (
          <div className="flex items-center gap-2 bg-cyan-50 border border-cyan-200 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-cyan-800 font-medium">Filtrado por:</span>
            <strong className="text-cyan-950 font-bold">{selectedAgent}</strong>
            <button
              onClick={() => setSelectedAgent("ALL")}
              className="text-cyan-600 hover:text-cyan-900 font-extrabold underline ml-1 cursor-pointer"
            >
              Mostrar Todos
            </button>
          </div>
        )}
      </div>

      {/* 2. Tarjetas Ejecutivas de Ventas */}
      <SalesKPIs
        totalSalesAmount={totalSalesAmount}
        totalSalesCount={totalSalesCount}
        averageTicket={averageTicket}
        topAgent={topAgent}
        topProduct={topProduct}
        dailyAverage={dailyAverage}
        activeDaysCount={activeDaysCount}
      />

      {/* 3. Comportamiento de Facturación por Día de la Semana */}
      <SalesDayOfWeekChart sales={filteredSales} />

      {/* 4. Doble Columna: Ranking de Estilistas y Top Servicios / Productos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SalesAgentRanking
          agentsRanking={agentsRanking}
          selectedAgent={selectedAgent}
          onSelectAgent={setSelectedAgent}
        />

        <SalesProductsRanking
          productsRanking={productsRanking}
        />
      </div>

      {/* 5. Tabla Detallada con Paginación y Búsqueda Reactiva */}
      <SalesDetailTable sales={filteredSales} />
    </div>
  );
};
