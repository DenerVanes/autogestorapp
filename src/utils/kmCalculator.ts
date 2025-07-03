
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { OdometerRecord } from "@/types";

// Função para converter data UTC para horário do Brasil
function convertToBrazilTime(date: Date | string): Date {
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  // Adiciona 3 horas para converter de UTC para horário do Brasil (BRT/BRST)
  const brazilTime = new Date(utcDate.getTime() - (3 * 60 * 60 * 1000));
  return brazilTime;
}

// Função para obter a data no formato brasileiro (DD/MM/YYYY)
function getBrazilDateString(date: Date | string): string {
  const brazilDate = convertToBrazilTime(date);
  return format(brazilDate, 'yyyy-MM-dd');
}

// Função para agrupar registros por ciclos usando pair_id
function agruparCiclosPorPairId(records: OdometerRecord[]) {
  console.log('=== AGRUPANDO CICLOS POR PAIR_ID ===');
  console.log('Total de registros recebidos:', records.length);
  
  // Log detalhado dos registros
  records.forEach((record, index) => {
    const brazilDate = convertToBrazilTime(record.date);
    console.log(`Registro ${index + 1}:`, {
      id: record.id,
      type: record.type,
      value: record.value,
      pair_id: record.pair_id,
      date_utc: record.date,
      date_brazil: format(brazilDate, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })
    });
  });
  
  const pares: Record<string, { inicial?: OdometerRecord, final?: OdometerRecord }> = {};
  
  records.forEach(record => {
    // Usa pair_id se existir, senão usa o próprio id como fallback
    const pairId = record.pair_id || record.id;
    console.log(`Processando registro ${record.id}, type: ${record.type}, pair_id: ${pairId}, value: ${record.value}`);
    
    if (!pares[pairId]) {
      pares[pairId] = {};
    }
    
    if (record.type === 'inicial') {
      pares[pairId].inicial = record;
      console.log(`Registro inicial adicionado para pair_id ${pairId}:`, record.value);
    } else if (record.type === 'final') {
      pares[pairId].final = record;
      console.log(`Registro final adicionado para pair_id ${pairId}:`, record.value);
    }
  });
  
  // Filtra apenas os pares que têm tanto inicial quanto final
  const ciclosCompletos = Object.entries(pares)
    .filter(([pairId, par]) => {
      const hasInitial = !!par.inicial;
      const hasFinal = !!par.final;
      const isComplete = hasInitial && hasFinal;
      
      console.log(`Pair ID ${pairId}: inicial=${hasInitial}, final=${hasFinal}, completo=${isComplete}`);
      
      if (isComplete && par.inicial && par.final) {
        const distancia = par.final.value - par.inicial.value;
        const dataInicial = getBrazilDateString(par.inicial.date);
        console.log(`Ciclo completo - Data: ${dataInicial}, Distância: ${distancia}km (${par.inicial.value} -> ${par.final.value})`);
      }
      
      return isComplete;
    })
    .map(([pairId, par]) => par);
  
  console.log(`=== RESULTADO DO AGRUPAMENTO ===`);
  console.log(`Total de pares criados: ${Object.keys(pares).length}`);
  console.log(`Ciclos completos encontrados: ${ciclosCompletos.length}`);
  
  return ciclosCompletos;
}

// Função para filtrar registros por período usando horário do Brasil
function filterOdometerByPeriod(records: OdometerRecord[], period: string, customStartDate?: Date, customEndDate?: Date): OdometerRecord[] {
  const now = new Date();
  const brazilNow = convertToBrazilTime(now);
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case "hoje":
      startDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate(), 0, 0, 0, 0);
      endDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate(), 23, 59, 59, 999);
      break;
    case "ontem":
      const ontem = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate() - 1);
      startDate = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 0, 0, 0, 0);
      endDate = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 23, 59, 59, 999);
      break;
    case "esta-semana": {
      const dayOfWeek = brazilNow.getDay() === 0 ? 7 : brazilNow.getDay();
      startDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate() - dayOfWeek + 1, 0, 0, 0, 0);
      endDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate(), 23, 59, 59, 999);
      break;
    }
    case "semana-passada": {
      const dayOfWeek = brazilNow.getDay() === 0 ? 7 : brazilNow.getDay();
      const lastWeekStart = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate() - dayOfWeek - 6, 0, 0, 0, 0);
      const lastWeekEnd = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate() - dayOfWeek, 23, 59, 59, 999);
      startDate = lastWeekStart;
      endDate = lastWeekEnd;
      break;
    }
    case "este-mes":
      startDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case "mes-passado": {
      const firstDayLastMonth = new Date(brazilNow.getFullYear(), brazilNow.getMonth() - 1, 1, 0, 0, 0, 0);
      const lastDayLastMonth = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), 0, 23, 59, 59, 999);
      startDate = firstDayLastMonth;
      endDate = lastDayLastMonth;
      break;
    }
    case "personalizado":
      if (customStartDate && customEndDate) {
        startDate = new Date(customStartDate.getFullYear(), customStartDate.getMonth(), customStartDate.getDate(), 0, 0, 0, 0);
        endDate = new Date(customEndDate.getFullYear(), customEndDate.getMonth(), customEndDate.getDate(), 23, 59, 59, 999);
        break;
      }
      startDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate(), 0, 0, 0, 0);
      endDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate(), 23, 59, 59, 999);
      break;
    default:
      startDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate(), 0, 0, 0, 0);
      endDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate(), 23, 59, 59, 999);
  }

  console.log(`=== FILTRO POR PERÍODO ===`);
  console.log(`Período: ${period}`);
  console.log(`Data início: ${format(startDate, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}`);
  console.log(`Data fim: ${format(endDate, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}`);
  
  // Filtra registros pelo período - considera a data do registro inicial convertida para horário do Brasil
  const filteredRecords = records.filter(record => {
    const brazilDate = convertToBrazilTime(record.date);
    const isInPeriod = brazilDate >= startDate && brazilDate <= endDate;
    
    if (record.type === 'inicial') {
      console.log(`Registro inicial ${record.id} em ${format(brazilDate, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })} está no período? ${isInPeriod}`);
    }
    
    return isInPeriod;
  });
  
  console.log(`Registros filtrados: ${filteredRecords.length} de ${records.length}`);
  return filteredRecords;
}

