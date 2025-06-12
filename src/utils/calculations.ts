
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, parseISO, subMonths, addDays, startOfWeek, endOfWeek } from "date-fns";
import type { Transaction, OdometerRecord, WorkHoursRecord, Metrics, ChartData } from "@/types";
import { filterByPeriod, filterWorkHoursByPeriod } from "./dateFilters";

export const calculateWorkHours = (workHours: WorkHoursRecord[], period: string, customStartDate?: Date, customEndDate?: Date): number => {
  const filteredWorkHours = filterWorkHoursByPeriod(workHours, period, customStartDate, customEndDate);
  
  return filteredWorkHours.reduce((total, record) => {
    const diff = record.endDateTime.getTime() - record.startDateTime.getTime();
    return total + (diff / (1000 * 60 * 60)); // Convert to hours
  }, 0);
};

export const calculateKmRodado = (odometerRecords: OdometerRecord[], period: string, customStartDate?: Date, customEndDate?: Date): number => {
  const filteredOdometer = filterByPeriod(odometerRecords, period, customStartDate, customEndDate);
  
  // Group odometer records by date and calculate daily KM
  const kmByDate = new Map<string, { inicial?: number; final?: number }>();
  
  filteredOdometer.forEach(record => {
    const dateKey = format(record.date, 'yyyy-MM-dd');
    const existing = kmByDate.get(dateKey) || {};
    
    if (record.type === 'inicial') {
      existing.inicial = record.value;
    } else if (record.type === 'final') {
      existing.final = record.value;
    }
    
    kmByDate.set(dateKey, existing);
  });
  
  // Calculate total KM for the period
  return Array.from(kmByDate.values()).reduce((total, day) => {
    if (day.inicial !== undefined && day.final !== undefined) {
      return total + (day.final - day.inicial);
    }
    return total;
  }, 0);
};

// Calculate metrics for the same day of the previous month for comparison
const getPreviousMonthDates = (period: string, customStartDate?: Date, customEndDate?: Date) => {
  const now = new Date();
  let currentStart: Date;
  let currentEnd: Date;
  
  if (period === 'personalizado' && customStartDate && customEndDate) {
    currentStart = startOfDay(customStartDate);
    currentEnd = endOfDay(customEndDate);
  } else {
    currentEnd = endOfDay(now);
    switch (period) {
      case 'hoje':
        currentStart = startOfDay(now);
        break;
      case '7dias':
        currentStart = startOfDay(subDays(now, 6));
        break;
      case '30dias':
        currentStart = startOfDay(subDays(now, 29));
        break;
      default:
        currentStart = startOfDay(now);
    }
  }
  
  // Calculate the same period in the previous month
  const previousStart = startOfDay(subMonths(currentStart, 1));
  const previousEnd = endOfDay(subMonths(currentEnd, 1));
  
  return { previousStart, previousEnd };
};

const calculatePreviousMetrics = (
  transactions: Transaction[],
  odometerRecords: OdometerRecord[],
  workHours: WorkHoursRecord[],
  period: string,
  customStartDate?: Date,
  customEndDate?: Date
): Metrics => {
  const { previousStart, previousEnd } = getPreviousMonthDates(period, customStartDate, customEndDate);
  
  const filteredTransactions = transactions.filter(t => {
    const itemDate = new Date(t.date);
    return itemDate >= previousStart && itemDate <= previousEnd;
  });
  
  const receita = filteredTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.value, 0);
  
  const despesa = filteredTransactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.value, 0);

  const saldo = receita - despesa;
  
  // Calculate previous period KM
  const filteredOdometer = odometerRecords.filter(o => {
    const itemDate = new Date(o.date);
    return itemDate >= previousStart && itemDate <= previousEnd;
  });
  
  const kmByDate = new Map<string, { inicial?: number; final?: number }>();
  filteredOdometer.forEach(record => {
    const dateKey = format(record.date, 'yyyy-MM-dd');
    const existing = kmByDate.get(dateKey) || {};
    
    if (record.type === 'inicial') {
      existing.inicial = record.value;
    } else if (record.type === 'final') {
      existing.final = record.value;
    }
    
    kmByDate.set(dateKey, existing);
  });
  
  const kmRodado = Array.from(kmByDate.values()).reduce((total, day) => {
    if (day.inicial !== undefined && day.final !== undefined) {
      return total + (day.final - day.inicial);
    }
    return total;
  }, 0);
  
  // Calculate previous period work hours
  const filteredWorkHours = workHours.filter(w => {
    const itemStartDate = new Date(w.startDateTime);
    return itemStartDate >= previousStart && itemStartDate <= previousEnd;
  });
  
  const horasTrabalhadas = filteredWorkHours.reduce((total, record) => {
    const diff = record.endDateTime.getTime() - record.startDateTime.getTime();
    return total + (diff / (1000 * 60 * 60));
  }, 0);
  
  const valorPorKm = kmRodado > 0 ? receita / kmRodado : 0;
  const valorPorHora = horasTrabalhadas > 0 ? receita / horasTrabalhadas : 0;

  return { receita, despesa, saldo, kmRodado, valorPorKm, horasTrabalhadas, valorPorHora };
};

