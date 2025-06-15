
import { format, subMonths, startOfDay, endOfDay, subDays } from "date-fns";
import type { Transaction, OdometerRecord, WorkHoursRecord, Metrics } from "@/types";
import { calculateWorkHoursWithCutoff } from "./workHoursProcessor";
import { calculateKmForAllRecords, calculateKmRodado } from "./kmCalculator";

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

export const calculatePreviousMetrics = (
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
  
  const kmRodado = calculateKmForAllRecords(filteredOdometer);
  
  // Calculate previous period work hours using the new logic
  const filteredWorkHours = workHours.filter(w => {
    const itemStartDate = new Date(w.startDateTime);
    return itemStartDate >= previousStart && itemStartDate <= previousEnd;
  });
  
  const horasTrabalhadas = calculateWorkHoursWithCutoff(filteredWorkHours, 'personalizado', previousStart, previousEnd);
  
  const valorPorKm = kmRodado > 0 ? receita / kmRodado : 0;
  const valorPorHora = horasTrabalhadas > 0 ? receita / horasTrabalhadas : 0;

  return { receita, despesa, saldo, kmRodado, valorPorKm, horasTrabalhadas, valorPorHora };
};

export const calculatePercentageChange = (current: number, previous: number): string => {
  if (previous === 0) {
    return current > 0 ? '+100%' : 'Sem dados anteriores para comparar';
  }
  
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
};

// New function to calculate previous fuel expense
export const calculatePreviousFuelExpense = (
  transactions: Transaction[],
  odometerRecords: OdometerRecord[],
  user: any,
  period: string,
  customStartDate?: Date,
  customEndDate?: Date
): number => {
  if (!user?.vehicleType || !user?.vehicleModel || !user?.fuelConsumption) {
    return 0;
  }

  const { previousStart, previousEnd } = getPreviousMonthDates(period, customStartDate, customEndDate);
  
  // Get km driven in the previous period
  const filteredOdometer = odometerRecords.filter(o => {
    const itemDate = new Date(o.date);
    return itemDate >= previousStart && itemDate <= previousEnd;
  });
  
  const kmDriven = calculateKmForAllRecords(filteredOdometer);
  
  if (kmDriven === 0) {
    return 0;
  }

  // Calculate liters consumed
  const litersConsumed = kmDriven / user.fuelConsumption;

  // Get average fuel price from last 7 days
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentFuelTransactions = transactions.filter(t => 
    t.type === 'despesa' && 
    t.fuelType && 
    t.pricePerLiter && 
    t.date >= sevenDaysAgo
  );

  if (recentFuelTransactions.length === 0) {
    return 0;
  }

  const averagePricePerLiter = recentFuelTransactions.reduce((sum, t) => sum + (t.pricePerLiter || 0), 0) / recentFuelTransactions.length;
  
  return litersConsumed * averagePricePerLiter;
};

// New function to calculate previous profit
export const calculatePreviousProfit = (
  transactions: Transaction[],
  odometerRecords: OdometerRecord[],
  user: any,
  period: string,
  customStartDate?: Date,
  customEndDate?: Date
): number => {
  const { previousStart, previousEnd } = getPreviousMonthDates(period, customStartDate, customEndDate);
  
  const filteredTransactions = transactions.filter(t => {
    const itemDate = new Date(t.date);
    return itemDate >= previousStart && itemDate <= previousEnd;
  });
  
  const totalRevenue = filteredTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.value, 0);

  const fuelExpense = calculatePreviousFuelExpense(transactions, odometerRecords, user, period, customStartDate, customEndDate);
  
  return totalRevenue - fuelExpense;
};