export const calculateKmRodado = (odometerRecords: OdometerRecord[], period: string, customStartDate?: Date, customEndDate?: Date): number => {
  console.log('=== INÍCIO CÁLCULO KM RODADO ===');
  console.log('Parâmetros:', { period, totalRecords: odometerRecords.length });
  
  if (!odometerRecords || odometerRecords.length === 0) {
    console.log('Nenhum registro de odômetro encontrado');
    return 0;
  }
  
  // Primeiro agrupa todos os ciclos por pair_id
  const ciclosCompletos = agruparCiclosPorPairId(odometerRecords);
  console.log('Ciclos completos encontrados:', ciclosCompletos.length);
  
  if (ciclosCompletos.length === 0) {
    console.log('Nenhum ciclo completo encontrado');
    return 0;
  }
  
  // Depois filtra os ciclos que estão no período solicitado
  // Para isso, vamos criar um array com apenas os registros iniciais dos ciclos completos
  const registrosIniciais = ciclosCompletos
    .map(ciclo => ciclo.inicial)
    .filter(inicial => inicial !== undefined) as OdometerRecord[];
  
  const registrosIniciaisNoPeriodo = filterOdometerByPeriod(registrosIniciais, period, customStartDate, customEndDate);
  
  // Agora pegamos apenas os ciclos cujo registro inicial está no período
  const ciclosNoPeriodo = ciclosCompletos.filter(ciclo => {
    if (!ciclo.inicial) return false;
    return registrosIniciaisNoPeriodo.some(inicial => inicial.id === ciclo.inicial?.id);
  });
  
  console.log(`Ciclos no período: ${ciclosNoPeriodo.length}`);
  
  // Calcula o total de KM
  let totalKm = 0;
  ciclosNoPeriodo.forEach((ciclo, index) => {
    if (ciclo.inicial && ciclo.final) {
      const distancia = ciclo.final.value - ciclo.inicial.value;
      if (distancia > 0) {
        totalKm += distancia;
        const dataInicial = getBrazilDateString(ciclo.inicial.date);
        console.log(`Ciclo ${index + 1} (${dataInicial}): ${ciclo.inicial.value} -> ${ciclo.final.value} = ${distancia}km`);
      } else {
        console.log(`Ciclo ${index + 1} ignorado - distância negativa ou zero: ${ciclo.inicial.value} -> ${ciclo.final.value} = ${distancia}km`);
      }
    }
  });
  
  console.log('=== RESULTADO FINAL ===');
  console.log('Total KM calculado:', totalKm);
  return totalKm;
};

export const calculateKmForAllRecords = (odometerRecords: OdometerRecord[]): number => {
  console.log('=== CALCULANDO KM PARA TODOS OS REGISTROS ===');
  console.log('Total de registros:', odometerRecords.length);
  
  const ciclosCompletos = agruparCiclosPorPairId(odometerRecords);
  
  let totalKm = 0;
  ciclosCompletos.forEach((ciclo, index) => {
    if (ciclo.inicial && ciclo.final) {
      const distancia = ciclo.final.value - ciclo.inicial.value;
      if (distancia > 0) {
        totalKm += distancia;
        const dataInicial = getBrazilDateString(ciclo.inicial.date);
        console.log(`Ciclo ${index + 1} (${dataInicial}): ${ciclo.inicial.value} -> ${ciclo.final.value} = ${distancia}km`);
      }
    }
  });
  
  console.log('Total KM para todos os registros:', totalKm);
  return totalKm;
};
