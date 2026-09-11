import fs from "fs";
import path from "path";
import { google } from "googleapis";
import * as XLSX from "xlsx";
import {
  normalizeOatcRow,
  normalizeBorradorOrderRow,
  normalizeAttendanceRow,
  normalizeClientesSheet,
  normalizeAgentesSheet,
  normalizeAgentesDetails,
  consolidateClients,
  calculateAgentProductivity,
  calculateDateRange,
  buildAgentNameResolver
} from "./dataNormalizer.js";
import { getMockDashboardData } from "../mockData.js";
import { DashboardResponse, OrderRecord, AttendanceRecord } from "../types.js";

export class GoogleSheetsService {
  private spreadsheetId: string = "1SXuedQigLxVUF2oxn65wEZ5-HnDDiVdy7lY7HaweVC4";
  private credentialsPath: string = path.resolve(process.cwd(), "service_account.json");
  private cachedDataBySheet: Map<string, { data: DashboardResponse; timestamp: number }> = new Map();
  private cacheTtlMs: number = 10 * 1000; // 10 segundos para respuesta casi instantánea
  private serviceAccountEmail: string | undefined;

  constructor() {
    this.checkServiceAccount();
  }

  public extractSpreadsheetId(input: string): string {
    if (!input) return this.spreadsheetId;
    const trimmed = input.trim();
    const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }
    return trimmed;
  }

  public setSpreadsheetId(newIdOrUrl: string): string {
    const extracted = this.extractSpreadsheetId(newIdOrUrl);
    if (extracted && extracted !== this.spreadsheetId) {
      this.spreadsheetId = extracted;
    }
    return this.spreadsheetId;
  }

  public getSpreadsheetId(): string {
    return this.spreadsheetId;
  }

  public getServiceAccountEmail(): string | undefined {
    return this.serviceAccountEmail;
  }

  public checkServiceAccount(): boolean {
    try {
      if (fs.existsSync(this.credentialsPath)) {
        const content = JSON.parse(fs.readFileSync(this.credentialsPath, "utf-8"));
        if (content.client_email) {
          this.serviceAccountEmail = content.client_email;
          return true;
        }
      }
    } catch (e) {
      console.warn("No se pudo leer service_account.json:", e);
    }
    return false;
  }

  public processExcelBuffer(
    buffer: Buffer,
    fileName = "archivo.xlsx",
    includeBorrador = true,
    source: "google_sheets" | "excel_upload" = "excel_upload",
    customTitle?: string
  ): DashboardResponse {
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const sheetNames = workbook.SheetNames;

    let oatcRaw: any[][] = [];
    let borradorRaw: any[][] = [];
    let asistenciaRaw: any[][] = [];
    let clientesRaw: any[][] = [];
    let agentesRaw: any[][] = [];

    sheetNames.forEach((sheetName) => {
      const lower = sheetName.trim().toLowerCase();
      const ws = workbook.Sheets[sheetName];
      const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      if (lower === "oatc") oatcRaw = data.slice(1);
      else if (lower === "borrador") borradorRaw = data.slice(1);
      else if (lower === "asistencia") asistenciaRaw = data.slice(1);
      else if (lower === "clientes") clientesRaw = data.slice(1);
      else if (lower === "agentes") agentesRaw = data.slice(1);
    });

    return this.buildResponseFromRaw(
      oatcRaw,
      borradorRaw,
      asistenciaRaw,
      clientesRaw,
      agentesRaw,
      includeBorrador,
      customTitle || (source === "google_sheets" ? "Google Sheets Vaikuntha (Conexión en Vivo)" : `Excel Importado: ${fileName}`),
      source
    );
  }

  private async fetchViaDirectXlsx(sheetId: string, includeBorrador = true): Promise<DashboardResponse | null> {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx&_t=${Date.now()}`;
    const res = await fetch(url, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache"
      }
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} al solicitar export=xlsx`);
    }
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      throw new Error("El documento requiere autenticación o no es público");
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length < 1000) {
      throw new Error("Archivo de exportación menor a 1KB");
    }
    const salonTitle = sheetId.includes("1w2ZiQPfDfUWM6ODpHQoKn14FGBwwNhzIKxe5-RmEfBw")
      ? "Luxury RD (Google Sheets En Vivo)"
      : "Gloss Sede Principal (Google Sheets En Vivo)";

    return this.processExcelBuffer(
      buffer,
      "Google Sheets (En Vivo)",
      includeBorrador,
      "google_sheets",
      salonTitle
    );
  }

  public async fetchDashboardData(includeBorrador = true, forceRefresh = false, targetSheetId?: string): Promise<DashboardResponse> {
    const currentId = targetSheetId ? this.setSpreadsheetId(targetSheetId) : this.spreadsheetId;
    const now = Date.now();
    const cached = this.cachedDataBySheet.get(currentId);

    if (forceRefresh) {
      this.cachedDataBySheet.delete(currentId);
    } else if (cached && now - cached.timestamp < this.cacheTtlMs) {
      return cached.data;
    }

    let hadPermissionError = false;

    // Estrategia 1: Exportación directa instantánea con cache-busting (Todas las hojas en 1 solicitud atómica)
    try {
      console.log(`Intentando sincronización directa atómica con Google Sheets ID: ${currentId}...`);
      const directData = await this.fetchViaDirectXlsx(currentId, includeBorrador);
      if (directData && directData.orders.length > 0) {
        console.log(`✅ ¡Sincronización directa exitosa! ${directData.orders.length} órdenes, ${directData.agents.length} agentes, ${directData.clients.length} clientes.`);
        this.cachedDataBySheet.set(currentId, { data: directData, timestamp: now });
        return directData;
      }
    } catch (err: any) {
      console.warn("Sincronización directa XLSX:", err.message);
      if (err.message.includes("autenticación") || err.message.includes("401")) {
        hadPermissionError = true;
      }
    }

    // Estrategia 2: Conexión mediante GViz CSV público por pestaña
    try {
      console.log(`Intentando conectar vía gviz CSV con Google Sheets ID: ${currentId}...`);
      const liveData = await this.fetchViaPublicCsv(currentId, includeBorrador);
      if (liveData) {
        console.log(`✅ ¡Conexión en vivo CSV exitosa! ${liveData.orders.length} órdenes, ${liveData.agents.length} agentes, ${liveData.clients.length} clientes.`);
        this.cachedDataBySheet.set(currentId, { data: liveData, timestamp: now });
        return liveData;
      }
    } catch (err: any) {
      console.warn("Fallo al conectar vía gviz CSV:", err.message);
      if (err.message.includes("inicio de sesión") || err.message.includes("401")) {
        hadPermissionError = true;
      }
    }

    const hasCreds = this.checkServiceAccount();
    if (hasCreds) {
      try {
        const auth = new google.auth.GoogleAuth({
          keyFile: this.credentialsPath,
          scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
        });

        const sheets = google.sheets({ version: "v4", auth });
        const spreadsheetMeta = await sheets.spreadsheets.get({
          spreadsheetId: currentId
        });

        const title = spreadsheetMeta.data.properties?.title || "Google Sheet SaS Vaikuntha";
        const sheetNames = (spreadsheetMeta.data.sheets || []).map((s) => s.properties?.title || "");

        const rangesToFetch: string[] = [];
        if (sheetNames.includes("OATC")) rangesToFetch.push("OATC!A2:I");
        if (sheetNames.includes("Borrador")) rangesToFetch.push("Borrador!A2:V");
        if (sheetNames.includes("Asistencia")) rangesToFetch.push("Asistencia!A2:F");
        if (sheetNames.includes("Clientes")) rangesToFetch.push("Clientes!A2:Z");
        if (sheetNames.includes("Agentes")) rangesToFetch.push("Agentes!A2:Z");

        const batchResponse = await sheets.spreadsheets.values.batchGet({
          spreadsheetId: currentId,
          ranges: rangesToFetch
        });

        const valueRanges = batchResponse.data.valueRanges || [];
        let oatcRaw: any[][] = [];
        let borradorRaw: any[][] = [];
        let asistenciaRaw: any[][] = [];
        let clientesRaw: any[][] = [];
        let agentesRaw: any[][] = [];

        valueRanges.forEach((vr) => {
          const range = vr.range || "";
          if (range.startsWith("OATC")) oatcRaw = vr.values || [];
          if (range.startsWith("Borrador")) borradorRaw = vr.values || [];
          if (range.startsWith("Asistencia")) asistenciaRaw = vr.values || [];
          if (range.startsWith("Clientes")) clientesRaw = vr.values || [];
          if (range.startsWith("Agentes")) agentesRaw = vr.values || [];
        });

        const response = this.buildResponseFromRaw(
          oatcRaw,
          borradorRaw,
          asistenciaRaw,
          clientesRaw,
          agentesRaw,
          includeBorrador,
          title,
          "google_sheets"
        );

        this.cachedDataBySheet.set(currentId, { data: response, timestamp: now });
        return response;
      } catch (e: any) {
        console.warn("Fallo Service Account:", e.message);
      }
    }

    console.log("Usando datos de demostración como respaldo para:", currentId);
    const mock = getMockDashboardData(includeBorrador);
    mock.metadata.spreadsheetId = currentId;
    mock.metadata.serviceAccountEmail = this.serviceAccountEmail || "Configura cuenta de servicio o abre permisos";
    mock.metadata.needsPermission = hadPermissionError;
    if (currentId === "1w2ZiQPfDfUWM6ODpHQoKn14FGBwwNhzIKxe5-RmEfBw") {
      mock.metadata.spreadsheetTitle = "Luxury RD (Esperando Permiso de Lectura en Google Sheets)";
    }
    this.cachedDataBySheet.set(currentId, { data: mock, timestamp: now });
    return mock;
  }

  private async fetchViaPublicCsv(sheetId: string, includeBorrador = true): Promise<DashboardResponse | null> {
    const fetchSheet = async (sheetName: string): Promise<any[][]> => {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&_t=${Date.now()}`;
      const res = await fetch(url, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache"
        }
      });
      const text = await res.text();
      if (text.includes("<!DOCTYPE html>")) {
        throw new Error(`La pestaña ${sheetName} requiere inicio de sesión`);
      }
      const wb = XLSX.read(text, { type: "string" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      return raw.slice(1);
    };

    try {
      const [oatcRaw, borradorRaw, asistenciaRaw, clientesRaw, agentesRaw] = await Promise.all([
        fetchSheet("OATC").catch(() => []),
        fetchSheet("Borrador").catch(() => []),
        fetchSheet("Asistencia").catch(() => []),
        fetchSheet("Clientes").catch(() => []),
        fetchSheet("Agentes").catch(() => [])
      ]);

      if (oatcRaw.length === 0 && clientesRaw.length === 0) {
        return null;
      }

      return this.buildResponseFromRaw(
        oatcRaw,
        borradorRaw,
        asistenciaRaw,
        clientesRaw,
        agentesRaw,
        includeBorrador,
        "Google Sheets Vaikuntha (Conexión en Vivo)",
        "google_sheets"
      );
    } catch (err: any) {
      console.warn("Error en fetchViaPublicCsv:", err.message);
      return null;
    }
  }

  private buildResponseFromRaw(
    oatcRaw: any[][],
    borradorRaw: any[][],
    asistenciaRaw: any[][],
    clientesRaw: any[][],
    agentesRaw: any[][],
    includeBorrador: boolean,
    title: string,
    source: "google_sheets" | "excel_upload" | "appscript_webapp" | "mock_data"
  ): DashboardResponse {
    // 1. Crear el resolvedor unificado de nombres de agentes
    const resolveAgent = buildAgentNameResolver(agentesRaw);

    const oatcOrders: OrderRecord[] = oatcRaw
      .map((r, i) => normalizeOatcRow(r, i, resolveAgent))
      .filter((o): o is OrderRecord => o !== null);

    const borradorOrders: OrderRecord[] = includeBorrador
      ? borradorRaw
          .map((r, i) => normalizeBorradorOrderRow(r, i, resolveAgent))
          .filter((o): o is OrderRecord => o !== null)
      : [];

    const allOrders = [...oatcOrders, ...borradorOrders];

    const attendance: AttendanceRecord[] = asistenciaRaw
      .map((r) => normalizeAttendanceRow(r, resolveAgent))
      .filter((a): a is AttendanceRecord => a !== null);

    if (includeBorrador && borradorRaw.length > 0) {
      borradorRaw.forEach((r) => {
        const att = normalizeAttendanceRow(r, resolveAgent);
        if (att && att.date && att.agent) {
          attendance.push(att);
        }
      });
    }

    const sheetClients = normalizeClientesSheet(clientesRaw);
    const clients = consolidateClients(allOrders, sheetClients);

    const extraAgents = new Set<string>();
    allOrders.forEach((o) => {
      if (o.agent && o.agent !== "Sin Asignar") extraAgents.add(o.agent);
    });
    attendance.forEach((a) => {
      if (a.agent) extraAgents.add(a.agent);
    });

    const agentDetails = normalizeAgentesDetails(agentesRaw, Array.from(extraAgents));
    const agents = agentDetails.map((a) => a.name);

    const serviceSet = new Set<string>();
    allOrders.forEach((o) => {
      if (o.serviceType) serviceSet.add(o.serviceType);
    });
    const serviceTypes = Array.from(serviceSet).sort();

    const productivity = calculateAgentProductivity(allOrders, attendance, agents);
    const dateRange = calculateDateRange(allOrders);

    return {
      orders: allOrders,
      clients,
      attendance,
      agents,
      agentDetails,
      serviceTypes,
      productivity,
      dateRange,
      metadata: {
        spreadsheetId: this.spreadsheetId,
        spreadsheetTitle: title,
        lastSync: new Date().toLocaleTimeString("es-ES"),
        source,
        serviceAccountEmail: this.serviceAccountEmail,
        counts: {
          totalOrders: allOrders.length,
          oatcOrders: oatcOrders.length,
          borradorOrders: borradorOrders.length,
          attendanceRecords: attendance.length,
          clientsCount: clients.length,
          agentsCount: agents.length
        }
      }
    };
  }
}

export const googleSheetsService = new GoogleSheetsService();
