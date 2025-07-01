import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import type { Transaction } from "@/types";

/**
 * Filtra transações pelo período informado.
 * @param transactions Lista de transações
 * @param period 'hoje' | 'ontem' | 'esta-semana' | 'semana-passada' | 'este-mes' | 'mes-passado' | 'personalizado'
 * @param customStartDate Data inicial personalizada (opcional)
 * @param customEndDate Data final personalizada (opcional)
 */
export function filterByPeriod(
  transactions: Transaction[],
  period: string,
  customStartDate?: Date,
  customEndDate?: Date
): Transaction[] {
  let startDate: Date;
  let endDate: Date;
  const now = new Date();

  switch (period) {
    case "hoje":
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      break;
    case "ontem":
      startDate = startOfDay(subDays(now, 1));
      endDate = endOfDay(subDays(now, 1));
      break;
    case "esta-semana":
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfDay(now);
      break;
    case "semana-passada":
      startDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      endDate = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      break;
    case "este-mes":
      startDate = startOfMonth(now);
      endDate = endOfDay(now);
      break;
    case "mes-passado":
      startDate = startOfMonth(subMonths(now, 1));
      endDate = endOfMonth(subMonths(now, 1));
      break;
    case "personalizado":
      if (customStartDate && customEndDate) {
        startDate = startOfDay(customStartDate);
        endDate = endOfDay(customEndDate);
        break;
      }
      // fallback para hoje se datas não fornecidas
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      break;
    default:
      startDate = startOfDay(now);
      endDate = endOfDay(now);
  }

  return transactions.filter((t) => {
    const tDate = t.date instanceof Date ? t.date : new Date(t.date);
    return tDate >= startDate && tDate <= endDate;
  });
} 