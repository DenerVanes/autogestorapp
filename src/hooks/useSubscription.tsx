
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionStatus {
  status: 'trial' | 'active' | 'expired' | 'past_due' | 'canceled';
  payment_method?: 'card' | 'pix';
  trial_end_date?: string;
  current_period_end?: string;
  expires_at?: string;
  days_remaining?: number;
  can_edit: boolean;
  loading: boolean;
}

interface SubscriptionContextType extends SubscriptionStatus {
  refreshSubscription: () => Promise<void>;
  createCheckout: (paymentMethod: 'card' | 'pix') => Promise<string | null>;
  openCustomerPortal: () => Promise<string | null>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    status: 'trial',
    can_edit: true,
    loading: true
  });

  const refreshSubscription = async () => {
    if (!user) {
      setSubscriptionStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      console.log('Checking subscription status...');
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        throw error;
      }

      console.log('Subscription status received:', data);
      
      setSubscriptionStatus({
        ...data,
        loading: false
      });

    } catch (error) {
      console.error('Error refreshing subscription:', error);
      toast.error('Erro ao verificar status da assinatura');
      setSubscriptionStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const createCheckout = async (paymentMethod: 'card' | 'pix'): Promise<string | null> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { paymentMethod },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout:', error);
        throw error;
      }

      return data.url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Erro ao criar sessão de pagamento');
      return null;
    }
  };

  const openCustomerPortal = async (): Promise<string | null> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error('Error opening customer portal:', error);
        throw error;
      }

      return data.url;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Erro ao abrir portal do cliente');
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      refreshSubscription();
      
      // Verificar status a cada 30 segundos
      const interval = setInterval(refreshSubscription, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <SubscriptionContext.Provider value={{
      ...subscriptionStatus,
      refreshSubscription,
      createCheckout,
      openCustomerPortal
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
