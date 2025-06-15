
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
        // Esta semana: do domingo atual até hoje (ou sábado se já passou)
        startDate = startOfWeek(now, { weekStartsOn: 0 }); // Domingo = 0
        endDate = endOfWeek(now, { weekStartsOn: 0 }); // Sábado
        break;
      case 'semana-passada':
        // Semana passada: do domingo da semana anterior até sábado da semana anterior
        const lastWeek = subWeeks(now, 1);
        startDate = startOfWeek(lastWeek, { weekStartsOn: 0 }); // Domingo = 0
        endDate = endOfWeek(lastWeek, { weekStartsOn: 0 }); // Sábado
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

  console.log(`Filtro ${period}:`, {
    startDate: format(startDate, 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    endDate: format(endDate, 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    totalItems: items.length
  });

  const filteredItems = items.filter(item => {
    const itemDate = new Date(item.date);
    const isInRange = itemDate >= startDate && itemDate <= endDate;
    return isInRange;
  });

  console.log(`Itens filtrados para ${period}:`, filteredItems.length);
  
  return filteredItems;
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
        // Esta semana: do domingo atual até hoje (ou sábado se já passou)
        startDate = startOfWeek(now, { weekStartsOn: 0 }); // Domingo = 0
        endDate = endOfWeek(now, { weekStartsOn: 0 }); // Sábado
        break;
      case 'semana-passada':
        // Semana passada: do domingo da semana anterior até sábado da semana anterior
        const lastWeek = subWeeks(now, 1);
        startDate = startOfWeek(lastWeek, { weekStartsOn: 0 }); // Domingo = 0
        endDate = endOfWeek(lastWeek, { weekStartsOn: 0 }); // Sábado
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
