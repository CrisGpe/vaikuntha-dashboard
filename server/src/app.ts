import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { googleSheetsService } from "./services/googleSheetsService.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.raw({ type: "application/octet-stream", limit: "50mb" }));

// Router con los endpoints de la API
const apiRouter = express.Router();

// GET /data - Obtener datos del dashboard
apiRouter.get("/data", async (req, res) => {
  try {
    const includeBorrador = req.query.includeBorrador !== "false";
    const forceRefresh = req.query.forceRefresh === "true";
    const spreadsheetId = req.query.spreadsheetId as string | undefined;

    const data = await googleSheetsService.fetchDashboardData(includeBorrador, forceRefresh, spreadsheetId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /status - Estado de la conexión
apiRouter.get("/status", (req, res) => {
  const credsPath = path.resolve(process.cwd(), "service_account.json");
  const hasCreds = fs.existsSync(credsPath);
  res.json({
    success: true,
    spreadsheetId: googleSheetsService.getSpreadsheetId(),
    serviceAccountEmail: googleSheetsService.getServiceAccountEmail(),
    hasServiceAccountFile: hasCreds
  });
});

// POST /spreadsheet - Cambiar URL o ID de Google Sheets dinámicamente
apiRouter.post("/spreadsheet", async (req, res) => {
  try {
    const { urlOrId, includeBorrador } = req.body;
    if (!urlOrId) {
      return res.status(400).json({ success: false, error: "urlOrId es requerido" });
    }

    const currentId = googleSheetsService.setSpreadsheetId(urlOrId);
    const data = await googleSheetsService.fetchDashboardData(includeBorrador !== false, true);

    res.json({
      success: true,
      spreadsheetId: currentId,
      data
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /upload-excel - Cargar archivo Excel descargado directamente de Google Sheets (.xlsx)
apiRouter.post("/upload-excel", (req, res) => {
  try {
    const { fileBase64, fileName, includeBorrador } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ success: false, error: "fileBase64 es requerido" });
    }

    const buffer = Buffer.from(fileBase64, "base64");
    const data = googleSheetsService.processExcelBuffer(buffer, fileName || "hoja_real.xlsx", includeBorrador !== false);

    res.json({
      success: true,
      message: "Archivo Excel procesado con éxito",
      data
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: `Error al procesar Excel: ${error.message}` });
  }
});

// POST /upload-credentials - Subir credenciales service_account.json
apiRouter.post("/upload-credentials", (req, res) => {
  try {
    const { credentialsJson } = req.body;
    if (!credentialsJson) {
      return res.status(400).json({ success: false, error: "Contenido JSON requerido" });
    }

    const parsed = typeof credentialsJson === "string" ? JSON.parse(credentialsJson) : credentialsJson;
    if (!parsed.client_email || !parsed.private_key) {
      return res.status(400).json({ success: false, error: "El JSON no parece una cuenta de servicio de Google válida" });
    }

    const credsPath = path.resolve(process.cwd(), "service_account.json");
    fs.writeFileSync(credsPath, JSON.stringify(parsed, null, 2), "utf-8");
    googleSheetsService.checkServiceAccount();

    res.json({
      success: true,
      message: "Credenciales de Service Account guardadas exitosamente",
      clientEmail: parsed.client_email
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: `JSON inválido: ${error.message}` });
  }
});

// Registrar rutas tanto bajo /api como en la raíz para resiliencia total
app.use("/api", apiRouter);
app.use("/", apiRouter);

export default app;
export { app };
