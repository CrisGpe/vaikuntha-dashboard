import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { OrderRecord } from "../../types";
import { formatDisplayDate } from "../../utils/formatters";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../common/Pagination";

interface OrdersDetailTableProps {
  orders: OrderRecord[];
}

export const OrdersDetailTable: React.FC<OrdersDetailTableProps> = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "COMPLETADO" | "CANCELADO" | "EN_CURSO">("ALL");

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (statusFilter !== "ALL") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          o.clientName.toLowerCase().includes(q) ||
          (o.clientPhone && o.clientPhone.includes(q)) ||
          (o.clientDni && o.clientDni.includes(q)) ||
          o.serviceType.toLowerCase().includes(q) ||
          o.agent.toLowerCase().includes(q) ||
          (o.observation && o.observation.toLowerCase().includes(q))
      );
    }

    return result;
  }, [orders, statusFilter, searchTerm]);

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
  } = usePagination(filteredOrders, { initialPageSize: 25 });

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 mb-3.5">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Detalle de Órdenes de Atención</h3>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Historial consolidado con búsqueda por cliente, DNI, celular o servicio ({filteredOrders.length} registros)
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Buscador */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente, DNI, cel..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Filtro por estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todos</option>
            <option value="COMPLETADO">Completados</option>
            <option value="CANCELADO">Cancelados</option>
            <option value="EN_CURSO">En Curso</option>
          </select>
        </div>
      </div>

      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-2 px-2.5"># / Origen</th>
                <th className="py-2 px-2.5">Hora / Fecha</th>
                <th className="py-2 px-2.5">Servicio (Tipo OATC)</th>
                <th className="py-2 px-2.5">Cliente & Contacto</th>
                <th className="py-2 px-2.5">Modalidad</th>
                <th className="py-2 px-2.5">Agente</th>
                <th className="py-2 px-2.5">Estado / Resol</th>
                <th className="py-2 px-2.5">Duración</th>
                <th className="py-2 px-2.5">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-400">
                    No se encontraron órdenes que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-2.5">
                      <span className="font-mono text-slate-700 font-semibold">{o.id}</span>
                      <span
                        className={`block text-[9px] uppercase font-bold ${
                          o.source === "Borrador" ? "text-amber-600" : "text-cyan-700"
                        }`}
                      >
                        {o.source}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-slate-700">
                      <div className="font-semibold text-slate-900">{o.registerTime || "--"}</div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {formatDisplayDate(o.date, o.isoDate)}
                      </div>
                    </td>
                    <td className="py-2 px-2.5 font-bold text-slate-900">{o.serviceType}</td>
                    <td className="py-2 px-2.5">
                      <div className="font-bold text-slate-800">{o.clientName}</div>
                      {(o.clientPhone || o.clientDni) && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          {o.clientPhone && `📱 ${o.clientPhone}`} {o.clientDni && `🪪 ${o.clientDni}`}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {o.clientType}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-cyan-800 font-bold">{o.agent}</td>
                    <td className="py-2 px-2.5">
                      {o.status === "COMPLETADO" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ {o.resolutionTime}
                        </span>
                      )}
                      {o.status === "CANCELADO" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          ✕ Cancelado
                        </span>
                      )}
                      {o.status === "EN_CURSO" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          ⏳ En curso
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2.5 text-slate-700 font-mono">
                      {o.durationMinutes ? `${o.durationMinutes} min` : "--"}
                    </td>
                    <td className="py-2 px-2.5 text-slate-500 text-[11px] max-w-xs truncate">
                      {o.cancelReason || o.observation || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
          pageSizeOptions={[15, 25, 50, 100]}
          itemLabel="órdenes"
        />
      </div>
    </div>
  );
};
