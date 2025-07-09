
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Converts UTC date to Brazil timezone (UTC-3)
 * @param date - Date in UTC or date string
 * @returns Date converted to Brazil timezone
 */
export function convertToBrazilTime(date: Date | string): Date {
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  // Subtrai 3 horas para converter de UTC para horário do Brasil (BRT/BRST)
  const brazilTime = new Date(utcDate.getTime() - (3 * 60 * 60 * 1000));
  return brazilTime;
}

/**
 * Gets Brazilian date string in YYYY-MM-DD format
 * @param date - Date in UTC or date string
 * @returns Date string in Brazilian timezone
 */
export function getBrazilDateString(date: Date | string): string {
  const brazilDate = convertToBrazilTime(date);
  return format(brazilDate, 'yyyy-MM-dd');
}
