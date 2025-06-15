
import { format } from "date-fns";
import type { OdometerRecord } from "@/types";
import { filterByPeriod } from "./dateFilters";

export const calculateKmRodado = (odometerRecords: OdometerRecord[], period: string, customStartDate?: Date, customEndDate?: Date): number => {
  const filteredOdometer = filterByPeriod(odometerRecords, period, customStartDate, customEndDate);
  
  // Group odometer records by date and calculate daily KM
  const kmByDate = new Map<string, { inicial?: number; final?: number }>();
  
  filteredOdometer.forEach(record => {
    const dateKey = format(record.date, 'yyyy-MM-dd');
    const existing = kmByDate.get(dateKey) || {};
    
    if (record.type === 'inicial') {
      existing.inicial = record.value;
    } else if (record.type === 'final') {
      existing.final = record.value;
    }
    
    kmByDate.set(dateKey, existing);
  });
  
  // Calculate total KM for the period
  return Array.from(kmByDate.values()).reduce((total, day) => {
    if (day.inicial !== undefined && day.final !== undefined) {
      return total + (day.final - day.inicial);
    }
    return total;
  }, 0);
};

export const calculateKmForAllRecords = (odometerRecords: OdometerRecord[]): number => {
  const kmByDate = new Map<string, { inicial?: number; final?: number }>();
  
  odometerRecords.forEach(record => {
    const dateKey = format(record.date, 'yyyy-MM-dd');
    const existing = kmByDate.get(dateKey) || {};
    
    if (record.type === 'inicial') {
      existing.inicial = record.value;
    } else if (record.type === 'final') {
      existing.final = record.value;
    }
    
    kmByDate.set(dateKey, existing);
  });
  
  return Array.from(kmByDate.values()).reduce((total, day) => {
    if (day.inicial !== undefined && day.final !== undefined) {
      return total + (day.final - day.inicial);
    }
    return total;
  }, 0);
};
