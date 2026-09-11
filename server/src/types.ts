export interface ClientRecord {
  id: string;
  name: string;
  dni?: string;
  phone?: string;
  rawText: string;
  totalVisits: number;
  firstVisit: string;
  lastVisit: string;
  preferredAgent?: string;
  services: string[];
}

export type OrderStatus = "COMPLETADO" | "CANCELADO" | "EN_CURSO";

export interface OrderRecord {
  id: string | number;
  source: "OATC" | "Borrador";
  registerTime: string;
  serviceType: string;
  date: string;
  isoDate: string; // Formato YYYY-MM-DD
  clientName: string;
  clientDni?: string;
  clientPhone?: string;
  clientType: string;
  agent: string;
  resolutionTime: string;
  status: OrderStatus;
  cancelReason?: string;
  durationMinutes?: number;
  observation?: string;
}

export interface AttendanceRecord {
  date: string;
  isoDate: string; // Formato YYYY-MM-DD
  agent: string;
  entryTime: string;
  breakStart?: string;
  breakEnd?: string;
  exitTime?: string;
  totalWorkMinutes: number;
  breakMinutes: number;
}

export interface AgentProductivity {
  agent: string;
  totalOrders: number;
  completedOrders: number;
  canceledOrders: number;
  inProgressOrders: number;
  totalWorkMinutes: number;
  ordersPerHour: number;
  avgDurationMinutes: number;
  topServices: { name: string; count: number }[];
  loyalClients: { name: string; visits: number; phone?: string }[];
}

export interface SpreadsheetConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  serviceAccountEmail?: string;
  isConfigured: boolean;
  usingMockData: boolean;
  lastSync?: string;
}

export interface AgentDetail {
  name: string;
  nickname?: string;
  ficha?: number | string;
  role?: string;
  status?: string;
}

export interface DashboardResponse {
  orders: OrderRecord[];
  clients: ClientRecord[];
  attendance: AttendanceRecord[];
  agents: string[];
  agentDetails?: AgentDetail[];
  serviceTypes: string[];
  productivity: Record<string, AgentProductivity>;
  dateRange: {
    minDate: string;
    maxDate: string;
  };
  metadata: {
    spreadsheetId: string;
    spreadsheetTitle: string;
    lastSync: string;
    source: "google_sheets" | "excel_upload" | "appscript_webapp" | "mock_data";
    serviceAccountEmail?: string;
    needsPermission?: boolean;
    counts: {
      totalOrders: number;
      oatcOrders: number;
      borradorOrders: number;
      attendanceRecords: number;
      clientsCount: number;
      agentsCount: number;
    };
  };
}