const calculatePercentageChange = (current: number, previous: number): string => {
  if (previous === 0) {
    return current > 0 ? '+100%' : 'Sem dados anteriores para comparar';
  }
  
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
};

export const getMetrics = (
  transactions: Transaction[],
  odometerRecords: OdometerRecord[],
  workHours: WorkHoursRecord[],
  period: string,
  customStartDate?: Date,
  customEndDate?: Date
): Metrics & { changes: Record<string, string> } => {
  const filteredTransactions = filterByPeriod(transactions, period, customStartDate, customEndDate);
  
  const receita = filteredTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.value, 0);
  
  const despesa = filteredTransactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.value, 0);

  const saldo = receita - despesa;
  const kmRodado = calculateKmRodado(odometerRecords, period, customStartDate, customEndDate);
  const valorPorKm = kmRodado > 0 ? receita / kmRodado : 0;
  const horasTrabalhadas = calculateWorkHours(workHours, period, customStartDate, customEndDate);
  const valorPorHora = horasTrabalhadas > 0 ? receita / horasTrabalhadas : 0;

  // Calculate previous month metrics for comparison
  const previousMetrics = calculatePreviousMetrics(transactions, odometerRecords, workHours, period, customStartDate, customEndDate);
  
  const changes = {
    receita: calculatePercentageChange(receita, previousMetrics.receita),
    despesa: calculatePercentageChange(despesa, previousMetrics.despesa),
    saldo: calculatePercentageChange(saldo, previousMetrics.saldo),
    kmRodado: calculatePercentageChange(kmRodado, previousMetrics.kmRodado),
    valorPorKm: calculatePercentageChange(valorPorKm, previousMetrics.valorPorKm),
    valorPorHora: calculatePercentageChange(valorPorHora, previousMetrics.valorPorHora)
  };

  return { receita, despesa, saldo, kmRodado, valorPorKm, horasTrabalhadas, valorPorHora, changes };
};

export const getChartData = (transactions: Transaction[], period: string, customStartDate?: Date, customEndDate?: Date): ChartData[] => {
  // Always show a week view (7 days) for better readability
  const now = new Date();
  
  // Determine the base week to show
  let referenceDate: Date;
  if (period === 'personalizado' && customStartDate) {
    referenceDate = customStartDate;
  } else if (period === 'hoje') {
    referenceDate = now;
  } else {
    // For 7dias and 30dias, show the current week
    referenceDate = now;
  }
  
  // Get the week containing the reference date
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 0 }); // Sunday = 0
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 0 });
  
  // Create array of all days in the week
  const allDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Filter transactions to include only those in the selected period
  const filteredTransactions = filterByPeriod(transactions, period, customStartDate, customEndDate);
  
  // Group transactions by date
  const dataMap = new Map<string, { receita: number; despesa: number }>();
  
  // Initialize all days in the week with zero values
  allDays.forEach(day => {
    const dateKey = format(day, 'yyyy-MM-dd');
    dataMap.set(dateKey, { receita: 0, despesa: 0 });
  });
  
  // Add transaction data only for dates within the filtered period
  filteredTransactions.forEach(transaction => {
    const dateKey = format(transaction.date, 'yyyy-MM-dd');
    const existing = dataMap.get(dateKey);
    
    if (existing) { // Only add if the date is in our week
      if (transaction.type === 'receita') {
        existing.receita += transaction.value;
      } else {
        existing.despesa += transaction.value;
      }
    }
  });

  // Convert to array and sort by date
  return Array.from(dataMap.entries())
    .map(([date, values]) => ({
      date,
      ...values
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};
