// Serviço para metas de ganhos (GoalService)
import { Transaction } from "@/types";

export interface Goals {
  weeklyGoal: number;
  monthlyGoal: number;
}

function getGoalsKey(userId: string) {
  return `user_goals_${userId}`;
}

export const GoalService = {
  getGoals(userId: string): Goals {
    const stored = localStorage.getItem(getGoalsKey(userId));
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback para valores padrão
      }
    }
    return { weeklyGoal: 1000, monthlyGoal: 4000 };
  },

  setGoals(userId: string, goals: Goals) {
    localStorage.setItem(getGoalsKey(userId), JSON.stringify(goals));
  },

  suggestGoals(transactions: Transaction[]): Goals {
    // Sugere metas baseadas na média dos últimos 4 períodos
    const now = new Date();
    // Semana
    const weekEarnings: number[] = [];
    for (let i = 0; i < 4; i++) {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay() + 1 - i * 7); // segunda-feira
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const sum = transactions.filter(t => t.type === 'receita' && t.date >= start && t.date <= end)
        .reduce((acc, t) => acc + t.value, 0);
      weekEarnings.push(sum);
    }
    // Mês
    const monthEarnings: number[] = [];
    for (let i = 0; i < 4; i++) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const sum = transactions.filter(t => t.type === 'receita' && t.date >= start && t.date <= end)
        .reduce((acc, t) => acc + t.value, 0);
      monthEarnings.push(sum);
    }
    const weeklyGoal = Math.round(
      weekEarnings.filter(Boolean).reduce((a, b) => a + b, 0) /
        (weekEarnings.filter(Boolean).length || 1)
    );
    const monthlyGoal = Math.round(
      monthEarnings.filter(Boolean).reduce((a, b) => a + b, 0) /
        (monthEarnings.filter(Boolean).length || 1)
    );
    return {
      weeklyGoal: weeklyGoal || 1000,
      monthlyGoal: monthlyGoal || 4000,
    };
  },
}; 