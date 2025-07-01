import { supabase } from "@/integrations/supabase/client";

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  amount?: number;
  payment_method?: string;
  current_period_start?: string;
  current_period_end?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

export const subscriptionService = {
  async getCurrentUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao buscar assinatura do usuário:', error);
      return null;
    }
    return data as UserSubscription;
  }
}; 