import {
  OrderRecord,
  ClientRecord,
  AttendanceRecord,
  AgentProductivity,
  OrderStatus,
  AgentDetail,
  SaleRecord,
  SoldItemStat
} from "../types.js";

/**
 * Convierte formatos heterogéneos de fecha (DD/MM/YYYY, D/M/YYYY, números de serie Excel, etc.) a ISO YYYY-MM-DD
 */
export function parseDateToIso(rawDate: any): string {
  if (!rawDate) return "";

  if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
    const year = rawDate.getFullYear();
    const month = String(rawDate.getMonth() + 1).padStart(2, "0");
    const day = String(rawDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  if (typeof rawDate === "number" && rawDate > 30000) {
    const jsDate = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
    if (!isNaN(jsDate.getTime())) {
      const year = jsDate.getFullYear();
      const month = String(jsDate.getMonth() + 1).padStart(2, "0");
      const day = String(jsDate.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }

  const str = rawDate.toString().trim();
  if (!str) return "";

  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }

  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    let year = dmyMatch[3];
    if (year.length === 2) {
      year = `20${year}`;
    }
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return "";
}

const SPANISH_MONTHS_SHORT = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Set", "Oct", "Nov", "Dic"
];

/**
 * Formatea una fecha a representación legible en español (ej. "04 Set 2026")
 */
export function formatDisplayDate(rawDate: any, isoDate?: string): string {
  const iso = isoDate || parseDateToIso(rawDate);
  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [year, mStr, dStr] = iso.split("-");
    const mIdx = parseInt(mStr, 10) - 1;
    const mName = SPANISH_MONTHS_SHORT[mIdx] || mStr;
    return `${dStr} ${mName} ${year}`;
  }
  if (!rawDate) return "";
  const str = rawDate.toString().trim();
  if (str.includes("GMT") || str.includes("hora estándar")) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const mName = SPANISH_MONTHS_SHORT[d.getMonth()] || "";
      return `${day} ${mName} ${d.getFullYear()}`;
    }
  }
  return str;
}

/**
 * Extrae de forma limpia el nombre, DNI y teléfono a partir de cadenas heterogéneas de celdas
 */
export function parseClientString(rawText: string): { name: string; dni?: string; phone?: string } {
  if (!rawText || typeof rawText !== "string") {
    return { name: "Cliente no registrado" };
  }

  const raw = rawText.trim();
  let name = raw;
  let dni: string | undefined;
  let phone: string | undefined;

  if (raw.includes("|")) {
    const parts = raw.split("|").map((p) => p.trim());
    name = parts[0];

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const dniMatch = part.match(/(?:DNI[:\s]*)?(\b\d{7,8}\b)/i);
      const celMatch = part.match(/(?:CEL|TEL|WS[:\s]*)?(\b9\d{8}\b)/i);

      if (celMatch) {
        phone = celMatch[1];
      } else if (dniMatch) {
        dni = dniMatch[1];
      }
    }
  } else {
    const phoneTrailingMatch = raw.match(/^(.*?)\s+(\b9\d{8}\b)$/);
    if (phoneTrailingMatch) {
      name = phoneTrailingMatch[1].trim();
      phone = phoneTrailingMatch[2].trim();
    } else {
      const dniTrailingMatch = raw.match(/^(.*?)\s+(\b\d{7,8}\b)$/);
      if (dniTrailingMatch) {
        name = dniTrailingMatch[1].trim();
        dni = dniTrailingMatch[2].trim();
      }
    }
  }

  name = name.replace(/^(CLIENTE|SR\.|SRA\.|SRTA\.)\s+/i, "").trim();

  return { name, dni, phone };
}

