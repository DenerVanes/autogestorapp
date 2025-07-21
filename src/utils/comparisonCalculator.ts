import { format, subMonths, startOfDay, endOfDay, subDays } from "date-fns";
import type { Transaction, WorkHoursRecord, Metrics } from "@/types";
import { Lancamento } from "@/lib/types";
import { calculateWorkHoursWithCutoff } from "./workHoursProcessor";
import { agruparCiclosPorPairId } from "./cycleGroupingUtils";
import { filterOdometerByPeriod } from "./filteringUtils";

const getPreviousMonthDates = (period: string, customStartDate?: Date, customEndDate?: Date) => {
  const now = new Date();
  let previousStart: Date;
  let previousEnd: Date;

  if (period === 'este-mes') {
    // Mês anterior completo
    previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { previousStart, previousEnd };
  }

  let currentStart: Date;
  let currentEnd: Date;
  
  if (period === 'personalizado' && customStartDate && customEndDate) {
    currentStart = startOfDay(customStartDate);
    currentEnd = endOfDay(customEndDate);
  } else {
    switch (period) {
      case 'hoje': {
        // Pega apenas o dia atual
        currentStart = startOfDay(now);
        currentEnd = endOfDay(now);
        // O mesmo dia do mês anterior
        const previousMonthDate = subMonths(now, 1);
        const previousStart = startOfDay(previousMonthDate);
        const previousEnd = endOfDay(previousMonthDate);
        return { previousStart, previousEnd };
      }
      case '7dias':
        currentStart = startOfDay(subDays(now, 6));
        currentEnd = endOfDay(now);
        break;
      case '30dias':
        currentStart = startOfDay(subDays(now, 29));
        currentEnd = endOfDay(now);
        break;
      default:
        currentStart = startOfDay(now);
        currentEnd = endOfDay(now);
    }
  }
  // Para outros períodos, mantém o comportamento padrão
  previousStart = startOfDay(subMonths(currentStart, 1));
  previousEnd = endOfDay(subMonths(currentEnd, 1));
  return { previousStart, previousEnd };
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
  if (previous === 0) {
    // Se não houve gasto no mês anterior, +100% vs mês anterior
    return current > 0 ? '+100% vs mês anterior' : 'Sem dados anteriores para comparar';
  }
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}% vs mês anterior`;
};

// New function to calculate previous fuel expense
export const calculatePreviousFuelExpense = (
  transactions: Transaction[],
  odometerRecords: any[], // OdometerRecordFull[]
  user: any,
  period: string,
  customStartDate?: Date,
  customEndDate?: Date
): number => {
  if (!user?.vehicleType || !user?.vehicleModel || !user?.fuelConsumption) {
    return 0;
  }

  const { previousStart, previousEnd } = getPreviousMonthDates(period, customStartDate, customEndDate);

  // Calcular KM rodado do período anterior a partir do odômetro
  let kmDriven = 0;
  if (Array.isArray(odometerRecords)) {
    // Agrupa ciclos completos
    const ciclosCompletos = agruparCiclosPorPairId(odometerRecords);
    // LOG DETALHADO
    console.log('[PREV FUEL DEBUG] odometerRecords:', odometerRecords);
    console.log('[PREV FUEL DEBUG] ciclosCompletos:', ciclosCompletos);
    // Filtra ciclos cujo registro inicial está no período anterior
    const registrosIniciais = ciclosCompletos
      .map(ciclo => ciclo.inicial)
      .filter(inicial => inicial !== undefined) as any[];
    const registrosIniciaisNoPeriodo = registrosIniciais.filter(inicial => {
      const d = new Date(inicial.date);
      return d >= previousStart && d <= previousEnd;
    });
    console.log('[PREV FUEL DEBUG] registrosIniciaisNoPeriodo:', registrosIniciaisNoPeriodo);
    const ciclosNoPeriodo = ciclosCompletos.filter(ciclo => {
      if (!ciclo.inicial) return false;
      return registrosIniciaisNoPeriodo.some(inicial => inicial.id === ciclo.inicial?.id);
    });
    console.log('[PREV FUEL DEBUG] ciclosNoPeriodo:', ciclosNoPeriodo);
    // Soma as distâncias dos ciclos completos no período
    kmDriven = ciclosNoPeriodo.reduce((acc, ciclo) => {
      if (ciclo.inicial && ciclo.final) {
        const distancia = ciclo.final.value - ciclo.inicial.value;
        return distancia > 0 ? acc + distancia : acc;
      }
      return acc;
    }, 0);
  }

  // LOG DE DEPURAÇÃO
  console.log('[PREV FUEL DEBUG] previousStart:', previousStart, '| previousEnd:', previousEnd);
  console.log('[PREV FUEL DEBUG] kmDriven:', kmDriven);

  if (kmDriven === 0) {
    console.log('[PREV FUEL DEBUG] kmDriven é 0, retornando 0');
    return 0;
  }

  const litersConsumed = kmDriven / user.fuelConsumption;

  // Média do valor do litro dos abastecimentos do período anterior
  const fuelTransactions = transactions.filter(t =>
    t.type === 'despesa' &&
    t.category === 'Combustível' &&
    t.pricePerLiter &&
    new Date(t.date) >= previousStart && new Date(t.date) <= previousEnd
  );

  let averagePricePerLiter = 0;
  if (fuelTransactions.length > 0) {
    averagePricePerLiter = fuelTransactions.reduce((sum, t) => sum + (t.pricePerLiter || 0), 0) / fuelTransactions.length;
  } else {
    // Se não houver abastecimento no período anterior, pega o último valor conhecido
    const allFuelTransactions = transactions
      .filter(t => t.type === 'despesa' && t.category === 'Combustível' && t.pricePerLiter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    averagePricePerLiter = allFuelTransactions[0]?.pricePerLiter || 0;
  }

  // LOG DE DEPURAÇÃO
  console.log('[PREV FUEL DEBUG] fuelTransactions:', fuelTransactions);
  console.log('[PREV FUEL DEBUG] averagePricePerLiter:', averagePricePerLiter);
  console.log('[PREV FUEL DEBUG] litersConsumed:', litersConsumed);
  console.log('[PREV FUEL DEBUG] previousFuelExpense:', litersConsumed * averagePricePerLiter);

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

/**
 * Compara o faturamento do dia de referência (ou hoje) com o mesmo dia do mês anterior e retorna a variação percentual customizada.
 * @param dados Array de objetos { data: string, valor: number }
 * @param dataReferencia Data base para comparação (opcional, default: hoje)
 * @returns string com a variação percentual ou mensagem customizada
 */
export function calcularVariacaoFaturamento(dados: { data: string, valor: number }[], dataReferencia?: Date): string {
  const ref = dataReferencia ? new Date(dataReferencia) : new Date();
  const anoAtual = ref.getFullYear();
  const mesAtual = ref.getMonth(); // 0-indexado
  const diaAtual = ref.getDate();

  // Data do mesmo dia do mês anterior
  const dataAnterior = new Date(anoAtual, mesAtual - 1, diaAtual);

  // Verifica se a data existe (ex: 31/06 não existe)
  if (dataAnterior.getMonth() !== ((mesAtual + 11) % 12)) {
    return "Não há dados para o dia correspondente do mês anterior. Comparação indisponível.";
  }

  // Formata as datas para comparar (yyyy-mm-dd)
  const formatar = (d: Date) => d.toISOString().slice(0, 10);
  const dataRefStr = formatar(ref);
  const dataAnteriorStr = formatar(dataAnterior);

  // Permitir valor 0 como válido!
  const valorAtualObj = dados.find(d => d.data === dataRefStr);
  const valorAnteriorObj = dados.find(d => d.data === dataAnteriorStr);
  const valorAtual = valorAtualObj ? valorAtualObj.valor : undefined;
  const valorAnterior = valorAnteriorObj ? valorAnteriorObj.valor : undefined;

  if (valorAtual === undefined || valorAnterior === undefined) {
    return "Faltam dados para realizar a comparação entre os dois meses.";
  }

  // Usar valor absoluto do denominador para saldo e casos negativos
  const variacao = ((valorAtual - valorAnterior) / Math.abs(valorAnterior)) * 100;
  const formatador = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const variacaoFormatada = `${variacao >= 0 ? '+' : ''}${formatador.format(variacao)}% vs mês anterior`;
  return variacaoFormatada;
}
