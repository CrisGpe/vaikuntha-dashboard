import {
  normalizeOatcRow,
  normalizeBorradorOrderRow,
  normalizeAttendanceRow,
  consolidateClients,
  calculateAgentProductivity,
  calculateDateRange
} from "./services/dataNormalizer.js";
import { DashboardResponse, OrderRecord, AttendanceRecord } from "./types.js";

const RAW_OATC_ROWS: any[][] = [
  // Hr reg, #, Tipo OATC, Fecha, Cliente, Tipo cliente, Agente, Hora Resol, Observación
  ["09:15 AM", 1, "Corte", "19/11/2025", "Norma Yanina Lopez Cabrera | 06682244", "Cita", "Jeferson Denis Ayala Salvatierra", "09:55 AM", ""],
  ["09:30 AM", 2, "Tratamientos Capilares", "19/11/2025", "MARIA FLOR AGUILAR 947459804", "Cliente", "MARINO", "10:45 AM", ""],
  ["10:00 AM", 3, "Color", "19/11/2025", "Veronica Novella Alcantara | DNI:7253557 | CEL:996375377", "Cita", "Jeferson Denis Ayala Salvatierra", "12:15 PM", "Aplicación de tinte e hidratación"],
  ["10:15 AM", 4, "POLYGEL", "19/11/2025", "ROCIO", "turno", "Brenda Quispe", "11:30 AM", ""],
  ["11:00 AM", 5, "Alisados, laceados y botox", "19/11/2025", "Karina Vasquez Gomez | CEL:987654321", "Cita", "MARINO", "01:30 PM", ""],
  ["11:30 AM", 6, "Manos y pies", "19/11/2025", "Norma Yanina Lopez Cabrera | 06682244", "Cliente", "Brenda Quispe", "12:45 PM", ""],
  ["12:00 PM", 7, "Corte", "19/11/2025", "Pedro Castillo | DNI:45892134", "TurnoCaballero", "Carlos Mendoza", "12:35 PM", ""],
  ["12:36 PM", 8, "Cosmiatria", "19/11/2025", "Ana Sofia Rivas | CEL:945112233", "Asesoría", "Jeferson Denis Ayala Salvatierra", "Cancelado a las: 19/11/2025 1:10 PM", "el motivo fue: \"Cliente no disponía de tiempo suficiente\""],
  ["02:00 PM", 9, "Peinados", "19/11/2025", "Lucia Méndez 978123456", "Cita", "Jeferson Denis Ayala Salvatierra", "03:15 PM", "Evento de gala"],
  ["02:30 PM", 10, "Corte", "19/11/2025", "Mateo Salvatierra | DNI:78945612", "TurnoNiño", "Carlos Mendoza", "03:00 PM", ""],
  ["03:15 PM", 11, "Maquillaje y peinado", "19/11/2025", "MARIA FLOR AGUILAR 947459804", "PROMO(COMBOS)", "Jeferson Denis Ayala Salvatierra", "05:00 PM", "Combo fiesta"],
  ["03:45 PM", 12, "Cosmetología", "19/11/2025", "Gloria Estefan | CEL:991234888", "Cliente", "Brenda Quispe", "04:45 PM", ""],
  ["04:30 PM", 13, "Tratamientos Capilares", "19/11/2025", "Veronica Novella Alcantara | DNI:7253557 | CEL:996375377", "Cliente", "MARINO", "05:40 PM", "Cauterización capilar"],
  ["05:00 PM", 14, "Corte", "19/11/2025", "Alonso Fernandez | CEL:963852741", "TurnoCaballero", "Carlos Mendoza", "Cancelado a las: 19/11/2025 5:25 PM", "el motivo fue: \"Demora en el turno previo\""],
  ["05:15 PM", 15, "Manos y pies", "19/11/2025", "ROCIO", "Cliente", "Brenda Quispe", "06:30 PM", "Manicura spa"],
  ["06:00 PM", 16, "Color", "19/11/2025", "Norma Yanina Lopez Cabrera | 06682244", "Cita", "Jeferson Denis Ayala Salvatierra", "08:10 PM", "Retoque de raíz"],
  ["06:30 PM", 17, "Servicios de cabina", "19/11/2025", "Patricia Ugarte | DNI:10293847", "Asesoría", "MARINO", "07:30 PM", ""],
  ["07:00 PM", 18, "Producto", "19/11/2025", "Veronica Novella Alcantara | DNI:7253557 | CEL:996375377", "Cliente", "Jeferson Denis Ayala Salvatierra", "07:15 PM", "Venta Shampoo Post Alisado"],

  ["09:00 AM", 19, "Alisados, laceados y botox", "20/11/2025", "Elena Morales | CEL:974123654", "Cita", "MARINO", "11:45 AM", ""],
  ["09:30 AM", 20, "Corte", "20/11/2025", "Sebastian Ruiz | DNI:41258963", "TurnoCaballero", "Carlos Mendoza", "10:05 AM", ""],
  ["10:00 AM", 21, "Color", "20/11/2025", "MARIA FLOR AGUILAR 947459804", "Cliente", "Jeferson Denis Ayala Salvatierra", "12:30 PM", "Balayage"],
  ["10:30 AM", 22, "POLYGEL", "20/11/2025", "Diana Flores | CEL:985214796", "Cliente", "Brenda Quispe", "12:00 PM", ""],
  ["11:15 AM", 23, "Tratamientos Capilares", "20/11/2025", "Norma Yanina Lopez Cabrera | 06682244", "Cita", "MARINO", "12:20 PM", "Botox capilar"],
  ["12:00 PM", 24, "Corte", "20/11/2025", "Lucas Paredes", "TurnoNino", "Carlos Mendoza", "12:40 PM", ""],
  ["02:15 PM", 25, "Maquillaje", "20/11/2025", "Carla Benavides | CEL:996541235", "Cita", "Jeferson Denis Ayala Salvatierra", "03:15 PM", ""],
  ["03:00 PM", 26, "Corrección", "20/11/2025", "Silvia Mendoza 912345678", "Corrección", "MARINO", "04:30 PM", "Garantía color"],
  ["04:00 PM", 27, "Cosmiatria", "20/11/2025", "Veronica Novella Alcantara | DNI:7253557 | CEL:996375377", "Cliente", "Jeferson Denis Ayala Salvatierra", "05:15 PM", "Limpieza facial profunda"],
  ["05:00 PM", 28, "Manos y pies", "20/11/2025", "ROCIO", "turno", "Brenda Quispe", "Cancelado a las: 20/11/2025 5:30 PM", "el motivo fue: \"Tuvo urgencia familiar\""],
  ["05:30 PM", 29, "Corte", "20/11/2025", "Javier Alva | DNI:09876543", "TurnoCaballero", "Carlos Mendoza", "06:10 PM", ""],
  ["06:15 PM", 30, "Tratamientos Capilares", "20/11/2025", "MARIA FLOR AGUILAR 947459804", "Cliente", "MARINO", "07:30 PM", "Olaplex"]
];

