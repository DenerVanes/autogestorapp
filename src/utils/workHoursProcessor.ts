
import { format, startOfDay, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import type { WorkHoursRecord } from "@/types";

export interface ProcessedWorkHours {
  id: string;
  originalId: string;
  startDateTime: Date;
  endDateTime: Date;
  workingDate: Date; // Data em que as horas devem ser contabilizadas
  isPartialRecord: boolean; // Se foi dividido automaticamente
  partNumber?: number; // 1 ou 2 se foi dividido
}

// Hora de corte (04:00)
const CUTOFF_HOUR = 4;

export const processWorkHoursWithCutoff = (workHours: WorkHoursRecord[]): ProcessedWorkHours[] => {
  const processedRecords: ProcessedWorkHours[] = [];

  workHours.forEach(record => {
    const startDate = new Date(record.startDateTime);
    const endDate = new Date(record.endDateTime);
    
    console.log(`Processando registro: ${format(startDate, 'dd/MM/yyyy HH:mm')} - ${format(endDate, 'dd/MM/yyyy HH:mm')}`);
    
    // Verifica se o registro atravessa o horário de corte (04:00)
    const crossesCutoff = shouldSplitRecord(startDate, endDate);
    
    if (!crossesCutoff) {
      // Registro normal - não atravessa 04:00
      const workingDate = getWorkingDate(startDate);
      
      console.log(`Registro normal - Data de trabalho: ${format(workingDate, 'dd/MM/yyyy')}`);
      
      processedRecords.push({
        id: record.id,
        originalId: record.id,
        startDateTime: startDate,
        endDateTime: endDate,
        workingDate,
        isPartialRecord: false
      });
    } else {
      // Registro atravessa 04:00 - dividir em dois
      console.log('Registro atravessa 04:00 - dividindo em dois períodos');
      const splitRecords = splitRecordAtCutoff(record);
      splitRecords.forEach(split => {
        console.log(`Período dividido: ${format(split.startDateTime, 'dd/MM/yyyy HH:mm')} - ${format(split.endDateTime, 'dd/MM/yyyy HH:mm')} (Data trabalho: ${format(split.workingDate, 'dd/MM/yyyy')})`);
      });
      processedRecords.push(...splitRecords);
    }
  });

  return processedRecords;
};

const shouldSplitRecord = (startDate: Date, endDate: Date): boolean => {
  const startHour = startDate.getHours();
  const endHour = endDate.getHours();
  
  // Se começa antes das 04:00 e termina depois das 04:00 do mesmo dia
  if (startHour < CUTOFF_HOUR && endHour >= CUTOFF_HOUR && 
      format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
    return true;
  }
  
  // Se começa em um dia e termina no próximo dia atravessando 04:00
  if (format(startDate, 'yyyy-MM-dd') !== format(endDate, 'yyyy-MM-dd')) {
    const nextDayCutoff = new Date(endDate);
    nextDayCutoff.setHours(CUTOFF_HOUR, 0, 0, 0);
    
    return endDate > nextDayCutoff;
  }
  
  return false;
};

const splitRecordAtCutoff = (record: WorkHoursRecord): ProcessedWorkHours[] => {
  const startDate = new Date(record.startDateTime);
  const endDate = new Date(record.endDateTime);
  
  // Criar data de corte às 04:00
  let cutoffDate: Date;
  
  if (format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
    // Mesmo dia - corte às 04:00 do dia atual
    cutoffDate = new Date(startDate);
    cutoffDate.setHours(CUTOFF_HOUR, 0, 0, 0);
  } else {
    // Dias diferentes - corte às 04:00 do dia seguinte
    cutoffDate = new Date(endDate);
    cutoffDate.setHours(CUTOFF_HOUR, 0, 0, 0);
  }
  
  const firstPeriodEnd = new Date(cutoffDate);
  firstPeriodEnd.setMinutes(59, 59, 999); // 03:59:59
  
  const secondPeriodStart = new Date(cutoffDate);
  secondPeriodStart.setMinutes(1, 0, 0); // 04:01:00
  
  const firstPeriod: ProcessedWorkHours = {
    id: `${record.id}_part1`,
    originalId: record.id,
    startDateTime: startDate,
    endDateTime: firstPeriodEnd,
    workingDate: getWorkingDate(startDate),
    isPartialRecord: true,
    partNumber: 1
  };
  
  const secondPeriod: ProcessedWorkHours = {
    id: `${record.id}_part2`,
    originalId: record.id,
    startDateTime: secondPeriodStart,
    endDateTime: endDate,
    workingDate: getWorkingDate(secondPeriodStart),
    isPartialRecord: true,
    partNumber: 2
  };
  
  return [firstPeriod, secondPeriod];
};

const getWorkingDate = (dateTime: Date): Date => {
  const hour = dateTime.getHours();
  
  if (hour < CUTOFF_HOUR) {
    // Antes das 04:00 - contabilizar no dia anterior
    return startOfDay(subDays(dateTime, 1));
  } else {
    // Após as 04:00 - contabilizar no dia atual
    return startOfDay(dateTime);
  }
};

const getDateRangeForPeriod = (period: string, customStartDate?: Date, customEndDate?: Date) => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  if (period === 'personalizado' && customStartDate && customEndDate) {
    startDate = startOfDay(customStartDate);
    endDate = startOfDay(addDays(customEndDate, 1)); // Include the end date
  } else if (period === 'todos') {
    // Para "todos", não aplicar filtro de data
    return null;
  } else {
    switch (period) {
      case 'hoje':
        startDate = startOfDay(now);
        endDate = startOfDay(addDays(now, 1));
        break;
      case 'ontem':
        const yesterday = subDays(now, 1);
        startDate = startOfDay(yesterday);
        endDate = startOfDay(now);
        break;
      case 'esta-semana':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = startOfDay(addDays(endOfWeek(now, { weekStartsOn: 1 }), 1));
        break;
      case 'semana-passada':
        const lastWeek = subWeeks(now, 1);
        startDate = startOfWeek(lastWeek, { weekStartsOn: 1 });
        endDate = startOfDay(addDays(endOfWeek(lastWeek, { weekStartsOn: 1 }), 1));
        break;
      case 'este-mes':
        startDate = startOfMonth(now);
        endDate = startOfDay(addDays(endOfMonth(now), 1));
        break;
      case 'mes-passado':
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = startOfDay(addDays(endOfMonth(lastMonth), 1));
        break;
      default:
        startDate = startOfDay(now);
        endDate = startOfDay(addDays(now, 1));
    }
  }

  return { startDate, endDate };
};

