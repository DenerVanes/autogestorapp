
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export const filterByPeriod = <T extends { date: Date }>(items: T[], period: string, customStartDate?: Date, customEndDate?: Date): T[] => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = endOfDay(now);

  if (period === 'personalizado' && customStartDate && customEndDate) {
    startDate = startOfDay(customStartDate);
    endDate = endOfDay(customEndDate);
  } else {
    switch (period) {
      case 'hoje':
        startDate = startOfDay(now);
        break;
      case '7dias':
        startDate = startOfDay(subDays(now, 6));
        break;
      case '30dias':
        startDate = startOfDay(subDays(now, 29));
        break;
      default:
        startDate = startOfDay(now);
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
  let endDate: Date = endOfDay(now);

  if (period === 'personalizado' && customStartDate && customEndDate) {
    startDate = startOfDay(customStartDate);
    endDate = endOfDay(customEndDate);
  } else {
    switch (period) {
      case 'hoje':
        startDate = startOfDay(now);
        break;
      case '7dias':
        startDate = startOfDay(subDays(now, 6));
        break;
      case '30dias':
        startDate = startOfDay(subDays(now, 29));
        break;
      default:
        startDate = startOfDay(now);
    }
  }

  return items.filter(item => {
    const itemStartDate = new Date(item.startDateTime);
    return itemStartDate >= startDate && itemStartDate <= endDate;
  });
};
