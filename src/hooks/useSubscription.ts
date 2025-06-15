
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
  }, [user]);

  const createCheckout = async (planType: 'recurring' | 'pix') => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { planType }
    });

    if (error) throw error;

    if (data.type === 'checkout') {
      // Abrir checkout do Stripe em nova aba
      window.open(data.url, '_blank');
    } else if (data.type === 'pix') {
      // Retornar dados do PIX para mostrar QR code
      return data;
    }
  };

  return {
    subscription,
    loading,
    checkSubscription,
    createCheckout,
    hasAccess: subscription?.has_access || false,
    isExpired: subscription?.is_expired || false,
    daysRemaining: subscription?.days_remaining || 0,
    isTrial: subscription?.is_trial || false
  };
};
