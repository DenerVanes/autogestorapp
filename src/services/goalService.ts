import { supabase } from '@/integrations/supabase/client';

export interface Goals {
  weeklyGoal: number;
  monthlyGoal: number;
}

export const goalService = {
  async getGoals(userId: string): Promise<Goals> {
    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('weekly_goal, monthly_goal')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching goals:', error);
        return { weeklyGoal: 1000, monthlyGoal: 4000 };
      }

      if (!data) {
        return { weeklyGoal: 1000, monthlyGoal: 4000 };
      }

      return {
        weeklyGoal: Number(data.weekly_goal) || 1000,
        monthlyGoal: Number(data.monthly_goal) || 4000
      };
    } catch (error) {
      console.error('Error in getGoals:', error);
      return { weeklyGoal: 1000, monthlyGoal: 4000 };
    }
  },

  async setGoals(userId: string, goals: Goals): Promise<void> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!goals.weeklyGoal || !goals.monthlyGoal || goals.weeklyGoal <= 0 || goals.monthlyGoal <= 0) {
        throw new Error('Invalid goal values');
      }

      const { error } = await supabase
        .from('user_goals')
        .upsert({
          user_id: userId,
          weekly_goal: goals.weeklyGoal,
          monthly_goal: goals.monthlyGoal,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving goals:', error);
        throw new Error(`Failed to save goals: ${error.message}`);
      }

      console.log('Goals saved successfully:', goals);
    } catch (error) {
      console.error('Error in setGoals:', error);
      throw error;
    }
  },

  async suggestGoals(transactions: any[]): Promise<Goals> {
    try {
      if (!Array.isArray(transactions) || transactions.length === 0) {
        return { weeklyGoal: 1000, monthlyGoal: 4000 };
      }

      // Sugere metas baseadas na média dos últimos 4 períodos
      const now = new Date();
      
      // Semana
      const weekEarnings: number[] = [];
      for (let i = 0; i < 4; i++) {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay() + 1 - i * 7); // segunda-feira
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        
        const sum = transactions
          .filter(t => {
            if (!t.date || t.type !== 'receita') return false;
            const tDate = new Date(t.date);
            return tDate >= start && tDate <= end;
          })
          .reduce((acc, t) => acc + (Number(t.value) || 0), 0);
        
        weekEarnings.push(sum);
      }
      
      // Mês
      const monthEarnings: number[] = [];
      for (let i = 0; i < 4; i++) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
        
        const sum = transactions
          .filter(t => {
            if (!t.date || t.type !== 'receita') return false;
            const tDate = new Date(t.date);
            return tDate >= start && tDate <= end;
          })
          .reduce((acc, t) => acc + (Number(t.value) || 0), 0);
        
        monthEarnings.push(sum);
      }
      
      const validWeekEarnings = weekEarnings.filter(earning => earning > 0);
      const validMonthEarnings = monthEarnings.filter(earning => earning > 0);
      
      const weeklyGoal = validWeekEarnings.length > 0 
        ? Math.round(validWeekEarnings.reduce((a, b) => a + b, 0) / validWeekEarnings.length)
        : 1000;
        
      const monthlyGoal = validMonthEarnings.length > 0 
        ? Math.round(validMonthEarnings.reduce((a, b) => a + b, 0) / validMonthEarnings.length)
        : 4000;
      
      return {
        weeklyGoal: weeklyGoal || 1000,
        monthlyGoal: monthlyGoal || 4000,
      };
    } catch (error) {
      console.error('Error in suggestGoals:', error);
      return { weeklyGoal: 1000, monthlyGoal: 4000 };
    }
  }
};