export const calculateWorkHoursWithCutoff = (
  workHours: WorkHoursRecord[], 
  period: string, 
  customStartDate?: Date, 
  customEndDate?: Date
): number => {
  console.log(`Calculando horas para período: ${period}`);
  console.log(`Total de registros de entrada: ${workHours.length}`);
  
  const processedRecords = processWorkHoursWithCutoff(workHours);
  console.log(`Total de registros processados: ${processedRecords.length}`);
  
  // Aplicar filtro de período baseado na data de trabalho
  const dateRange = getDateRangeForPeriod(period, customStartDate, customEndDate);
  
  let filteredRecords = processedRecords;
  
  if (dateRange) {
    const { startDate, endDate } = dateRange;
    console.log(`Filtrando por período: ${format(startDate, 'dd/MM/yyyy')} a ${format(endDate, 'dd/MM/yyyy')}`);
    
    filteredRecords = processedRecords.filter(record => {
      const workingDate = record.workingDate;
      const isInRange = workingDate >= startDate && workingDate < endDate;
      
      if (isInRange) {
        console.log(`Registro incluído: ${format(record.startDateTime, 'dd/MM/yyyy HH:mm')} - ${format(record.endDateTime, 'dd/MM/yyyy HH:mm')} (Data trabalho: ${format(workingDate, 'dd/MM/yyyy')})`);
      }
      
      return isInRange;
    });
  }
  
  console.log(`Registros após filtro: ${filteredRecords.length}`);
  
  const totalHours = filteredRecords.reduce((total, record) => {
    const diff = record.endDateTime.getTime() - record.startDateTime.getTime();
    const hours = diff / (1000 * 60 * 60);
    console.log(`Período: ${format(record.startDateTime, 'HH:mm')} - ${format(record.endDateTime, 'HH:mm')} = ${hours.toFixed(2)}h`);
    return total + hours;
  }, 0);
  
  console.log(`Total de horas calculadas: ${totalHours.toFixed(2)}h`);
  return totalHours;
};

export const groupWorkHoursByDate = (workHours: WorkHoursRecord[]): Map<string, ProcessedWorkHours[]> => {
  const processedRecords = processWorkHoursWithCutoff(workHours);
  const groupedByDate = new Map<string, ProcessedWorkHours[]>();
  
  processedRecords.forEach(record => {
    const dateKey = format(record.workingDate, 'yyyy-MM-dd');
    const existing = groupedByDate.get(dateKey) || [];
    existing.push(record);
    groupedByDate.set(dateKey, existing);
  });
  
  return groupedByDate;
};
