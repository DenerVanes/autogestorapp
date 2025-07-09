
import { Transaction, WorkHoursRecord, OdometerRecordFull } from '@/types';
import { filterByPeriod } from '@/utils/dateFilters';

interface DayMetrics {
  dayName: string;
  dayNumber: number; // 0-6 (Sunday-Saturday)
  lucroMedio: number;
  rsPorKmMedio: number;
  rsPorHoraMedio: number;
  diasTrabalhados: number;
  pontuacao: number;
}

interface BestDayResult {
  melhorDia: string;
  ranking: DayMetrics[];
  dadosSuficientes: boolean;
}

const DIAS_SEMANA = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

const MIN_DAYS_WORKED = 3;

export function calculateBestDay(
  transactions: Transaction[],
  workHours: WorkHoursRecord[],
  odometerRecords: OdometerRecordFull[]
): BestDayResult {
  // Filtrar dados dos últimos 3 meses
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const filteredTransactions = transactions.filter(t => t.date >= threeMonthsAgo);
  const filteredWorkHours = workHours.filter(w => w.startDateTime >= threeMonthsAgo);
  
  // Agrupar dados por dia da semana
  const dayGroups: { [key: number]: {
    receitas: number[];
    gastosCombustivel: number[];
    horasTrabalhadas: number[];
    kmRodados: number[];
    diasUnicos: Set<string>;
  } } = {};

  // Inicializar grupos para todos os dias da semana
  for (let i = 0; i < 7; i++) {
    dayGroups[i] = {
      receitas: [],
      gastosCombustivel: [],
      horasTrabalhadas: [],
      kmRodados: [],
      diasUnicos: new Set()
    };
  }

  // Processar transações agrupadas por data
  const transactionsByDate = new Map<string, { receita: number; gastos: number }>();
  
  filteredTransactions.forEach(transaction => {
    const dateKey = transaction.date.toISOString().split('T')[0];
    const dayOfWeek = transaction.date.getDay();
    
    if (!transactionsByDate.has(dateKey)) {
      transactionsByDate.set(dateKey, { receita: 0, gastos: 0 });
    }
    
    const dayData = transactionsByDate.get(dateKey)!;
    
    if (transaction.type === 'receita') {
      dayData.receita += transaction.value;
    } else if (transaction.type === 'despesa' && 
               (transaction.category === 'Combustível' || 
                transaction.category === 'Gasolina' || 
                transaction.category === 'Álcool' || 
                transaction.category === 'Diesel')) {
      dayData.gastos += transaction.value;
    }
  });

  // Processar horas trabalhadas por data
  const workHoursByDate = new Map<string, number>();
  
  filteredWorkHours.forEach(workHour => {
    const dateKey = workHour.startDateTime.toISOString().split('T')[0];
    const hoursWorked = (workHour.endDateTime.getTime() - workHour.startDateTime.getTime()) / (1000 * 60 * 60);
    
    workHoursByDate.set(dateKey, (workHoursByDate.get(dateKey) || 0) + hoursWorked);
  });

  // Processar km rodados por data
  const kmByDate = new Map<string, number>();
  
  // Agrupar registros de odômetro por pair_id
  const odometerPairs = new Map<string, { inicial?: OdometerRecordFull; final?: OdometerRecordFull }>();
  
  odometerRecords.forEach(record => {
    if (record.pair_id) {
      if (!odometerPairs.has(record.pair_id)) {
        odometerPairs.set(record.pair_id, {});
      }
      const pair = odometerPairs.get(record.pair_id)!;
      
      if (record.type === 'inicial') {
        pair.inicial = record;
      } else {
        pair.final = record;
      }
    }
  });

  // Calcular km rodados por dia
  odometerPairs.forEach(pair => {
    if (pair.inicial && pair.final) {
      const kmRodados = pair.final.value - pair.inicial.value;
      if (kmRodados > 0) {
        const dateKey = pair.inicial.date.toISOString().split('T')[0];
        kmByDate.set(dateKey, (kmByDate.get(dateKey) || 0) + kmRodados);
      }
    }
  });

  // Consolidar dados por dia da semana
  transactionsByDate.forEach((dayData, dateKey) => {
    const date = new Date(dateKey);
    const dayOfWeek = date.getDay();
    const horasTrabalhadasDia = workHoursByDate.get(dateKey) || 0;
    const kmRodadosDia = kmByDate.get(dateKey) || 0;
    
    if (dayData.receita > 0 && horasTrabalhadasDia > 0) {
      dayGroups[dayOfWeek].receitas.push(dayData.receita);
      dayGroups[dayOfWeek].gastosCombustivel.push(dayData.gastos);
      dayGroups[dayOfWeek].horasTrabalhadas.push(horasTrabalhadasDia);
      dayGroups[dayOfWeek].kmRodados.push(kmRodadosDia);
      dayGroups[dayOfWeek].diasUnicos.add(dateKey);
    }
  });

  // Calcular métricas para cada dia da semana
  const dayMetrics: DayMetrics[] = [];

  for (let dayNum = 0; dayNum < 7; dayNum++) {
    const group = dayGroups[dayNum];
    const diasTrabalhados = group.diasUnicos.size;
    
    if (diasTrabalhados >= MIN_DAYS_WORKED) {
      const receitaTotal = group.receitas.reduce((sum, val) => sum + val, 0);
      const gastosTotal = group.gastosCombustivel.reduce((sum, val) => sum + val, 0);
      const horasTotal = group.horasTrabalhadas.reduce((sum, val) => sum + val, 0);
      const kmTotal = group.kmRodados.reduce((sum, val) => sum + val, 0);
      
      const lucroMedio = (receitaTotal - gastosTotal) / diasTrabalhados;
      const rsPorKmMedio = kmTotal > 0 ? receitaTotal / kmTotal : 0;
      const rsPorHoraMedio = horasTotal > 0 ? receitaTotal / horasTotal : 0;
      
      // Calcular pontuação ponderada
      const pontuacao = (lucroMedio * 0.4) + (rsPorKmMedio * 0.3) + (rsPorHoraMedio * 0.3);
      
      dayMetrics.push({
        dayName: DIAS_SEMANA[dayNum],
        dayNumber: dayNum,
        lucroMedio,
        rsPorKmMedio,
        rsPorHoraMedio,
        diasTrabalhados,
        pontuacao
      });
    }
  }

  // Ordenar por pontuação decrescente
  dayMetrics.sort((a, b) => b.pontuacao - a.pontuacao);

  const dadosSuficientes = dayMetrics.length > 0;
  const melhorDia = dadosSuficientes ? dayMetrics[0].dayName : '';

  return {
    melhorDia,
    ranking: dayMetrics,
    dadosSuficientes
  };
}
