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
  isoDate: string;
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
  isoDate: string;
  agent: string;
  entryTime: string;
  breakStart?: string;
  breakEnd?: string;
  exitTime?: string;
  totalWorkMinutes: number;
  breakMinutes: number;
}

export interface SoldItemStat {
  name: string;
  count: number;
  amount: number;
}

export interface SaleRecord {
  id: string;
  date: string;
  isoDate: string;
  clientName: string;
  agent: string;
  rawAgent: string;
  item: string;
  quantity: number;
  amount: number;
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
  totalSalesAmount?: number;
  totalSalesCount?: number;
  averageTicket?: number;
  topSoldItems?: SoldItemStat[];
}

export type DatePreset = "ALL" | "TODAY" | "LAST_7_DAYS" | "THIS_MONTH" | "LAST_30_DAYS" | "THIS_YEAR" | "CUSTOM";

export interface DateFilter {
  preset: DatePreset;
  startDate?: string;
  endDate?: string;
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
  sales?: SaleRecord[];
  dateRange?: {
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
      agentsCount?: number;
      salesCount?: number;
      totalSalesAmount?: number;
    };
  };
}

export interface SalonConfig {
  id: string;
  name: string;
  spreadsheetId: string;
  tag: string;
}

export const SALONS: SalonConfig[] = [
  {
    id: "gloss",
    name: "Gloss",
    spreadsheetId: "1SXuedQigLxVUF2oxn65wEZ5-HnDDiVdy7lY7HaweVC4",
    tag: "Sede Principal"
  },
  {
    id: "luxury_rd",
    name: "Luxury RD",
    spreadsheetId: "1w2ZiQPfDfUWM6ODpHQoKn14FGBwwNhzIKxe5-RmEfBw",
    tag: "Sede Luxury RD"
  }
];

export interface StatusResponse {
  success: boolean;
  spreadsheetId: string;
  serviceAccountEmail?: string;
  hasServiceAccountFile: boolean;
}