const RAW_BORRADOR_ROWS: any[][] = [
  [
    "09/09/2026", "MARINO", "09:03:47 AM", "12:00:25 PM", "12:48:49 PM", "08:09 PM",
    "", "", "", "", "", "", "", "",
    101, "Corte", "09/09/2026", "Norma Yanina Lopez Cabrera | 06682244", "Cita", "MARINO", "09:50 AM", ""
  ],
  [
    "09/09/2026", "Jeferson Denis Ayala Salvatierra", "08:55:10 AM", "01:10:00 PM", "01:55:20 PM", "",
    "", "", "", "", "", "", "", "",
    102, "Tratamientos Capilares", "09/09/2026", "Veronica Novella Alcantara | DNI:7253557 | CEL:996375377", "Cliente", "Jeferson Denis Ayala Salvatierra", "11:15 AM", ""
  ],
  [
    "09/09/2026", "Brenda Quispe", "09:10:22 AM", "01:00:00 PM", "01:45:00 PM", "",
    "", "", "", "", "", "", "", "",
    103, "Manos y pies", "09/09/2026", "ROCIO", "turno", "Brenda Quispe", "10:30 AM", ""
  ],
  [
    "09/09/2026", "Carlos Mendoza", "09:00:00 AM", "02:00:00 PM", "02:40:00 PM", "",
    "", "", "", "", "", "", "", "",
    104, "Corte", "09/09/2026", "Felipe Carrillo | DNI:47859632", "TurnoCaballero", "Carlos Mendoza", "10:15 AM", ""
  ],
  [
    "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    105, "Color", "09/09/2026", "MARIA FLOR AGUILAR 947459804", "Cliente", "Jeferson Denis Ayala Salvatierra", "Cancelado a las: 09/09/2026 12:05 PM", "el motivo fue: \"No llegó al turno a tiempo\""
  ],
  [
    "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    106, "Alisados, laceados y botox", "09/09/2026", "Vanessa Romero | CEL:984512369", "Cita", "MARINO", "", "En proceso de aplicación"
  ]
];

