
import type { Transaction, OdometerRecord, WorkHoursRecord, Metrics } from "@/types";
import { filterByPeriod } from "./dateFilters";
import { calculateWorkHoursWithCutoff } from "./workHoursProcessor";
import { calculateKmRodado, calculateKmForAllRecords } from "./kmCalculator";
import { calculatePreviousMetrics, calculatePercentageChange } from "./comparisonCalculator";

export const calculateWorkHours = (workHours: WorkHoursRecord[], period: string, customStartDate?: Date, customEndDate?: Date): number => {
  // Use the new logic with 4 AM cutoff
  return calculateWorkHoursWithCutoff(workHours, period, customStartDate, customEndDate);
};

export const calculateMetrics = (
  transactions: Transaction[],
  odometerRecords: OdometerRecord[],
  workHours: WorkHoursRecord[]
): Metrics => {
  const receita = transactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.value, 0);
  
  const despesa = transactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.value, 0);

  const saldo = receita - despesa;
  
  const kmRodado = calculateKmForAllRecords(odometerRecords);
  
  // Calculate work hours using the new logic
  const horasTrabalhadas = calculateWorkHoursWithCutoff(workHours, 'todos');
  
  const valorPorKm = kmRodado > 0 ? receita / kmRodado : 0;
  const valorPorHora = horasTrabalhadas > 0 ? receita / horasTrabalhadas : 0;

  return { receita, despesa, saldo, kmRodado, valorPorKm, horasTrabalhadas, valorPorHora };
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
  
  // Use the new logic to calculate work hours
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