/**
 * Convierte strings de hora a minutos desde medianoche
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== "string") return null;

  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[4];

  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function calculateMinutesDiff(startTime: string, endTime: string): number | undefined {
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);

  if (startMin === null || endMin === null) return undefined;

  let diff = endMin - startMin;
  if (diff < 0) {
    diff += 24 * 60;
  }
  if (diff > 12 * 60) return undefined;

  return diff;
}

export function parseOrderStatus(
  resolStr: string,
  obsStr: string
): { status: OrderStatus; resolutionTime: string; cancelReason?: string } {
  const resol = (resolStr || "").trim();
  const obs = (obsStr || "").trim();

  if (resol.toLowerCase().includes("cancelado")) {
    return {
      status: "CANCELADO",
      resolutionTime: resol,
      cancelReason: obs || resol
    };
  }

  if (!resol || resol === "-" || resol === "--") {
    return {
      status: "EN_CURSO",
      resolutionTime: ""
    };
  }

  return {
    status: "COMPLETADO",
    resolutionTime: resol
  };
}

/**
 * Mapeo canónico de nombres de agentes (unifica "YISELA" con "Yisela Huamani Isasi", "YOVI" con "Yoncivis Colina Vergas", etc.)
 */
export function buildAgentNameResolver(agentesRaw: any[][]): (name: string) => string {
  const map = new Map<string, string>();

  agentesRaw.forEach((row) => {
    if (!row || row.length < 3) return;
    const fullName = (row[2] || "").toString().trim();
    const nickname = (row[13] || "").toString().trim();

    if (fullName && fullName.toLowerCase() !== "colaboradores") {
      map.set(fullName.toUpperCase(), fullName);
      const firstWord = fullName.split(" ")[0].toUpperCase();
      if (!map.has(firstWord)) map.set(firstWord, fullName);

      if (nickname) {
        map.set(nickname.toUpperCase(), fullName);
      }
    }
  });

  // Mapeos comunes predefinidos
  map.set("MARINO", "MARINO OJEDA RIVERA");
  map.set("MAR", "DELIA MARTHA YAHUANA PULACHE");
  map.set("EUALALI", "Eualalia Chipana Buitron");
  map.set("EUALALI CHIPANA BUITRON", "Eualalia Chipana Buitron");

  return (rawName: string) => {
    if (!rawName) return "Sin Asignar";
    const clean = rawName.trim();
    const upper = clean.toUpperCase();
    return map.get(upper) || clean;
  };
}

export function normalizeOatcRow(row: any[], index: number, resolveAgent?: (name: string) => string): OrderRecord | null {
  if (!row || row.length < 3) return null;

  const regTime = (row[0] || "").toString().trim();
  const idNum = row[1] || index + 1;
  const serviceType = (row[2] || "Sin Especificar").toString().trim();
  const date = (row[3] || "").toString().trim();
  const rawClient = (row[4] || "").toString().trim();
  const clientType = (row[5] || "Cliente").toString().trim();
  const rawAgent = (row[6] || "Sin Asignar").toString().trim();
  const resolTime = (row[7] || "").toString().trim();
  const observation = (row[8] || "").toString().trim();

  // Una orden OATC real DEBE tener fecha y tipo de servicio válidos.
  // Si no tiene fecha, o no tiene cliente ni hora ni agente ni número correlativo, es una fila espuria de catálogo.
  if (!date || !serviceType) return null;
  if (!rawClient && !regTime && !row[1] && !row[6]) return null;

  const isoDate = parseDateToIso(date);
  if (!isoDate) return null;
  const displayDate = formatDisplayDate(date, isoDate);

  const { name, dni, phone } = parseClientString(rawClient);
  const { status, resolutionTime, cancelReason } = parseOrderStatus(resolTime, observation);
  const durationMinutes =
    status === "COMPLETADO" && regTime && resolutionTime
      ? calculateMinutesDiff(regTime, resolutionTime)
      : undefined;

  const agent = resolveAgent ? resolveAgent(rawAgent) : rawAgent;

  return {
    id: `OATC-${idNum}`,
    source: "OATC",
    registerTime: regTime,
    serviceType,
    date: displayDate || date,
    isoDate,
    clientName: name,
    clientDni: dni,
    clientPhone: phone,
    clientType,
    agent,
    resolutionTime,
    status,
    cancelReason,
    durationMinutes,
    observation
  };
}

