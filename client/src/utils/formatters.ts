const SPANISH_MONTHS_SHORT = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Set", "Oct", "Nov", "Dic"
];

/**
 * Formatea cualquier fecha (ISO YYYY-MM-DD, Date string largo, timestamp) a formato limpio en español: "04 Set 2026"
 */
export function formatDisplayDate(rawDate?: string, isoDate?: string): string {
  // 1. Prioridad: ISO YYYY-MM-DD directo
  const targetIso = isoDate && /^\d{4}-\d{2}-\d{2}$/.test(isoDate) ? isoDate : undefined;
  if (targetIso) {
    const [year, mStr, dStr] = targetIso.split("-");
    const mIdx = parseInt(mStr, 10) - 1;
    const mName = SPANISH_MONTHS_SHORT[mIdx] || mStr;
    return `${dStr} ${mName} ${year}`;
  }

  if (!rawDate) return "--";

  const str = rawDate.trim();

  // 2. Si ya es ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, mStr, dStr] = str.split("-");
    const mIdx = parseInt(mStr, 10) - 1;
    const mName = SPANISH_MONTHS_SHORT[mIdx] || mStr;
    return `${dStr} ${mName} ${year}`;
  }

  // 3. Si ya es una fecha limpia como "04 Set 2026" o "04 Sep 2026"
  if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(str)) {
    return str;
  }

  // 4. Si es formato DD/MM/YYYY o DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const mIdx = parseInt(dmyMatch[2], 10) - 1;
    let year = dmyMatch[3];
    if (year.length === 2) year = `20${year}`;
    const mName = SPANISH_MONTHS_SHORT[mIdx] || dmyMatch[2];
    return `${day} ${mName} ${year}`;
  }

  // 5. Si contiene "GMT" o cadena serializada de Date JavaScript
  if (str.includes("GMT") || str.includes("hora estándar") || str.length > 20) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const mName = SPANISH_MONTHS_SHORT[d.getMonth()] || "";
      return `${day} ${mName} ${d.getFullYear()}`;
    }
  }

  return str;
}
