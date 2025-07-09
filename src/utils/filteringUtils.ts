
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { OdometerRecord, OdometerRecordFull } from "@/types";

/**
 * Converts UTC date to Brazil timezone (UTC-3)
 */
function convertToBrazilTime(date: Date | string): Date {
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  // Subtrai 3 horas para converter de UTC para horário do Brasil
  const brazilTime = new Date(utcDate.getTime() - (3 * 60 * 60 * 1000));
  return brazilTime;
}

/**
 * Filters odometer records by period using Brazil timezone
 * @param records - Array of odometer records to filter
 * @param period - Period to filter by
 * @param customStartDate - Custom start date for 'personalizado' period
 * @param customEndDate - Custom end date for 'personalizado' period
 * @returns Filtered array of odometer records
 */
export function filterOdometerByPeriod(
  records: OdometerRecordFull[], 
  period: string, 
  customStartDate?: Date, 
  customEndDate?: Date
): OdometerRecordFull[] {
  const now = new Date();
  const brazilNow = convertToBrazilTime(now);
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case "hoje":
      startDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate(), 0, 0, 0, 0);
      endDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate(), 23, 59, 59, 999);
      break;
    case "ontem":
      const ontem = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate() - 1);
      startDate = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 0, 0, 0, 0);
      endDate = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 23, 59, 59, 999);
      break;
    case "esta-semana": {
      const dayOfWeek = brazilNow.getDay() === 0 ? 7 : brazilNow.getDay();
      startDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate() - dayOfWeek + 1, 0, 0, 0, 0);
      endDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate(), 23, 59, 59, 999);
      break;
    }
    case "semana-passada": {
      const dayOfWeek = brazilNow.getDay() === 0 ? 7 : brazilNow.getDay();
      const lastWeekStart = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate() - dayOfWeek - 6, 0, 0, 0, 0);
      const lastWeekEnd = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate() - dayOfWeek, 23, 59, 59, 999);
      startDate = lastWeekStart;
      endDate = lastWeekEnd;
      break;
    }
    case "este-mes":
      startDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case "mes-passado": {
      const firstDayLastMonth = new Date(brazilNow.getFullYear(), brazilNow.getMonth() - 1, 1, 0, 0, 0, 0);
      const lastDayLastMonth = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), 0, 23, 59, 59, 999);
      startDate = firstDayLastMonth;
      endDate = lastDayLastMonth;
      break;
    }
    case "personalizado":
      if (customStartDate && customEndDate) {
        startDate = new Date(customStartDate.getFullYear(), customStartDate.getMonth(), customStartDate.getDate(), 0, 0, 0, 0);
        endDate = new Date(customEndDate.getFullYear(), customEndDate.getMonth(), customEndDate.getDate(), 23, 59, 59, 999);
        break;
      }
      startDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate(), 0, 0, 0, 0);
      endDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate(), 23, 59, 59, 999);
      break;
    default:
      startDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate(), 0, 0, 0, 0);
      endDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate(), 23, 59, 59, 999);
  }

  console.log(`=== FILTRO POR PERÍODO ===`);
  console.log(`Período: ${period}`);
  console.log(`Data início (Brasil): ${format(startDate, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}`);
  console.log(`Data fim (Brasil): ${format(endDate, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}`);
  
  // Filtra registros pelo período - converte a data UTC do registro para horário do Brasil
  const filteredRecords = records.filter(record => {
    const brazilDate = convertToBrazilTime(record.date);
    const isInPeriod = brazilDate >= startDate && brazilDate <= endDate;
    
    console.log(`Registro ${record.id} (${record.type}) - UTC: ${record.date.toISOString()}, Brasil: ${format(brazilDate, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}, no período? ${isInPeriod}`);
    
    return isInPeriod;
  });
  
  console.log(`Registros filtrados: ${filteredRecords.length} de ${records.length}`);
  return filteredRecords;
}
