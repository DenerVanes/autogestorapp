
import { format, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import type { Transaction, ChartData } from "@/types";
import { filterByPeriod } from "./dateFilters";

export const getChartData = (transactions: Transaction[], period: string, customStartDate?: Date, customEndDate?: Date): ChartData[] => {
  // Always show a week view (7 days) for better readability
  const now = new Date();
  
  // Determine the base week to show
  let referenceDate: Date;
  if (period === 'personalizado' && customStartDate) {
    referenceDate = customStartDate;
  } else if (period === 'hoje') {
    referenceDate = now;
  } else {
    // For 7dias and 30dias, show the current week
    referenceDate = now;
  }
  
  // Get the week containing the reference date (Monday to Sunday - Uber/99 standard)
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 }); // Monday = 1
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 }); // Sunday
  
  // Create array of all days in the week
  const allDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Filter transactions to include only those in the selected period
  const filteredTransactions = filterByPeriod(transactions, period, customStartDate, customEndDate);
  
  // Group transactions by date
  const dataMap = new Map<string, { receita: number; despesa: number }>();
  
  // Initialize all days in the week with zero values
  allDays.forEach(day => {
    const dateKey = format(day, 'yyyy-MM-dd');
    dataMap.set(dateKey, { receita: 0, despesa: 0 });
  });
  
  // Add transaction data only for dates within the filtered period
  filteredTransactions.forEach(transaction => {
    const dateKey = format(transaction.date, 'yyyy-MM-dd');
    const existing = dataMap.get(dateKey);
    
    if (existing) { // Only add if the date is in our week
      if (transaction.type === 'receita') {
        existing.receita += transaction.value;
      } else {
        existing.despesa += transaction.value;
      }
    }
  });

  // Convert to array and sort by date
  return Array.from(dataMap.entries())
    .map(([date, values]) => ({
      date,
      ...values
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};
