import { supabase } from '@/integrations/supabase/client';

export interface AdminKpiSummary {
  total_users: number;
  active_users_7_days: number;
  active_pro_users: number;
  canceled_this_month: number;
  current_monthly_revenue: number;
  next_month_revenue_forecast: number;
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

export interface UserSearchResult {
  id: string;
  email: string;
  name: string | null;
  current_plan?: string;
  subscription_status?: string;
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
  async getKpiSummary(): Promise<AdminKpiSummary> {
    await verifyAdminAccess();
    const { data, error } = await supabase
      .from('admin_kpi_summary' as any)
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching KPI summary:', error);
      throw error;
    }
    return data as unknown as AdminKpiSummary;
  },

  async getUserGrowthData(): Promise<UserGrowthData[]> {
    // Verificação de segurança antes de acessar dados
    await verifyAdminAccess();
    
    console.log('Buscando dados de crescimento de usuários...');
    
    const { data, error } = await supabase
      .from('user_growth_chart' as any)
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching user growth data:', error);
      throw error;
    }

    console.log('Dados de crescimento carregados:', data?.length, 'registros');
    return (data as unknown as UserGrowthData[]) || [];
  },

  async getUserTypeDistribution(): Promise<UserTypeDistribution[]> {
    // Verificação de segurança antes de acessar dados
    await verifyAdminAccess();
    
    console.log('Buscando distribuição de tipos de usuários...');
    
    const { data, error } = await supabase
      .from('user_type_distribution' as any)
      .select('*');

    if (error) {
      console.error('Error fetching user type distribution:', error);
      throw error;
    }

    console.log('Distribuição de usuários carregada:', data);
    return (data as unknown as UserTypeDistribution[]) || [];
  },

  async searchUsers(searchTerm: string): Promise<UserSearchResult[]> {
    await verifyAdminAccess();

    const { data, error } = await supabase.rpc('search_users_with_subscription' as any, {
      search_term: searchTerm,
    });

    if (error) {
      console.error('Error searching users:', error);
      throw new Error('Falha ao buscar usuários.');
    }

    return (data || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      current_plan: user.plan_type,
      subscription_status: user.subscription_status,
    }));
  },

  async setUserProStatus(userId: string, grantPro: boolean): Promise<void> {
    await verifyAdminAccess();
    
    const { error } = await supabase.rpc('set_user_pro_status' as any, {
      target_user_id: userId,
      grant_pro: grantPro,
    });

    if (error) {
      console.error('Error setting user PRO status:', error);
      throw new Error('Falha ao atualizar o status PRO do usuário.');
    }
  },
};

export const getRecentUsers = async () => {
  const { data, error } = await supabase.from('admin_recent_users').select('*');

  if (error) {
    console.error('Error fetching recent users:', error);
    throw new Error(error.message);
  }

  return data;
};

export const getRecentProSubscribers = async () => {
  const { data, error } = await supabase.from('admin_recent_pro_subscribers').select('*');

  if (error) {
    console.error('Error fetching recent PRO subscribers:', error);
    throw new Error(error.message);
  }

  return data;
};

export const getConversionFunnelData = async () => {
  const { data, error } = await supabase
    .from('admin_conversion_funnel')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching conversion funnel data:', error);
    throw new Error(error.message);
  }

  return data;
};