const RAW_ATTENDANCE_ROWS: any[][] = [
  ["19/11/2025", "Jeferson Denis Ayala Salvatierra", "09:00:10 AM", "01:00:00 PM", "01:45:00 PM", "08:15:00 PM"],
  ["19/11/2025", "MARINO", "09:03:47 AM", "12:00:25 PM", "12:48:49 PM", "08:09:00 PM"],
  ["19/11/2025", "Brenda Quispe", "09:15:00 AM", "01:30:00 PM", "02:15:00 PM", "07:45:00 PM"],
  ["19/11/2025", "Carlos Mendoza", "08:50:00 AM", "01:00:00 PM", "01:35:00 PM", "06:30:00 PM"],
  ["20/11/2025", "Jeferson Denis Ayala Salvatierra", "08:58:00 AM", "01:15:00 PM", "02:00:00 PM", "08:00:00 PM"],
  ["20/11/2025", "MARINO", "09:05:00 AM", "12:15:00 PM", "01:00:00 PM", "08:10:00 PM"],
  ["20/11/2025", "Brenda Quispe", "09:10:00 AM", "01:20:00 PM", "02:05:00 PM", "08:00:00 PM"],
  ["20/11/2025", "Carlos Mendoza", "08:55:00 AM", "01:00:00 PM", "01:40:00 PM", "07:00:00 PM"],
  ["09/09/2026", "MARINO", "09:03:47 AM", "12:00:25 PM", "12:48:49 PM", "08:09:00 PM"],
  ["09/09/2026", "Jeferson Denis Ayala Salvatierra", "08:55:10 AM", "01:10:00 PM", "01:55:20 PM", "08:00:00 PM"],
  ["09/09/2026", "Brenda Quispe", "09:10:22 AM", "01:00:00 PM", "01:45:00 PM", "07:50:00 PM"],
  ["09/09/2026", "Carlos Mendoza", "09:00:00 AM", "02:00:00 PM", "02:40:00 PM", "06:45:00 PM"]
];

export function getMockDashboardData(includeBorrador = true): DashboardResponse {
  const oatcOrders: OrderRecord[] = RAW_OATC_ROWS.map((r, i) => normalizeOatcRow(r, i)).filter(
    (o): o is OrderRecord => o !== null
  );

  const borradorOrders: OrderRecord[] = includeBorrador
    ? RAW_BORRADOR_ROWS.map((r, i) => normalizeBorradorOrderRow(r, i)).filter(
        (o): o is OrderRecord => o !== null
      )
    : [];

  const allOrders = [...oatcOrders, ...borradorOrders];

  const attendance: AttendanceRecord[] = RAW_ATTENDANCE_ROWS.map((r) =>
    normalizeAttendanceRow(r)
  ).filter((a): a is AttendanceRecord => a !== null);

  const clients = consolidateClients(allOrders);

  const agentsSet = new Set<string>();
  allOrders.forEach((o) => {
    if (o.agent && o.agent !== "Sin Asignar") agentsSet.add(o.agent);
  });
  const agents = Array.from(agentsSet).sort();

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
    serviceTypes,
    productivity,
    dateRange,
    metadata: {
      spreadsheetId: "1SXuedQigLxVUF2oxn65wEZ5-HnDDiVdy7lY7HaweVC4",
      spreadsheetTitle: "Demanda OATC & Operaciones Vaikuntha (Modo Demostración)",
      lastSync: new Date().toLocaleTimeString("es-ES"),
      source: "mock_data",
      serviceAccountEmail: "vaikuntha-sync@sa-vaikuntha.iam.gserviceaccount.com",
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
