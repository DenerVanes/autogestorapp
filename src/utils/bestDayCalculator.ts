import { Transaction, WorkHoursRecord, OdometerRecordFull } from "@/types";
import { filterByPeriod } from "@/utils/dateFilters";
import { calculateKmRodado } from "@/utils/kmCalculator";
import { format, parseISO, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DayMetrics {
  dayName: string;
  lucroMedio: number;
  rsPorKmMedio: number;
  rsPorHoraMedio: number;
  diasTrabalhados: number;
  pontuacao: number;
}

export interface BestDayData {
  bestDay: string | null;
  allDays: DayMetrics[];
  hasEnoughData: boolean;
}

/**
 * Calcula o melhor dia da semana para trabalhar baseado nos últimos 3 meses
 */
export function calculateBestDay(
  transactions: Transaction[],
  odometerRecords: OdometerRecordFull[],
  workHours: WorkHoursRecord[]
): BestDayData {
  // Filtrar dados dos últimos 3 meses
  const threeMonthsAgo = subMonths(new Date(), 3);
  
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = t.date instanceof Date ? t.date : new Date(t.date);
    return transactionDate >= threeMonthsAgo;
  });

  const filteredOdometerRecords = odometerRecords.filter(record => {
    const recordDate = record.date instanceof Date ? record.date : new Date(record.date);
    return recordDate >= threeMonthsAgo;
  });

  const filteredWorkHours = workHours.filter(record => {
    const startDate = record.startDateTime instanceof Date ? record.startDateTime : new Date(record.startDateTime);
    return startDate >= threeMonthsAgo;
  });

  // Agrupar dados por dia da semana
  const dayGroups: Record<string, {
    transactions: Transaction[];
    odometerRecords: OdometerRecordFull[];
    workHours: WorkHoursRecord[];
    dates: Set<string>;
  }> = {};

  const dayNames = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

  // Inicializar grupos
  dayNames.forEach(day => {
    dayGroups[day] = {
      transactions: [],
      odometerRecords: [],
      workHours: [],
      dates: new Set()
    };
  });

  // Agrupar transações por dia da semana
  filteredTransactions.forEach(transaction => {
    const date = transaction.date instanceof Date ? transaction.date : new Date(transaction.date);
    const dayOfWeek = date.getDay(); // 0 = domingo, 1 = segunda, etc.
    const dayName = dayNames[dayOfWeek];
    const dateString = format(date, 'yyyy-MM-dd');
    
    dayGroups[dayName].transactions.push(transaction);
    dayGroups[dayName].dates.add(dateString);
  });

  // Agrupar registros de odômetro por dia da semana
  filteredOdometerRecords.forEach(record => {
    const date = record.date instanceof Date ? record.date : new Date(record.date);
    const dayOfWeek = date.getDay();
    const dayName = dayNames[dayOfWeek];
    const dateString = format(date, 'yyyy-MM-dd');
    
    dayGroups[dayName].odometerRecords.push(record);
    dayGroups[dayName].dates.add(dateString);
  });

  // Agrupar horas trabalhadas por dia da semana
  filteredWorkHours.forEach(record => {
    const startDate = record.startDateTime instanceof Date ? record.startDateTime : new Date(record.startDateTime);
    const dayOfWeek = startDate.getDay();
    const dayName = dayNames[dayOfWeek];
    const dateString = format(startDate, 'yyyy-MM-dd');
    
    dayGroups[dayName].workHours.push(record);
    dayGroups[dayName].dates.add(dateString);
  });

  // Calcular métricas para cada dia
  const dayMetrics: DayMetrics[] = dayNames.map(dayName => {
    const group = dayGroups[dayName];
    const diasTrabalhados = group.dates.size;

    // Só considerar dias com pelo menos 3 registros
    if (diasTrabalhados < 3) {
      return {
        dayName,
        lucroMedio: 0,
        rsPorKmMedio: 0,
        rsPorHoraMedio: 0,
        diasTrabalhados,
        pontuacao: 0
      };
    }

    // Calcular receita e despesa
    const receita = group.transactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.value, 0);
    const despesa = group.transactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.value, 0);
    const gastosCombustivel = group.transactions
      .filter(t => t.type === 'despesa' && t.category === 'Combustível')
      .reduce((sum, t) => sum + t.value, 0);
    
    // Calcular lucro médio (receita - gasto combustível)
    const lucroTotal = receita - gastosCombustivel;
    const lucroMedio = diasTrabalhados > 0 ? lucroTotal / diasTrabalhados : 0;

    // Calcular KM rodado
    const kmRodado = calculateKmRodado(group.odometerRecords, 'últimos-3-meses');
    const rsPorKmMedio = kmRodado > 0 ? receita / kmRodado : 0;

    // Calcular horas trabalhadas
    let totalMs = 0;
    group.workHours.forEach(record => {
      if (record.startDateTime && record.endDateTime) {
        const start = record.startDateTime instanceof Date ? record.startDateTime : new Date(record.startDateTime);
        const end = record.endDateTime instanceof Date ? record.endDateTime : new Date(record.endDateTime);
        totalMs += end.getTime() - start.getTime();
      }
    });
    const horasTrabalhadas = totalMs / (1000 * 60 * 60);
    const rsPorHoraMedio = horasTrabalhadas > 0 ? receita / horasTrabalhadas : 0;

    // Calcular pontuação ponderada
    const pontuacao = (lucroMedio * 0.4) + (rsPorKmMedio * 0.3) + (rsPorHoraMedio * 0.3);

    return {
      dayName,
      lucroMedio,
      rsPorKmMedio,
      rsPorHoraMedio,
      diasTrabalhados,
      pontuacao: isNaN(pontuacao) ? 0 : pontuacao
    };
  });

  // Filtrar apenas dias com dados suficientes
  const validDays = dayMetrics.filter(day => day.diasTrabalhados >= 3 && day.pontuacao > 0);
  
  // Ordenar por pontuação
  validDays.sort((a, b) => b.pontuacao - a.pontuacao);

  const hasEnoughData = validDays.length > 0;
  const bestDay = hasEnoughData ? validDays[0].dayName : null;

  return {
    bestDay,
    allDays: dayMetrics,
    hasEnoughData
  };
}

/**
 * Formatar nome do dia para exibição
 */
export function formatDayName(dayName: string): string {
  const dayMap: Record<string, string> = {
    'domingo': 'Domingo',
    'segunda-feira': 'Segunda-feira',
    'terça-feira': 'Terça-feira',
    'quarta-feira': 'Quarta-feira',
    'quinta-feira': 'Quinta-feira',
    'sexta-feira': 'Sexta-feira',
    'sábado': 'Sábado'
  };
  
  return dayMap[dayName] || dayName;
}