
import { format } from "date-fns";
import type { OdometerRecord } from "@/types";

// Função para agrupar registros por ciclos usando pair_id
function agruparCiclosPorPairId(records: OdometerRecord[]) {
  console.log('Agrupando ciclos por pair_id:', records.length, 'registros');
  
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
    } else if (record.type === 'final') {
      pares[pairId].final = record;
    }
  });
  
  // Filtra apenas os pares que têm tanto inicial quanto final
  const ciclosCompletos = Object.values(pares).filter(par => par.inicial && par.final);
  console.log('Ciclos completos encontrados após agrupamento:', ciclosCompletos.length);
  
  ciclosCompletos.forEach((ciclo, index) => {
    if (ciclo.inicial && ciclo.final) {
      const distancia = ciclo.final.value - ciclo.inicial.value;
      console.log(`Ciclo ${index + 1}: ${ciclo.inicial.value} -> ${ciclo.final.value} = ${distancia}km (Data: ${format(ciclo.inicial.date, 'dd/MM/yyyy')})`);
    }
  });
  
  return ciclosCompletos;
}

// Função para filtrar registros por período
function filterOdometerByPeriod(records: OdometerRecord[], period: string, customStartDate?: Date, customEndDate?: Date): OdometerRecord[] {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case "hoje":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    case "ontem":
      const ontem = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      startDate = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 0, 0, 0, 0);
      endDate = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 23, 59, 59, 999);
      break;
    case "esta-semana": {
      const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    }
    case "semana-passada": {
      const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
      const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek - 6, 0, 0, 0, 0);
      const lastWeekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek, 23, 59, 59, 999);
      startDate = lastWeekStart;
      endDate = lastWeekEnd;
      break;
    }
    case "este-mes":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case "mes-passado": {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
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
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }

  console.log(`Filtrando período ${period}: ${format(startDate, 'dd/MM/yyyy')} a ${format(endDate, 'dd/MM/yyyy')}`);
  
  // Filtra registros pelo período - considera a data do registro inicial para determinar o período
  return records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= startDate && recordDate <= endDate;
  });
}

export const calculateKmRodado = (odometerRecords: OdometerRecord[], period: string, customStartDate?: Date, customEndDate?: Date): number => {
  console.log('=== INÍCIO CÁLCULO KM RODADO ===');
  console.log('Calculando KM rodado:', { period, totalRecords: odometerRecords.length });
  
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
  const ciclosFiltrados = ciclosCompletos.filter(ciclo => {
    if (!ciclo.inicial || !ciclo.final) return false;
    
    // Usa a data do inicial para determinar se o ciclo está no período
    const inicialDate = new Date(ciclo.inicial.date);
    
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case "hoje":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case "ontem":
        const ontem = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        startDate = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 0, 0, 0, 0);
        endDate = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 23, 59, 59, 999);
        break;
      case "esta-semana": {
        const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      }
      case "semana-passada": {
        const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
        const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek - 6, 0, 0, 0, 0);
        const lastWeekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek, 23, 59, 59, 999);
        startDate = lastWeekStart;
        endDate = lastWeekEnd;
        break;
      }
      case "este-mes":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case "mes-passado": {
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
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
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }
    
    const isInPeriod = inicialDate >= startDate && inicialDate <= endDate;
    console.log(`Ciclo inicial em ${format(inicialDate, 'dd/MM/yyyy')} está no período? ${isInPeriod}`);
    return isInPeriod;
  });
  
  console.log('Ciclos no período:', ciclosFiltrados.length);
  
  // Calcula o total de KM
  let totalKm = 0;
  ciclosFiltrados.forEach((ciclo, index) => {
    if (ciclo.inicial && ciclo.final) {
      const distancia = ciclo.final.value - ciclo.inicial.value;
      if (distancia > 0) {
        totalKm += distancia;
        console.log(`Ciclo ${index + 1}: ${ciclo.inicial.value} -> ${ciclo.final.value} = ${distancia}km`);
      } else {
        console.log(`Ciclo ${index + 1} ignorado - distância negativa: ${ciclo.inicial.value} -> ${ciclo.final.value} = ${distancia}km`);
      }
    }
  });
  
  console.log('=== RESULTADO FINAL ===');
  console.log('Total KM calculado:', totalKm);
  return totalKm;
};

export const calculateKmForAllRecords = (odometerRecords: OdometerRecord[]): number => {
  console.log('Calculando KM para todos os registros:', odometerRecords.length);
  
  const ciclosCompletos = agruparCiclosPorPairId(odometerRecords);
  
  let totalKm = 0;
  ciclosCompletos.forEach(ciclo => {
    if (ciclo.inicial && ciclo.final) {
      const distancia = ciclo.final.value - ciclo.inicial.value;
      if (distancia > 0) {
        totalKm += distancia;
      }
    }
  });
  
  console.log('Total KM para todos os registros:', totalKm);
  return totalKm;
};
