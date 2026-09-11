import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [15, 25, 50, 100],
  itemLabel = "registros"
}) => {
  if (totalItems === 0) return null;

  // Algoritmo de ventana de números de página
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2.5 bg-slate-50 border-t border-slate-100 rounded-b-xl text-xs text-slate-600">
      {/* Resumen del Rango de Datos */}
      <div className="text-[11px] sm:text-xs font-medium text-slate-500">
        Mostrando{" "}
        <strong className="text-slate-900 font-bold">
          {startIndex + 1}–{endIndex}
        </strong>{" "}
        de{" "}
        <strong className="text-slate-900 font-bold">
          {totalItems.toLocaleString("es-ES")}
        </strong>{" "}
        {itemLabel}
      </div>

      {/* Controles de Navegación y Tamaño de Página */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Selector de Tamaño de Página */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 mr-2">
            <span className="text-[11px] text-slate-400 hidden md:inline">Mostrar:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-2xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / pág
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Botones de Navegación */}
        <div className="flex items-center gap-1">
          {/* Primera Página */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed transition shadow-2xs"
            title="Primera página"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Página Anterior */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed transition shadow-2xs"
            title="Página anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Números de Página */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className="px-1 text-slate-400 select-none">
                  &hellip;
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  onClick={() => onPageChange(Number(p))}
                  className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentPage === p
                      ? "bg-cyan-600 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          {/* Página Siguiente */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed transition shadow-2xs"
            title="Página siguiente"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Última Página */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed transition shadow-2xs"
            title="Última página"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
