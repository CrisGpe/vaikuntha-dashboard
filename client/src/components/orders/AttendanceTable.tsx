import React from "react";
import { Briefcase } from "lucide-react";
import type { AttendanceRecord } from "../../types";
import { formatDisplayDate } from "../../utils/formatters";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../common/Pagination";

interface AttendanceTableProps {
  attendance: AttendanceRecord[];
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({ attendance }) => {
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
  } = usePagination(attendance, { initialPageSize: 15 });

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
            Cruce de Productividad con Hoja "Asistencia"
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Horas registradas en local (Entrada, Refrigerio, Salida) vs órdenes generadas
          </p>
        </div>
        <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
          {attendance.length} Turnos
        </span>
      </div>

      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Fecha</th>
                <th className="py-2 px-3">Dependiente / Agente</th>
                <th className="py-2 px-3">Entrada</th>
                <th className="py-2 px-3">Refrigerio</th>
                <th className="py-2 px-3">Salida</th>
                <th className="py-2 px-3">Tiempo Activo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No hay registros de asistencia disponibles para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((att, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-3 text-slate-800 font-semibold">{formatDisplayDate(att.date, att.isoDate)}</td>
                    <td className="py-2 px-3 font-bold text-cyan-800">{att.agent}</td>
                    <td className="py-2 px-3 text-slate-600">{att.entryTime}</td>
                    <td className="py-2 px-3 text-slate-500">
                      {att.breakStart && att.breakEnd
                        ? `${att.breakStart} - ${att.breakEnd} (${att.breakMinutes} min)`
                        : "Sin pausa"}
                    </td>
                    <td className="py-2 px-3 text-slate-600">{att.exitTime || "Turno en curso"}</td>
                    <td className="py-2 px-3 font-bold text-emerald-700">
                      {(att.totalWorkMinutes / 60).toFixed(1)} hrs
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
          pageSizeOptions={[10, 15, 30, 50]}
          itemLabel="turnos"
        />
      </div>
    </div>
  );
};
