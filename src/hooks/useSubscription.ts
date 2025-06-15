
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStatus {
  has_access: boolean;
  plan_type: string;
  expires_at: string | null;
  days_remaining: number;
  is_trial: boolean;
  is_expired: boolean;
}

const ADMIN_EMAIL = 'dennervanes@hotmail.com';

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    // Permitir acesso total ao admin
    if (user.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()) {
      setSubscription({
        has_access: true,
        plan_type: 'admin',
        expires_at: null,
        days_remaining: 9999,
        is_trial: false,
        is_expired: false,
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) {
        console.error('Error checking subscription:', error);
        setSubscription(null);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const createCheckout = async (planType: 'recurring') => {
    if (!user) throw new Error('User not authenticated');

    // Impedir que o admin tente assinar (caso tente forçar)
    if (user.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()) {
      throw new Error('O administrador já possui acesso total e não pode assinar planos.');
    }

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { planType }
    });

    if (error) throw error;

    if (data.type === 'checkout') {
      window.open(data.url, '_blank');
    }
  };

  // Expor variáveis consistentes, inclusive para o admin
  const isAdmin = user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

  return {
    subscription,
    loading,
    checkSubscription,
    createCheckout,
    hasAccess: isAdmin ? true : subscription?.has_access || false,
    isExpired: isAdmin ? false : subscription?.is_expired || false,
    daysRemaining: isAdmin ? 9999 : subscription?.days_remaining || 0,
    isTrial: isAdmin ? false : subscription?.is_trial || false,
    isAdmin
  };
};
