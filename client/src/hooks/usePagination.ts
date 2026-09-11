import { useState, useMemo, useEffect } from "react";

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination<T>(items: T[], options?: PaginationOptions) {
  const initialPageSize = options?.initialPageSize || 25;
  const [currentPage, setCurrentPage] = useState<number>(options?.initialPage || 1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  // Resetea a la página 1 cuando cambia la longitud o composición de items (ej. al buscar o filtrar)
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Prevenir que currentPage supere totalPages
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  const setPage = (page: number) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
  };

  const changePageSize = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return {
    currentPage: safeCurrentPage,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    paginatedItems,
    setPage,
    setPageSize: changePageSize
  };
}
