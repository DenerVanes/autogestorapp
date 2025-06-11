
import { format } from "date-fns";
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

export const getMetrics = (
  transactions: Transaction[],
  odometerRecords: OdometerRecord[],
  workHours: WorkHoursRecord[],
  period: string,
  customStartDate?: Date,
  customEndDate?: Date
): Metrics => {
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

  return { receita, despesa, saldo, kmRodado, valorPorKm, horasTrabalhadas, valorPorHora };
};

export const getChartData = (transactions: Transaction[], period: string, customStartDate?: Date, customEndDate?: Date): ChartData[] => {
  const filteredTransactions = filterByPeriod(transactions, period, customStartDate, customEndDate);
  
  // Group transactions by date
  const dataMap = new Map<string, { receita: number; despesa: number }>();
  
  filteredTransactions.forEach(transaction => {
    const dateKey = format(transaction.date, 'yyyy-MM-dd');
    const existing = dataMap.get(dateKey) || { receita: 0, despesa: 0 };
    
    if (transaction.type === 'receita') {
      existing.receita += transaction.value;
    } else {
      existing.despesa += transaction.value;
    }
    
    dataMap.set(dateKey, existing);
  });

  // Convert to array and sort by date
  return Array.from(dataMap.entries())
    .map(([date, values]) => ({
      date,
      ...values
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};
