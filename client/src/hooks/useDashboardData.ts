import { useState, useEffect, useCallback, useRef } from "react";
import type { DashboardResponse } from "../types";
import { SALONS } from "../types";
import { api } from "../services/api";

const ACTIVE_SALON_KEY = "vaikuntha_active_salon";

export const useDashboardData = (onSalonChangeCallback?: (newSalonId: string) => void) => {
  const [selectedSalon, setSelectedSalonState] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_SALON_KEY) || "gloss";
  });
  const [includeBorrador, setIncludeBorrador] = useState<boolean>(true);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());

  // Ref para evitar condiciones de carrera (ignorar respuestas de peticiones obsoletas)
  const activeRequestIdRef = useRef<number>(0);

  const fetchSalonData = useCallback(
    async (salonId: string, withBorrador: boolean, force: boolean) => {
      const requestId = ++activeRequestIdRef.current;
      const targetSalon = SALONS.find((s) => s.id === salonId) || SALONS[0];

      try {
        if (force) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const res = await api.getData(withBorrador, force, targetSalon.spreadsheetId);

        // Solo actualizar el estado si esta petición sigue siendo la más reciente
        if (requestId === activeRequestIdRef.current) {
          setData(res);
          setLastSyncTime(new Date());
        }
      } catch (err: any) {
        if (requestId === activeRequestIdRef.current) {
          console.error(`Error al sincronizar sede [${targetSalon.name}]:`, err);
          setError(err.message || "Error al conectar con la sede seleccionada");
        }
      } finally {
        if (requestId === activeRequestIdRef.current) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    []
  );

  // Carga inicial y reacción a cambios de sede o toggle de borrador
  useEffect(() => {
    fetchSalonData(selectedSalon, includeBorrador, false);
  }, [selectedSalon, includeBorrador, fetchSalonData]);

  // Cambiar de sede de manera atómica
  const setSelectedSalon = useCallback(
    (salonId: string) => {
      if (salonId === selectedSalon) return;
      setSelectedSalonState(salonId);
      localStorage.setItem(ACTIVE_SALON_KEY, salonId);
      if (onSalonChangeCallback) {
        onSalonChangeCallback(salonId);
      }
    },
    [selectedSalon, onSalonChangeCallback]
  );

  // Forzar sincronización fresca
  const refresh = useCallback(() => {
    fetchSalonData(selectedSalon, includeBorrador, true);
  }, [fetchSalonData, selectedSalon, includeBorrador]);

  // Manejo de carga de archivo Excel
  const handleExcelUploaded = useCallback((uploadedData: DashboardResponse) => {
    setData(uploadedData);
    setLastSyncTime(new Date());
    setError(null);
  }, []);

  // Actualizar URL de Google Sheets manualmente
  const updateSpreadsheet = useCallback(
    async (urlOrId: string) => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.updateSpreadsheet(urlOrId, includeBorrador);
        setData(res);
        setLastSyncTime(new Date());
      } catch (err: any) {
        setError(err.message || "Error al cambiar la URL de Google Sheets");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [includeBorrador]
  );

  return {
    selectedSalon,
    setSelectedSalon,
    includeBorrador,
    setIncludeBorrador,
    data,
    loading,
    isRefreshing,
    error,
    lastSyncTime,
    refresh,
    handleExcelUploaded,
    updateSpreadsheet
  };
};
