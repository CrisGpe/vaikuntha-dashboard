# Dashboard Comercial & Gestión del Cambio - SaS Vaikuntha

Aplicación web analítica local diseñada para reuniones individuales y grupales de gestión del cambio hacia **SaS Vaikuntha**. Se conecta a hojas de Google Sheets (`OATC`, `Borrador`, `Asistencia`, `Clientes`, `Agentes`) mediante **Google Sheets API v4 (Service Account)**, con selector dinámico para cambiar de hoja en caliente y modo offline con datos estructurados.

---

## 🚀 Inicio Rápido en tu Laptop

### Opción 1: Ejecutar con el archivo por lotes
Haz doble clic en `start.bat` en la raíz del proyecto. Iniciará tanto el backend como el frontend y abrirá tu navegador automáticamente en:
`http://localhost:5173`

### Opción 2: Desde terminal PowerShell
```powershell
# En una terminal para el backend:
cd server
npm run start

# En otra terminal para el frontend:
cd client
npm run dev
```

---

## 📊 Módulos y Secciones del Dashboard

1. **Demanda de Servicios (`OATC` + `Borrador`)**:
   - Desglose por Tipo de OATC (Tratamientos Capilares, Cosmiatría, Color, Corte, Alisados, POLYGEL, Manos y pies, Maquillaje, etc.).
   - Curva de demanda horaria para detectar horarios punta y planificar refuerzos.
   - Distribución por modalidad de ingreso (Cita, turno, Asesoría, TurnoNiño, etc.).

2. **Órdenes & Asistencia**:
   - Tasa de cumplimiento vs cancelaciones y motivos registrados en Observaciones.
   - Cruce directo con la hoja `Asistencia` (Entrada, Ref I, Ref T, Salida, Horas trabajadas, órdenes/hora).
   - Tabla interactiva con buscador rápido por cliente, DNI, celular o tipo de servicio.

3. **Clientes & Fidelidad**:
   - Directorio de clientes con extracción inteligente de DNIs y teléfonos a partir de formatos heterogéneos.
   - Ranking de recurrencia y clientes VIP.
   - Botón directo para iniciar chat de **WhatsApp** con el cliente con un clic (`https://wa.me/...`).

4. **Ficha de Entrevista 1-a-1 (Gestión del Cambio)**:
   - Resumen individual por colaborador (servicios estrella, clientes que más lo buscan, volumen operativo).
   - Los 4 beneficios clave de SaS Vaikuntha para el colaborador (agenda en el móvil, recordatorios por WhatsApp, historial de fórmulas, transparencia de comisiones).
   - Bloque de acuerdos y notas de entrevista que se guardan en la laptop.
   - Botón **"Imprimir / PDF"** optimizado con diseño ejecutivo y sección de firmas para la reunión.

---

## 🔑 Conexión a Google Sheets (Google Drive)

1. En la aplicación, haz clic en el ícono de tuerca (**Configuración**).
2. Puedes pegar cualquier URL de Google Sheets de tu Drive, por ejemplo:
   `https://docs.google.com/spreadsheets/d/1SXuedQigLxVUF2oxn65wEZ5-HnDDiVdy7lY7HaweVC4/edit`
3. Copia el correo de la cuenta de servicio mostrado en la ventana.
4. En tu Google Sheet, haz clic en el botón verde **Compartir** y agrega ese correo como **Lector**.
5. ¡Listo! Los datos se cargarán en vivo. Si aún no agregas credenciales, la app corre de forma inmediata en **Modo Demostración** con el esquema exacto de tus hojas.
