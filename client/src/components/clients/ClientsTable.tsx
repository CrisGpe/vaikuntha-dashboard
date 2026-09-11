import React, { useState, useMemo } from "react";
import { Search, Award, MessageCircle } from "lucide-react";
import type { ClientRecord } from "../../types";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../common/Pagination";

interface ClientsTableProps {
  clients: ClientRecord[];
}

export const ClientsTable: React.FC<ClientsTableProps> = ({ clients }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [onlyRecurrent, setOnlyRecurrent] = useState(false);

  const filteredClients = useMemo(() => {
    let result = clients;

    if (onlyRecurrent) {
      result = result.filter((c) => c.totalVisits > 1);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q)) ||
          (c.dni && c.dni.includes(q)) ||
          c.services.some((s) => s.toLowerCase().includes(q))
      );
    }

    return result;
  }, [clients, onlyRecurrent, searchTerm]);

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
  } = usePagination(filteredClients, { initialPageSize: 25 });

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Directorio Consolidado de Clientes</h3>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Base de clientes con teléfono, DNI y servicios solicitados ({filteredClients.length} clientes)
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente, cel, DNI..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={() => setOnlyRecurrent(!onlyRecurrent)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              onlyRecurrent
                ? "bg-amber-50 text-amber-900 border-amber-300 font-bold"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Solo Recurrentes</span>
          </button>
        </div>
      </div>

      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-2 px-3"># ID</th>
                <th className="py-2 px-3">Nombre del Cliente</th>
                <th className="py-2 px-3">DNI / Doc</th>
                <th className="py-2 px-3">Celular / WhatsApp</th>
                <th className="py-2 px-3">Visitas</th>
                <th className="py-2 px-3">Agente Frecuente</th>
                <th className="py-2 px-3">Servicios Solicitados</th>
                <th className="py-2 px-3 text-right">Acción Comercial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No se encontraron clientes que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-3 font-mono text-slate-400">{client.id}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{client.name}</td>
                    <td className="py-2 px-3 text-slate-600 font-mono">
                      {client.dni ? `🪪 ${client.dni}` : <span className="text-slate-400">--</span>}
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-mono">
                      {client.phone ? `📱 ${client.phone}` : <span className="text-slate-400">--</span>}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          client.totalVisits > 2
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : client.totalVisits === 2
                            ? "bg-cyan-50 text-cyan-800 border border-cyan-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {client.totalVisits} {client.totalVisits === 1 ? "visita" : "visitas"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-cyan-800 font-bold">
                      {client.preferredAgent || "Cualquiera"}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {client.services.map((s, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium border border-slate-200/70"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right">
                      {client.phone ? (
                        <a
                          href={`https://wa.me/51${client.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition shadow-2xs"
                        >
                          <MessageCircle className="w-3 h-3" />
                          WhatsApp
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Sin número</span>
                      )}
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
          itemLabel="clientes"
        />
      </div>
    </div>
  );
};