export function normalizeBorradorOrderRow(row: any[], index: number, resolveAgent?: (name: string) => string): OrderRecord | null {
  if (!row || row.length < 16) return null;

  const regTime = (row[13] || "").toString().trim();
  const idNum = row[14] || `B-${index + 1}`;
  const serviceType = (row[15] || "").toString().trim();
  const date = (row[16] || "").toString().trim();
  const rawClient = (row[17] || "").toString().trim();
  const clientType = (row[18] || "Cliente").toString().trim();
  const rawAgent = (row[19] || "Sin Asignar").toString().trim();
  const resolTime = (row[20] || "").toString().trim();
  const observation = (row[21] || "").toString().trim();

  if (!serviceType && !rawClient) return null;

  const { name, dni, phone } = parseClientString(rawClient);
  const { status, resolutionTime, cancelReason } = parseOrderStatus(resolTime, observation);
  const isoDate = parseDateToIso(date);
  const displayDate = formatDisplayDate(date, isoDate);
  const agent = resolveAgent ? resolveAgent(rawAgent) : rawAgent;

  return {
    id: `BORRADOR-${idNum}`,
    source: "Borrador",
    registerTime: regTime || resolTime || "En curso",
    serviceType: serviceType || "Servicio del Día",
    date: displayDate || new Date().toLocaleDateString("es-ES"),
    isoDate: isoDate || new Date().toISOString().slice(0, 10),
    clientName: name,
    clientDni: dni,
    clientPhone: phone,
    clientType,
    agent,
    resolutionTime,
    status,
    cancelReason,
    observation
  };
}

export function normalizeAttendanceRow(row: any[], resolveAgent?: (name: string) => string): AttendanceRecord | null {
  if (!row || row.length < 2) return null;

  const date = (row[0] || "").toString().trim();
  const rawAgent = (row[1] || "").toString().trim();
  const entryTime = (row[2] || "").toString().trim();
  const refI = (row[3] || "").toString().trim();
  const refT = (row[4] || "").toString().trim();
  const exitTime = (row[5] || "").toString().trim();

  if (!date || !rawAgent || !entryTime) return null;

  let totalWorkMinutes = 0;
  let breakMinutes = 0;

  if (refI && refT) {
    const b = calculateMinutesDiff(refI, refT);
    if (b) breakMinutes = b;
  }

  if (entryTime && exitTime) {
    const rawSpan = calculateMinutesDiff(entryTime, exitTime);
    if (rawSpan) {
      totalWorkMinutes = Math.max(0, rawSpan - breakMinutes);
    }
  } else if (entryTime) {
    totalWorkMinutes = 480;
  }

  const isoDate = parseDateToIso(date);
  const displayDate = formatDisplayDate(date, isoDate);
  const agent = resolveAgent ? resolveAgent(rawAgent) : rawAgent;

  return {
    date: displayDate || date,
    isoDate,
    agent,
    entryTime,
    breakStart: refI || undefined,
    breakEnd: refT || undefined,
    exitTime: exitTime || undefined,
    totalWorkMinutes,
    breakMinutes
  };
}

export function normalizeClientesSheet(rows: any[][]): ClientRecord[] {
  if (!rows || rows.length === 0) return [];

  const clients: ClientRecord[] = [];
  rows.forEach((row, i) => {
    if (!row || row.length < 2) return;
    const nombre = (row[1] || "").toString().trim();
    const apellido = (row[2] || "").toString().trim();
    const fullName = `${nombre} ${apellido}`.trim();
    const dni = row[3] ? row[3].toString().trim() : undefined;
    const phone = row[5] ? row[5].toString().trim() : undefined;

    if (fullName && fullName.toLowerCase() !== "nombre apellido" && fullName.toLowerCase() !== "nombre") {
      clients.push({
        id: `CLI-REAL-${i + 1}`,
        name: fullName,
        dni,
        phone,
        rawText: `${fullName} ${dni || ""} ${phone || ""}`.trim(),
        totalVisits: 0,
        firstVisit: formatDisplayDate(row[0]) || "--",
        lastVisit: formatDisplayDate(row[7]) || "--",
        services: []
      });
    }
  });

  return clients;
}

