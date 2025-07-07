
import { supabase } from '@/integrations/supabase/client';

export interface Goals {
  weeklyGoal: number;
  monthlyGoal: number;
}

export const goalService = {
  async getGoals(userId: string): Promise<Goals> {
    const { data, error } = await supabase
      .from('user_goals')
      .select('weekly_goal, monthly_goal')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching goals:', error);
      // Fallback para valores padrão
      return { weeklyGoal: 1000, monthlyGoal: 4000 };
    }

    if (!data) {
      // Se não existir registro, retorna valores padrão
      return { weeklyGoal: 1000, monthlyGoal: 4000 };
    }

    return {
      weeklyGoal: Number(data.weekly_goal),
      monthlyGoal: Number(data.monthly_goal)
    };
  },

  async setGoals(userId: string, goals: Goals): Promise<void> {
    const { error } = await supabase
      .from('user_goals')
      .upsert({
        user_id: userId,
        weekly_goal: goals.weeklyGoal,
        monthly_goal: goals.monthlyGoal
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving goals:', error);
      throw error;
    }
  },

  async suggestGoals(transactions: any[]): Promise<Goals> {
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
  }
};
