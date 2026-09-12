import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { SaleRecord } from "../../types";
import { formatPEN } from "../../utils/formatters";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../common/Pagination";

interface SalesDetailTableProps {
  sales: SaleRecord[];
}

export const SalesDetailTable: React.FC<SalesDetailTableProps> = ({ sales }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSales = useMemo(() => {
    if (!searchTerm.trim()) return sales;
    const q = searchTerm.toLowerCase();

    return sales.filter(
      (s) =>
        s.clientName.toLowerCase().includes(q) ||
        s.agent.toLowerCase().includes(q) ||
        s.rawAgent.toLowerCase().includes(q) ||
        s.item.toLowerCase().includes(q) ||
        (s.date && s.date.toLowerCase().includes(q))
    );
  }, [sales, searchTerm]);

  const filteredTotalAmount = useMemo(() => {
    return Math.round(filteredSales.reduce((acc, s) => acc + s.amount, 0) * 100) / 100;
  }, [filteredSales]);

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    paginatedItems,
    setPage,
    setPageSize
  } = usePagination(filteredSales, { initialPageSize: 25 });

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              Registro Detallado de Ventas
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
              {filteredSales.length.toLocaleString("es-PE")} filas
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Historial de tickets emitidos con búsqueda por cliente, estilista o producto/servicio
          </p>
        </div>

        {/* Buscador reactivo */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente, estilista o ítem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
            <span className="text-[11px]">Por pág:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-cyan-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Fecha</th>
              <th className="py-2.5 px-3">Cliente</th>
              <th className="py-2.5 px-3">Estilista Normalizado</th>
              <th className="py-2.5 px-3">Producto / Servicio</th>
              <th className="py-2.5 px-3 text-center">Cant.</th>
              <th className="py-2.5 px-3 text-right">Importe (S/)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedItems.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50/70 transition">
                <td className="py-2 px-3 text-slate-600 font-mono whitespace-nowrap">
                  {sale.date}
                </td>
                <td className="py-2 px-3 font-semibold text-slate-800 max-w-[170px] truncate">
                  {sale.clientName}
                </td>
                <td className="py-2 px-3 whitespace-nowrap">
                  <span className="font-bold text-slate-900 block">{sale.agent}</span>
                  {sale.rawAgent !== sale.agent && (
                    <span className="text-[9px] text-slate-400 font-mono block">
                      Doc: {sale.rawAgent}
                    </span>
                  )}
                </td>
                <td className="py-2 px-3 text-slate-700 font-medium max-w-[220px] truncate" title={sale.item}>
                  {sale.item}
                </td>
                <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">
                  {sale.quantity}
                </td>
                <td className="py-2 px-3 text-right font-extrabold text-emerald-800 whitespace-nowrap font-mono">
                  {formatPEN(sale.amount)}
                </td>
              </tr>
            ))}

            {paginatedItems.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                  No se encontraron ventas con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación y Resumen Total */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 pt-2">
        <div className="text-xs text-slate-500 font-medium">
          Mostrando <strong className="text-slate-800">{totalItems > 0 ? startIndex + 1 : 0}</strong> a{" "}
          <strong className="text-slate-800">{endIndex}</strong> de{" "}
          <strong className="text-slate-800">{totalItems}</strong> registros
          {searchTerm && (
            <span className="ml-2 px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-bold">
              Subtotal Filtrado: {formatPEN(filteredTotalAmount)}
            </span>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[25, 50, 100, 200]}
          itemLabel="ventas"
        />
      </div>
    </div>
  );
};
