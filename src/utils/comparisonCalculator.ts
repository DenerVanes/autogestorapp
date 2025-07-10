
import { format, subMonths, startOfDay, endOfDay, subDays } from "date-fns";
import type { Transaction, WorkHoursRecord, Metrics } from "@/types";
import { Lancamento } from "@/lib/types";
import { calculateWorkHoursWithCutoff } from "./workHoursProcessor";

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
  
  // Calcular o período exato correspondente no mês anterior
  // Para cada data do período atual, subtrair exatamente 1 mês
  const previousStart = startOfDay(subMonths(currentStart, 1));
  const previousEnd = endOfDay(subMonths(currentEnd, 1));
  
  return { previousStart, previousEnd, currentStart, currentEnd };
};

export const calculatePreviousMetrics = (
  transactions: Transaction[],
  lancamentos: Lancamento[],
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
  
  // Calculate previous period KM from lancamentos
  const filteredLancamentos = lancamentos.filter(l => {
    if (l.status !== 'completo' || !l.dataLancamento) return false;
    const itemDate = new Date(l.dataLancamento);
    return itemDate >= previousStart && itemDate <= previousEnd;
  });
  
  const kmRodado = filteredLancamentos.reduce((sum, l) => sum + (l.quilometragemPercorrida || 0), 0);
  
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
  console.log("calculatePercentageChange inputs:", { current, previous });
  
  // Se o valor anterior é zero ou muito próximo de zero
  if (Math.abs(previous) < 0.01) {
    if (Math.abs(current) < 0.01) {
      return '0% vs mês anterior';
    }
    return current > 0 ? '+100% vs mês anterior' : 'Sem dados anteriores para comparar';
  }
  
  // Fórmula correta: (valor_atual - valor_anterior) / valor_anterior * 100
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  
  console.log("Percentage change calculation:", { current, previous, change, result: `${sign}${change.toFixed(1)}%` });
  
  return `${sign}${change.toFixed(1)}% vs mês anterior`;
};

// Função para verificar se há dados no período anterior
export const hasPreviousPeriodData = (
  transactions: Transaction[],
  lancamentos: Lancamento[],
  workHours: WorkHoursRecord[],
  period: string,
  customStartDate?: Date,
  customEndDate?: Date
): boolean => {
  const { previousStart, previousEnd } = getPreviousMonthDates(period, customStartDate, customEndDate);
  
  // Verificar se existe pelo menos uma transação no período anterior
  const hasTransactions = transactions.some(t => {
    const itemDate = new Date(t.date);
    return itemDate >= previousStart && itemDate <= previousEnd;
  });
  
  // Verificar se existe pelo menos um lançamento no período anterior
  const hasLancamentos = lancamentos.some(l => {
    if (!l.dataLancamento) return false;
    const itemDate = new Date(l.dataLancamento);
    return itemDate >= previousStart && itemDate <= previousEnd;
  });
  
  // Verificar se existe pelo menos um registro de horas no período anterior
  const hasWorkHours = workHours.some(w => {
    const itemStartDate = new Date(w.startDateTime);
    return itemStartDate >= previousStart && itemStartDate <= previousEnd;
  });
  
  return hasTransactions || hasLancamentos || hasWorkHours;
};

// New function to calculate previous fuel expense
export const calculatePreviousFuelExpense = (
  transactions: Transaction[],
  lancamentos: Lancamento[],
  user: any,
  period: string,
  customStartDate?: Date,
  customEndDate?: Date
): number => {
  if (!user?.vehicleType || !user?.vehicleModel || !user?.fuelConsumption) {
    return 0;
  }

  const { previousStart, previousEnd } = getPreviousMonthDates(period, customStartDate, customEndDate);
  
  // Get km driven in the previous period from lancamentos
  const filteredLancamentos = lancamentos.filter(l => {
    if (l.status !== 'completo' || !l.dataLancamento) return false;
    const itemDate = new Date(l.dataLancamento);
    return itemDate >= previousStart && itemDate <= previousEnd;
  });
  
  const kmDriven = filteredLancamentos.reduce((sum, l) => sum + (l.quilometragemPercorrida || 0), 0);
  
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
  lancamentos: Lancamento[],
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

  const fuelExpense = calculatePreviousFuelExpense(transactions, lancamentos, user, period, customStartDate, customEndDate);
  
  return totalRevenue - fuelExpense;
};
