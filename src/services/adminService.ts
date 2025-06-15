
import { supabase } from '@/integrations/supabase/client';

export interface AdminStatistics {
  total_users: number;
  active_subscribers: number;
  new_users_7_days: number;
  new_users_30_days: number;
  daily_active_users: number;
  monthly_active_users: number;
}

export interface UserGrowthData {
  date: string;
  new_users: number;
  total_users: number;
}

export interface UserTypeDistribution {
  user_type: string;
  count: number;
}

export const adminService = {
  async getStatistics(): Promise<AdminStatistics> {
    const { data, error } = await supabase
      .from('admin_statistics')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching admin statistics:', error);
      throw error;
    }

    return data;
  },

  async getUserGrowthData(): Promise<UserGrowthData[]> {
    const { data, error } = await supabase
      .from('user_growth_chart')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching user growth data:', error);
      throw error;
    }

    return data || [];
  },

  async getUserTypeDistribution(): Promise<UserTypeDistribution[]> {
    const { data, error } = await supabase
      .from('user_type_distribution')
      .select('*');

    if (error) {
      console.error('Error fetching user type distribution:', error);
      throw error;
    }

    return data || [];
  }
};
