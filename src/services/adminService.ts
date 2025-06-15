
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

// Função para verificar se o usuário é admin
const verifyAdminAccess = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.email !== 'dennervanes@hotmail.com') {
    throw new Error('Acesso negado: usuário não autorizado');
  }
  
  return true;
};

export const adminService = {
  async getStatistics(): Promise<AdminStatistics> {
    // Verificação de segurança antes de acessar dados
    await verifyAdminAccess();
    
    console.log('Buscando estatísticas administrativas...');
    
    const { data, error } = await supabase
      .from('admin_statistics')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching admin statistics:', error);
      throw error;
    }

    console.log('Estatísticas carregadas:', data);
    return data;
  },

  async getUserGrowthData(): Promise<UserGrowthData[]> {
    // Verificação de segurança antes de acessar dados
    await verifyAdminAccess();
    
    console.log('Buscando dados de crescimento de usuários...');
    
    const { data, error } = await supabase
      .from('user_growth_chart')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching user growth data:', error);
      throw error;
    }

    console.log('Dados de crescimento carregados:', data?.length, 'registros');
    return data || [];
  },

  async getUserTypeDistribution(): Promise<UserTypeDistribution[]> {
    // Verificação de segurança antes de acessar dados
    await verifyAdminAccess();
    
    console.log('Buscando distribuição de tipos de usuários...');
    
    const { data, error } = await supabase
      .from('user_type_distribution')
      .select('*');

    if (error) {
      console.error('Error fetching user type distribution:', error);
      throw error;
    }

    console.log('Distribuição de usuários carregada:', data);
    return data || [];
  }
};
