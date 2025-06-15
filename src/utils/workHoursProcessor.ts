
import { format, startOfDay, addDays, subDays } from "date-fns";
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
    
    // Verifica se o registro atravessa o horário de corte (04:00)
    const crossesCutoff = shouldSplitRecord(startDate, endDate);
    
    if (!crossesCutoff) {
      // Registro normal - não atravessa 04:00
      const workingDate = getWorkingDate(startDate);
      
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
      const splitRecords = splitRecordAtCutoff(record);
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

export const calculateWorkHoursWithCutoff = (
  workHours: WorkHoursRecord[], 
  period: string, 
  customStartDate?: Date, 
  customEndDate?: Date
): number => {
  const processedRecords = processWorkHoursWithCutoff(workHours);
  
  // Aplicar filtro de período baseado na data de trabalho
  const filteredRecords = processedRecords.filter(record => {
    // Aqui você aplicaria o mesmo filtro de período, mas baseado na workingDate
    // Por simplicidade, vou retornar todos por enquanto
    return true;
  });
  
  return filteredRecords.reduce((total, record) => {
    const diff = record.endDateTime.getTime() - record.startDateTime.getTime();
    return total + (diff / (1000 * 60 * 60));
  }, 0);
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
