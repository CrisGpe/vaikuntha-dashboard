import type { DashboardResponse, StatusResponse } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const CACHE_KEY = "vaikuntha_dashboard_cache";

// Caché en memoria para evitar saturar la cuota de localStorage con 13,000 órdenes
const memoryCache = new Map<string, DashboardResponse>();

// Limpieza proactiva de claves antiguas grandes en localStorage
try {
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith(CACHE_KEY)) {
      localStorage.removeItem(k);
    }
  });
} catch (_) {}

export const api = {
  async getData(includeBorrador = true, forceRefresh = false, spreadsheetId?: string): Promise<DashboardResponse> {
    const cacheKey = `${spreadsheetId || "default"}_${includeBorrador}`;

    if (!forceRefresh && memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey)!;
    }

    try {
      const sheetQuery = spreadsheetId ? `&spreadsheetId=${encodeURIComponent(spreadsheetId)}` : "";
      const res = await fetch(
        `${API_BASE}/data?includeBorrador=${includeBorrador}&forceRefresh=${forceRefresh}${sheetQuery}`
      );
      if (!res.ok) throw new Error(`Error en servidor: ${res.statusText}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Error al obtener datos");
      
      memoryCache.set(cacheKey, json.data);
      return json.data;
    } catch (err: any) {
      if (memoryCache.has(cacheKey)) {
        console.warn("Error de conexión al backend, usando caché en memoria disponible.");
        return memoryCache.get(cacheKey)!;
      }
      throw err;
    }
  },

  async getStatus(): Promise<StatusResponse> {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error("Error al consultar estado");
    return res.json();
  },

  async updateSpreadsheet(urlOrId: string, includeBorrador = true): Promise<DashboardResponse> {
    const res = await fetch(`${API_BASE}/spreadsheet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urlOrId, includeBorrador })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Error al cambiar de hoja");
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(json.data));
    } catch (_) {}
    return json.data;
  },

  async uploadExcel(file: File, includeBorrador = true): Promise<DashboardResponse> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = e.target?.result as string;
          // Extraer base64 quitando data URL prefix si existe
          const base64 = result.includes("base64,") ? result.split("base64,")[1] : result;
          const res = await fetch(`${API_BASE}/upload-excel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileBase64: base64,
              fileName: file.name,
              includeBorrador
            })
          });
          const json = await res.json();
          if (!json.success) throw new Error(json.error || "Error al procesar el archivo Excel");
          localStorage.setItem(CACHE_KEY, JSON.stringify(json.data));
          resolve(json.data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Error al leer el archivo en el navegador"));
      reader.readAsDataURL(file);
    });
  },

  async uploadCredentials(credentialsJson: string): Promise<{ success: boolean; clientEmail?: string; message?: string }> {
    const res = await fetch(`${API_BASE}/upload-credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credentialsJson })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Error al guardar credenciales");
    return json;
  }
};