export function normalizeAgentesDetails(rows: any[][], allActiveAgentNames: string[] = []): AgentDetail[] {
  const result: AgentDetail[] = [];
  const seen = new Set<string>();

  if (rows && rows.length > 0) {
    rows.forEach((row) => {
      if (!row || row.length < 3) return;
      const fullName = (row[2] || "").toString().trim();
      const nickname = (row[13] || "").toString().trim();
      const ficha = row[1];
      const role = (row[11] || "").toString().trim();
      const status = (row[10] || "").toString().trim();

      if (fullName && fullName.toLowerCase() !== "colaboradores" && !seen.has(fullName)) {
        seen.add(fullName);
        result.push({
          ficha: typeof ficha === "number" ? ficha : parseInt(ficha) || result.length + 1,
          name: fullName,
          nickname: nickname || undefined,
          role: role || undefined,
          status: status || undefined
        });
      }
    });
  }

  // Ordenar por número de ficha oficial de la hoja
  result.sort((a, b) => (Number(a.ficha) || 99) - (Number(b.ficha) || 99));

  // Añadir cualquier agente extra de órdenes históricas (ej. MAGALI, NACZ)
  allActiveAgentNames.forEach((agentName) => {
    if (agentName && agentName !== "Sin Asignar" && !seen.has(agentName)) {
      seen.add(agentName);
      result.push({
        ficha: result.length + 1,
        name: agentName,
        nickname: agentName,
        role: "Histórico",
        status: "Histórico"
      });
    }
  });

  return result;
}

export function normalizeAgentesSheet(rows: any[][]): string[] {
  if (!rows || rows.length === 0) return [];

  const details = normalizeAgentesDetails(rows);
  return details.map((d) => d.name);
}

/**
 * Normaliza cadenas eliminando tildes, signos y reduciendo espacios para matching difuso
 */
