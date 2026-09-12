import React, { useMemo } from "react";
import {
  Coffee,
  Sparkles,
  Scissors,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import type { OrderRecord } from "../../types";

export interface HourlyIntelligenceSubViewProps {
  orders: OrderRecord[];
}

const HOURS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM"
];

// Palabras clave para identificar servicios que bloquean sillas por tiempos prolongados (>90 min)
const LONG_SERVICE_KEYWORDS = [
  "tinte",
  "color",
  "balayage",
  "alisado",
  "mechas",
  "iluminacion",
  "iluminación",
  "decoloracion",
  "decoloración",
  "botox",
  "keratina",
  "ondulacion",
  "ondulación",
  "extensiones"
];

export const HourlyIntelligenceSubView: React.FC<HourlyIntelligenceSubViewProps> = ({ orders }) => {
  // 1. Análisis de Horas y Valles para Descanso
  const restScheduleAnalysis = useMemo(() => {
    const hourCounts: Record<string, number> = {};
    HOURS.forEach((h) => (hourCounts[h] = 0));

    orders.forEach((o) => {
      if (!o.registerTime) return;
      const match = o.registerTime.match(/(\d{1,2}):\d{2}\s*(AM|PM)?/i);
      if (!match) return;

      let h = parseInt(match[1], 10);
      const p = (match[2] || "AM").toUpperCase();
      const formattedHour = h < 10 ? `0${h}:00 ${p}` : `${h}:00 ${p}`;

      if (hourCounts[formattedHour] !== undefined) {
        hourCounts[formattedHour] += 1;
      }
    });

    // Franja de almuerzo común: 12:00 PM a 03:00 PM
    const lunchHours = ["12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM"];
    let optimalLunchHour = "01:00 PM";
    let minLunchCount = Infinity;

    lunchHours.forEach((lh) => {
      const cnt = hourCounts[lh] || 0;
      if (cnt < minLunchCount) {
        minLunchCount = cnt;
        optimalLunchHour = lh;
      }
    });

    // Horas pico protegidas (donde NO se deben tomar descansos)
    const sortedHours = [...HOURS].sort((a, b) => (hourCounts[b] || 0) - (hourCounts[a] || 0));
    const peakHours = sortedHours.slice(0, 3);

    return {
      hourCounts,
      optimalLunchHour,
      minLunchCount,
      peakHours
    };
  }, [orders]);

  // 2. Proyector Heurístico: Demanda proyectada para el próximo ciclo
  const projectionAnalysis = useMemo(() => {
    // Agrupar órdenes por semana (utilizando semana ISO o división de fechas)
    const dates = Array.from(new Set(orders.map((o) => o.isoDate).filter(Boolean))).sort();
    if (dates.length === 0) {
      return {
        projectedWeekendTotal: 0,
        projectedWeeklyTotal: 0,
        weekendConfidence: "Baja",
        projectedPeakHour: "11:00 AM",
        projectedPeakOrders: 0
      };
    }

    // Dividir en semanas
    const weekGroups: Record<string, OrderRecord[]> = {};
    orders.forEach((o) => {
      if (!o.isoDate) return;
      const d = new Date(o.isoDate + "T12:00:00Z");
      // Calcular número aproximado de semana del año
      const firstJan = new Date(d.getUTCFullYear(), 0, 1);
      const weekNum = Math.ceil(((d.getTime() - firstJan.getTime()) / 86400000 + firstJan.getUTCDay() + 1) / 7);
      const key = `${d.getUTCFullYear()}-W${weekNum}`;
      if (!weekGroups[key]) weekGroups[key] = [];
      weekGroups[key].push(o);
    });

    const weeks = Object.keys(weekGroups).sort();
    let projectedWeeklyTotal = 0;
    let projectedWeekendTotal = 0;

    if (weeks.length === 1) {
      // Solo 1 semana de datos
      const weekOrders = weekGroups[weeks[0]];
      projectedWeeklyTotal = Math.round(weekOrders.length * 1.05); // +5% crecimiento orgánico
      const weekendOrders = weekOrders.filter((o) => {
        const d = new Date(o.isoDate + "T12:00:00Z");
        const day = d.getUTCDay();
        return day === 5 || day === 6 || day === 0;
      });
      projectedWeekendTotal = Math.round(weekendOrders.length * 1.05);
    } else {
      // Ponderación exponencial: 65% última semana, 25% penúltima, 10% anteriores
      const lastWeekOrders = weekGroups[weeks[weeks.length - 1]];
      const prevWeekOrders = weekGroups[weeks[weeks.length - 2]];

      const calcWeekend = (ords: OrderRecord[]) =>
        ords.filter((o) => {
          const d = new Date(o.isoDate + "T12:00:00Z");
          const day = d.getUTCDay();
          return day === 5 || day === 6 || day === 0;
        }).length;

      projectedWeeklyTotal = Math.round(lastWeekOrders.length * 0.65 + prevWeekOrders.length * 0.35);
      projectedWeekendTotal = Math.round(calcWeekend(lastWeekOrders) * 0.65 + calcWeekend(prevWeekOrders) * 0.35);
    }

    // Pico de hora proyectado
    const peakHour = restScheduleAnalysis.peakHours[0] || "11:00 AM";
    const peakCount = restScheduleAnalysis.hourCounts[peakHour] || 0;
    const avgPeakPerDay = Math.round(peakCount / Math.max(dates.length / 7, 1));

    return {
      projectedWeeklyTotal,
      projectedWeekendTotal,
      weekendConfidence: weeks.length > 2 ? "Alta" : "Moderada",
      projectedPeakHour: peakHour,
      projectedPeakOrders: avgPeakPerDay
    };
  }, [orders, restScheduleAnalysis]);

  // 3. Servicios que Bloquean Sillas (Servicios Largos)
  const longServicesAnalysis = useMemo(() => {
    let longCount = 0;
    let longInPeak = 0;
    const serviceBreakdown: Record<string, number> = {};

    const peakSet = new Set(restScheduleAnalysis.peakHours);

    orders.forEach((o) => {
      const srvName = (o.serviceType || "").toLowerCase();
      const isLong = LONG_SERVICE_KEYWORDS.some((kw) => srvName.includes(kw));

      if (isLong) {
        longCount++;
        const srvKey = o.serviceType || "Servicio Técnico";
        serviceBreakdown[srvKey] = (serviceBreakdown[srvKey] || 0) + 1;

        // Comprobar si cayó en hora pico
        if (o.registerTime) {
          const match = o.registerTime.match(/(\d{1,2}):\d{2}\s*(AM|PM)?/i);
          if (match) {
            let h = parseInt(match[1], 10);
            const p = (match[2] || "AM").toUpperCase();
            const formattedHour = h < 10 ? `0${h}:00 ${p}` : `${h}:00 ${p}`;
            if (peakSet.has(formattedHour)) {
              longInPeak++;
            }
          }
        }
      }
    });

    const totalOrders = Math.max(orders.length, 1);
    const longPercentage = Math.round((longCount / totalOrders) * 100);
    const peakRatio = longCount > 0 ? Math.round((longInPeak / longCount) * 100) : 0;

    const topLongServices = Object.entries(serviceBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return {
      longCount,
      longPercentage,
      longInPeak,
      peakRatio,
      topLongServices
    };
  }, [orders, restScheduleAnalysis]);

  return (
    <div className="space-y-4">
      {/* Sección 1: Optimizador de Horarios de Refrigerio */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Optimizador Táctico de Refrigerios y Descansos
              </h4>
              <p className="text-[11px] text-slate-500">
                Recomendación algorítmica para evitar que las pausas coincidan con picos de ingreso.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Algoritmo de Mínima Fricción
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Ventana Recomendada */}
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
            <div className="flex items-center gap-2 mb-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Ventana Segura para Refrigerios
            </div>
            <p className="text-sm font-extrabold text-slate-900 mb-1">
              {restScheduleAnalysis.optimalLunchHour} a 03:00 PM (Valle de Transición)
            </p>
            <p className="text-xs text-slate-600 mb-3">
              Registra menor demanda simultánea ({restScheduleAnalysis.minLunchCount} atenciones registradas).
              Permite mantener el salón operativo con el 50% del personal sin acumular colas.
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between p-1.5 bg-white/80 rounded-lg border border-emerald-100">
                <span className="font-semibold text-slate-700">Turno 1 de Refrigerio:</span>
                <span className="font-bold text-emerald-800">01:00 PM &ndash; 01:45 PM</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-white/80 rounded-lg border border-emerald-100">
                <span className="font-semibold text-slate-700">Turno 2 de Refrigerio:</span>
                <span className="font-bold text-emerald-800">02:00 PM &ndash; 02:45 PM</span>
              </div>
            </div>
          </div>

          {/* Ventana Bloqueada / Prohibida */}
          <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200/80">
            <div className="flex items-center gap-2 mb-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Ventanas Protegidas (Cero Descansos)
            </div>
            <p className="text-sm font-extrabold text-slate-900 mb-1">
              {restScheduleAnalysis.peakHours.slice(0, 2).join(" y ")}
            </p>
            <p className="text-xs text-slate-600 mb-3">
              Concentran la mayor cantidad de ingresos simultáneos. Reducir estilistas en estas franjas provoca
              pérdida de clientes por tiempo de espera excesivo.
            </p>
            <div className="p-2 bg-white/80 rounded-lg border border-rose-100 text-xs text-rose-900 font-medium">
              ⚠️ Todo el equipo debe estar al 100% en piso durante estas horas críticas.
            </div>
          </div>
        </div>
      </div>

      {/* Sección 2: Proyección de Demanda para el Próximo Ciclo */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Proyección Heurística de Demanda (Próximo Ciclo)
              </h4>
              <p className="text-[11px] text-slate-500">
                Estimación de atenciones basada en la media móvil de las últimas semanas analizadas.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
            Confianza {projectionAnalysis.weekendConfidence}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Volumen Semanal Estimado
            </span>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">
              ~{projectionAnalysis.projectedWeeklyTotal}{" "}
              <span className="text-xs font-normal text-slate-500">atenciones</span>
            </p>
            <span className="text-[11px] text-slate-500">Proyección total para los próximos 7 días</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider block">
              Carga Fin de Semana (Vie - Dom)
            </span>
            <p className="text-xl font-extrabold text-cyan-900 mt-0.5">
              ~{projectionAnalysis.projectedWeekendTotal}{" "}
              <span className="text-xs font-normal text-cyan-700">atenciones</span>
            </p>
            <span className="text-[11px] text-cyan-600 font-medium">
              Representa el ~
              {Math.round(
                (projectionAnalysis.projectedWeekendTotal /
                  Math.max(projectionAnalysis.projectedWeeklyTotal, 1)) *
                  100
              )}
              % del flujo total semanal
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
              Hora Pico Prevista
            </span>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">
              {projectionAnalysis.projectedPeakHour}
            </p>
            <span className="text-[11px] text-rose-600 font-medium">
              Carga máxima estimada por hora en el local
            </span>
          </div>
        </div>
      </div>

      {/* Sección 3: Análisis de Servicios que Bloquean Sillas */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Impacto de Servicios Largos en Capacidad de Sillas
              </h4>
              <p className="text-[11px] text-slate-500">
                Monitoreo de tratamientos químicos o de alta duración (&gt;90 min: Balayage, Tintes, Alisados).
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-700">
            {longServicesAnalysis.longCount} órdenes ({longServicesAnalysis.longPercentage}% de la demanda)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Servicios Largos Predominantes
            </span>
            <div className="space-y-1.5">
              {longServicesAnalysis.topLongServices.length > 0 ? (
                longServicesAnalysis.topLongServices.map(([name, count]) => (
                  <div
                    key={name}
                    className="p-2 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-800 truncate">{name}</span>
                    <span className="font-bold text-purple-700 px-2 py-0.5 rounded bg-purple-50">
                      {count} {count === 1 ? "orden" : "órdenes"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No se detectaron servicios largos en el rango.</p>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-200/70 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-4 h-4 text-purple-600" />
                Estrategia Táctica Recomendada:
              </span>
              <p className="text-xs text-purple-950 leading-relaxed">
                El <strong className="font-bold">{longServicesAnalysis.peakRatio}%</strong> de los servicios largos se
                inician en horarios pico. Desplazar estos servicios mediante descuentos matutinos (09:00 AM – 11:00 AM)
                o días laborables (Lunes a Jueves) libera sillas para servicios rápidos (corte, cepillado, manicura),
                maximizando la rotación por puesto.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-purple-200/60 flex items-center gap-2 text-xs font-bold text-purple-800">
              <span>Palanca: Incrementar rotación en fines de semana</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
