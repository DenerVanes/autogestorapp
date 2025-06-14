
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export const filterByPeriod = <T extends { date: Date }>(items: T[], period: string, customStartDate?: Date, customEndDate?: Date): T[] => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  if (period === 'personalizado' && customStartDate && customEndDate) {
    startDate = startOfDay(customStartDate);
    endDate = endOfDay(customEndDate);
  } else {
    switch (period) {
      case 'hoje':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'ontem':
        const yesterday = subDays(now, 1);
        startDate = startOfDay(yesterday);
        endDate = endOfDay(yesterday);
        break;
      case 'esta-semana':
        startDate = startOfWeek(now, { weekStartsOn: 0, locale: ptBR }); // Domingo
        endDate = endOfWeek(now, { weekStartsOn: 0, locale: ptBR }); // Sábado
        break;
      case 'semana-passada':
        const lastWeek = subWeeks(now, 1);
        startDate = startOfWeek(lastWeek, { weekStartsOn: 0, locale: ptBR });
        endDate = endOfWeek(lastWeek, { weekStartsOn: 0, locale: ptBR });
        break;
      case 'este-mes':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'mes-passado':
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      default:
        startDate = startOfDay(now);
        endDate = endOfDay(now);
    }
  }

  return items.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
};

export const filterWorkHoursByPeriod = (items: { startDateTime: Date; endDateTime: Date }[], period: string, customStartDate?: Date, customEndDate?: Date) => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  if (period === 'personalizado' && customStartDate && customEndDate) {
    startDate = startOfDay(customStartDate);
    endDate = endOfDay(customEndDate);
  } else {
    switch (period) {
      case 'hoje':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'ontem':
        const yesterday = subDays(now, 1);
        startDate = startOfDay(yesterday);
        endDate = endOfDay(yesterday);
        break;
      case 'esta-semana':
        startDate = startOfWeek(now, { weekStartsOn: 0, locale: ptBR });
        endDate = endOfWeek(now, { weekStartsOn: 0, locale: ptBR });
        break;
      case 'semana-passada':
        const lastWeek = subWeeks(now, 1);
        startDate = startOfWeek(lastWeek, { weekStartsOn: 0, locale: ptBR });
        endDate = endOfWeek(lastWeek, { weekStartsOn: 0, locale: ptBR });
        break;
      case 'este-mes':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'mes-passado':
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      default:
        startDate = startOfDay(now);
        endDate = endOfDay(now);
    }
  }

  return items.filter(item => {
    const itemStartDate = new Date(item.startDateTime);
    return itemStartDate >= startDate && itemStartDate <= endDate;
  });
};