export function cleanStringForMatch(s: string): string {
  if (!s) return "";
  return s
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Motor de resolución inteligente de estilistas para la columna F de Ventas hacia Agentes oficiales
 */
export function buildEstilistaResolver(agentesRaw: any[][]): (name: string) => string {
  const explicitOverrides: Record<string, string> = {
    "JIMMY CARLOS FLORES COCA": "Carlos Jimi Flores Coca",
    "GLADYS GLOSSS": "Gladis Laiza Bazan",
    "CARLOS AGUSTO DAULIA REVILLA": "CARLOS COFIURE",
    "HILDA GLOWS": "Gladis Laiza Bazan",
    "LUXURY": "Sin Asignar",
    "STALY LUXURY": "Sin Asignar",
    "GONZALES SALON SPA": "Sin Asignar"
  };

  interface AgentCatalogEntry {
    fullName: string;
    nickname?: string;
    cleanFull: string;
    cleanNick: string;
    words: string[];
  }

  const catalog: AgentCatalogEntry[] = [];

  if (agentesRaw && agentesRaw.length > 0) {
    agentesRaw.forEach((row) => {
      if (!row || row.length < 3) return;
      const fullName = (row[2] || "").toString().trim();
      const nickname = (row[13] || "").toString().trim();

      if (fullName && fullName.toLowerCase() !== "colaboradores") {
        catalog.push({
          fullName,
          nickname: nickname || undefined,
          cleanFull: cleanStringForMatch(fullName),
          cleanNick: cleanStringForMatch(nickname),
          words: cleanStringForMatch(fullName).split(" ").filter(Boolean)
        });
      }
    });
  }

  return (rawName: string): string => {
    if (!rawName) return "Sin Asignar";
    const trimmed = rawName.trim();
    if (!trimmed) return "Sin Asignar";

    const upper = trimmed.toUpperCase();
    if (explicitOverrides[upper]) {
      return explicitOverrides[upper];
    }

    const cRaw = cleanStringForMatch(trimmed);

    // 1. Coincidencia limpia directa con nombre completo o nickname
    for (const ag of catalog) {
      if (ag.cleanFull === cRaw || (ag.cleanNick && ag.cleanNick === cRaw)) {
        return ag.fullName;
      }
    }

    // 2. Coincidencia difusa con equivalencia fonética Y <-> I
    const cRawFuzzy = cRaw.replace(/Y/g, "I");
    for (const ag of catalog) {
      const agFuzzyNick = ag.cleanNick.replace(/Y/g, "I");
      const agFuzzyFull = ag.cleanFull.replace(/Y/g, "I");

      // Guardia contra colisión de apellidos compartidos: Magali vs Gladis (ambas Laiza Bazan)
      if (cRawFuzzy.includes("GLAD") && !agFuzzyNick.includes("GLAD")) continue;
      if (cRawFuzzy.includes("MAGAL") && !agFuzzyNick.includes("MAGAL")) continue;

      if (agFuzzyNick && (agFuzzyNick === cRawFuzzy || cRawFuzzy.split(" ").includes(agFuzzyNick))) {
        return ag.fullName;
      }
      if (agFuzzyFull === cRawFuzzy) {
        return ag.fullName;
      }
    }

    // 3. Intersección de tokens de palabras con equivalencia B/V y Y/I (ej. Carvajal vs Carbajal)
    const rawWords = cRaw.split(" ").filter((w) => w.length > 2);
    let bestMatch: string | null = null;
    let maxMatches = 0;

    for (const ag of catalog) {
      if (cRaw.includes("MAGAL") && ag.cleanFull.includes("GLADIS")) continue;
      if (cRaw.includes("GLAD") && ag.cleanFull.includes("MAGALI")) continue;

      let matchCount = 0;
      for (const w of rawWords) {
        const wNorm = w.replace(/B/g, "V").replace(/Y/g, "I");
        for (const aw of ag.words) {
          const awNorm = aw.replace(/B/g, "V").replace(/Y/g, "I");
          if (wNorm === awNorm) {
            matchCount++;
            break;
          }
        }
      }

      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        bestMatch = ag.fullName;
      }
    }

    if (maxMatches >= 2 && bestMatch) {
      return bestMatch;
    }

    return trimmed;
  };
}

/**
 * Normaliza una fila individual de la hoja de ventas
 * Columnas:
 * Col A (0): Fecha (considerar)
 * Col B (1): RazSoc. (no considerar)
 * Col C (2): Doc. (no considerar)
 * Col D (3): Numero (no considerar)
 * Col E (4): Cliente (considerar)
 * Col F (5): Estilista (considerar & normalizar)
 * Col G (6): Producto / Servicio (considerar)
 * Col H (7): Cant. (considerar)
 * Col I (8): Importe. (considerar)
 */
export function normalizeSalesRow(
  row: any[],
  index: number,
  resolveEstilista: (name: string) => string
): SaleRecord | null {
  if (!row || row.length < 6) return null;

  const rawDate = row[0];
  const rawClient = (row[4] || "CLIENTE").toString().trim();
  const rawEstilista = (row[5] || "Sin Asignar").toString().trim();
  const rawItem = (row[6] || "").toString().trim();
  const rawCant = row[7];
  const rawImporte = row[8];

  // Descartar cabecera o filas vacías
  if (
    rawDate === "Fecha" ||
    rawEstilista === "Estilista" ||
    rawItem === "Producto / Servicio" ||
    rawImporte === "Importe."
  ) {
    return null;
  }

  if (!rawItem && (rawImporte === undefined || rawImporte === null || rawImporte === "")) {
    return null;
  }

  const isoDate = parseDateToIso(rawDate);
  const displayDate = formatDisplayDate(rawDate, isoDate);

  let quantity = 1;
  if (typeof rawCant === "number") {
    quantity = rawCant;
  } else if (rawCant) {
    const cleanQty = rawCant.toString().replace(/[^0-9.-]+/g, "");
    quantity = parseFloat(cleanQty) || 1;
  }

  let amount = 0;
  if (typeof rawImporte === "number") {
    amount = rawImporte;
  } else if (rawImporte) {
    const cleanNum = rawImporte.toString().replace(/[^0-9.-]+/g, "");
    amount = parseFloat(cleanNum) || 0;
  }

  const resolvedAgent = resolveEstilista(rawEstilista);

  return {
    id: `SALE-${index + 1}`,
    date: displayDate || (rawDate ? rawDate.toString() : ""),
    isoDate,
    clientName: rawClient || "CLIENTE",
    agent: resolvedAgent,
    rawAgent: rawEstilista,
    item: rawItem || "Servicio / Producto sin especificar",
    quantity: Math.max(0, quantity),
    amount: Math.round(amount * 100) / 100
  };
}

