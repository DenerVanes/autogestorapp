import { format } from "date-fns";
import type { OdometerRecord } from "@/types";

// Função para agrupar registros por ciclos (pares inicial/final)
function agruparCiclosPorData(records: OdometerRecord[], dateKey: string) {
  const doDia = records.filter(r => {
    const key = r.date.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 10);
    return key === dateKey;
  });
  
  // Ordena por data/hora
  doDia.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Agrupa em ciclos
  const ciclos: { inicial: OdometerRecord, final?: OdometerRecord }[] = [];
  let pendente: OdometerRecord | null = null;
  
  doDia.forEach(r => {
    if (r.type === 'inicial') {
      if (pendente) {
        // Se ficou um inicial sem final, considera ciclo incompleto
        ciclos.push({ inicial: pendente });
      }
      pendente = r;
    } else if (r.type === 'final' && pendente) {
      ciclos.push({ inicial: pendente, final: r });
      pendente = null;
    }
  });
  
  if (pendente) ciclos.push({ inicial: pendente });
  return ciclos;
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
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
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

  // Filtra registros pelo período - USANDO A DATA DO INICIAL
  return records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= startDate && recordDate <= endDate;
  });
}

export const calculateKmRodado = (odometerRecords: OdometerRecord[], period: string, customStartDate?: Date, customEndDate?: Date): number => {
  const filteredRecords = filterOdometerByPeriod(odometerRecords, period, customStartDate, customEndDate);
  
  // Agrupa por data - usando fuso horário do Brasil
  const recordsByDate = new Map<string, OdometerRecord[]>();
  
  filteredRecords.forEach(record => {
    const dateKey = record.date.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 10);
    if (!recordsByDate.has(dateKey)) {
      recordsByDate.set(dateKey, []);
    }
    recordsByDate.get(dateKey)!.push(record);
  });
  
  let totalKm = 0;
  
  // Para cada dia, calcula a soma de todos os ciclos
  recordsByDate.forEach((records, dateKey) => {
    const ciclos = agruparCiclosPorData(odometerRecords, dateKey); // usa todos os registros para considerar ciclos que começam em um dia e terminam em outro
    
    ciclos.forEach(ciclo => {
      if (ciclo.inicial && ciclo.final) {
        const distancia = ciclo.final.value - ciclo.inicial.value;
        if (distancia > 0) {
          totalKm += distancia;
        }
      }
    });
  });
  
  return totalKm;
};

export const calculateKmForAllRecords = (odometerRecords: OdometerRecord[]): number => {
  // Agrupa todos os registros por data
  const recordsByDate = new Map<string, OdometerRecord[]>();
  
  odometerRecords.forEach(record => {
    const dateKey = record.date.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 10);
    if (!recordsByDate.has(dateKey)) {
      recordsByDate.set(dateKey, []);
    }
    recordsByDate.get(dateKey)!.push(record);
  });
  
  let totalKm = 0;
  
  // Para cada dia, calcula a soma de todos os ciclos
  recordsByDate.forEach((records, dateKey) => {
    const ciclos = agruparCiclosPorData(odometerRecords, dateKey);
    
    ciclos.forEach(ciclo => {
      if (ciclo.inicial && ciclo.final) {
        const distancia = ciclo.final.value - ciclo.inicial.value;
        if (distancia > 0) {
          totalKm += distancia;
        }
      }
    });
  });
  
  return totalKm;
};
