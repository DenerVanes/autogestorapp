import { Transaction } from "@/types";
import { filterByPeriod } from "@/utils/dateFilters";

export function getCurrentWeekEarnings(transactions: Transaction[]): number {
  return filterByPeriod(transactions, "esta-semana")
    .filter(t => t.type === "receita")
    .reduce((sum, t) => sum + t.value, 0);
}

export function getCurrentMonthEarnings(transactions: Transaction[]): number {
  return filterByPeriod(transactions, "este-mes")
    .filter(t => t.type === "receita")
    .reduce((sum, t) => sum + t.value, 0);
}

export function getGoalColor(percent: number): string {
  if (percent > 80) return "bg-green-500";
  if (percent > 40) return "bg-yellow-400";
  return "bg-red-400";
} 