export function normalizeSalesSheet(
  rows: any[][],
  resolveEstilista: (name: string) => string
): SaleRecord[] {
  if (!rows || rows.length === 0) return [];

  const sales: SaleRecord[] = [];
  for (let i = 0; i < rows.length; i++) {
    const record = normalizeSalesRow(rows[i], i, resolveEstilista);
    if (record) {
      sales.push(record);
    }
  }

  return sales;
}

export function consolidateClients(orders: OrderRecord[], sheetClients: ClientRecord[] = []): ClientRecord[] {
  const clientMap = new Map<string, ClientRecord>();

  // 1. Añadir clientes de la base maestra real
  for (const sc of sheetClients) {
    const key = sc.dni || sc.phone || sc.name.toLowerCase();
    clientMap.set(key, sc);
  }

  // 2. Fusionar con las atenciones reales en OATC y Borrador
  for (const o of orders) {
    if (!o.clientName || o.clientName === "Cliente no registrado" || o.clientName === "POR ASIGNAR") continue;

    const key = o.clientDni || o.clientPhone || o.clientName.toLowerCase();

    if (!clientMap.has(key)) {
      clientMap.set(key, {
        id: `CLI-${clientMap.size + 1}`,
        name: o.clientName,
        dni: o.clientDni,
        phone: o.clientPhone,
        rawText: `${o.clientName} ${o.clientPhone || ""} ${o.clientDni || ""}`.trim(),
        totalVisits: 1,
        firstVisit: o.date,
        lastVisit: o.date,
        preferredAgent: o.agent,
        services: o.serviceType ? [o.serviceType] : []
      });
    } else {
      const existing = clientMap.get(key)!;
      existing.totalVisits += 1;
      existing.lastVisit = o.date;
      if (existing.firstVisit === "--") existing.firstVisit = o.date;
      if (!existing.dni && o.clientDni) existing.dni = o.clientDni;
      if (!existing.phone && o.clientPhone) existing.phone = o.clientPhone;
      if (o.serviceType && !existing.services.includes(o.serviceType)) {
        existing.services.push(o.serviceType);
      }
      if (o.agent && o.agent !== "Sin Asignar") {
        existing.preferredAgent = o.agent;
      }
    }
  }

  return Array.from(clientMap.values()).sort((a, b) => b.totalVisits - a.totalVisits);
}

export function calculateAgentProductivity(
  orders: OrderRecord[],
  attendance: AttendanceRecord[],
  knownAgents: string[] = [],
  sales: SaleRecord[] = []
): Record<string, AgentProductivity> {
  const result: Record<string, AgentProductivity> = {};

  const agents = new Set<string>(knownAgents);
  orders.forEach((o) => {
    if (o.agent && o.agent !== "Sin Asignar") agents.add(o.agent);
  });
  attendance.forEach((a) => {
    if (a.agent) agents.add(a.agent);
  });
  sales.forEach((s) => {
    if (s.agent && s.agent !== "Sin Asignar") agents.add(s.agent);
  });

  for (const agent of agents) {
    const agentOrders = orders.filter((o) => o.agent.toLowerCase() === agent.toLowerCase());
    const agentAttendance = attendance.filter((a) => a.agent.toLowerCase() === agent.toLowerCase());
    const agentSales = sales.filter((s) => s.agent.toLowerCase() === agent.toLowerCase());

    const totalOrders = agentOrders.length;
    const completedOrders = agentOrders.filter((o) => o.status === "COMPLETADO").length;
    const canceledOrders = agentOrders.filter((o) => o.status === "CANCELADO").length;
    const inProgressOrders = agentOrders.filter((o) => o.status === "EN_CURSO").length;

    const totalWorkMinutes = agentAttendance.reduce((acc, curr) => acc + curr.totalWorkMinutes, 0);

    const effectiveHours =
      totalWorkMinutes > 0 ? totalWorkMinutes / 60 : Math.max(1, completedOrders * 0.75);

    const ordersPerHour = parseFloat((completedOrders / effectiveHours).toFixed(2));

    const durations = agentOrders
      .map((o) => o.durationMinutes)
      .filter((d): d is number => typeof d === "number" && d > 0);
    const avgDurationMinutes =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 45;

    const serviceCount: Record<string, number> = {};
    agentOrders.forEach((o) => {
      if (o.serviceType) {
        serviceCount[o.serviceType] = (serviceCount[o.serviceType] || 0) + 1;
      }
    });
    const topServices = Object.entries(serviceCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const clientCount: Record<string, { visits: number; phone?: string }> = {};
    agentOrders.forEach((o) => {
      if (o.clientName && o.clientName !== "Cliente no registrado" && o.clientName !== "POR ASIGNAR") {
        if (!clientCount[o.clientName]) {
          clientCount[o.clientName] = { visits: 1, phone: o.clientPhone };
        } else {
          clientCount[o.clientName].visits += 1;
          if (!clientCount[o.clientName].phone && o.clientPhone) {
            clientCount[o.clientName].phone = o.clientPhone;
          }
        }
      }
    });
    const loyalClients = Object.entries(clientCount)
      .map(([name, val]) => ({ name, visits: val.visits, phone: val.phone }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 6);

    // Métricas Financieras y Comerciales de Ventas
    let totalSalesAmount = 0;
    let totalSalesCount = 0;
    let averageTicket = 0;
    let topSoldItems: SoldItemStat[] = [];

    if (agentSales.length > 0) {
      const rawSalesAmount = agentSales.reduce((acc, s) => acc + s.amount, 0);
      totalSalesAmount = Math.round(rawSalesAmount * 100) / 100;
      totalSalesCount = agentSales.reduce((acc, s) => acc + s.quantity, 0);
      averageTicket = totalSalesCount > 0 ? Math.round((totalSalesAmount / totalSalesCount) * 100) / 100 : 0;

      const itemAggregation: Record<string, { count: number; amount: number }> = {};
      agentSales.forEach((s) => {
        const itemKey = s.item || "Varios";
        if (!itemAggregation[itemKey]) {
          itemAggregation[itemKey] = { count: 0, amount: 0 };
        }
        itemAggregation[itemKey].count += s.quantity;
        itemAggregation[itemKey].amount += s.amount;
      });

      topSoldItems = Object.entries(itemAggregation)
        .map(([name, stat]) => ({
          name,
          count: stat.count,
          amount: Math.round(stat.amount * 100) / 100
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
    }

    result[agent] = {
      agent,
      totalOrders,
      completedOrders,
      canceledOrders,
      inProgressOrders,
      totalWorkMinutes,
      ordersPerHour,
      avgDurationMinutes,
      topServices,
      loyalClients,
      totalSalesAmount,
      totalSalesCount,
      averageTicket,
      topSoldItems
    };
  }

  return result;
}

export function calculateDateRange(orders: OrderRecord[]): { minDate: string; maxDate: string } {
  if (orders.length === 0) {
    const today = new Date().toISOString().slice(0, 10);
    return { minDate: today, maxDate: today };
  }

  const isoDates = orders.map((o) => o.isoDate).filter((d) => Boolean(d)).sort();
  return {
    minDate: isoDates[0] || new Date().toISOString().slice(0, 10),
    maxDate: isoDates[isoDates.length - 1] || new Date().toISOString().slice(0, 10)
  };
}
