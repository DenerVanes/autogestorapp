
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  id: string;
  event_type: string;
  user_id?: string;
  session_id?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface AnalyticsMetrics {
  landingPageViews: number;
  signupClicks: number;
  subscriptionClicks: number;
  paymentsCompleted: number;
  signupsCompleted: number;
  loginAttempts: number;
  conversionRates: {
    signupRate: number;
    subscriptionRate: number;
    paymentRate: number;
  };
}

interface UserStats {
  totalUsers: number;
  paidUsers: number;
  freeUsers: number;
  recentSignups: number;
  monthlyRevenue: number;
}

export const useAnalytics = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const trackEvent = async (eventType: string, metadata?: Record<string, any>) => {
    try {
      const sessionId = sessionStorage.getItem('session_id') || 
        Math.random().toString(36).substring(2, 15);
      
      if (!sessionStorage.getItem('session_id')) {
        sessionStorage.setItem('session_id', sessionId);
      }

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('analytics_events')
        .insert([{
          event_type: eventType,
          user_id: user?.id || null,
          session_id: sessionId,
          metadata: metadata || {}
        }]);

      if (error) {
        console.error('Erro ao rastrear evento:', error);
      } else {
        console.log('Evento rastreado:', eventType);
      }
    } catch (error) {
      console.error('Erro ao rastrear evento:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Buscar eventos dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: eventsData, error: eventsError } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      setEvents(eventsData || []);

      // Calcular métricas
      const landingPageViews = eventsData?.filter(e => e.event_type === 'landing_page_view').length || 0;
      const signupClicks = eventsData?.filter(e => e.event_type === 'signup_click').length || 0;
      const subscriptionClicks = eventsData?.filter(e => e.event_type === 'subscription_click').length || 0;
      const paymentsCompleted = eventsData?.filter(e => e.event_type === 'payment_completed').length || 0;
      const signupsCompleted = eventsData?.filter(e => e.event_type === 'signup_completed').length || 0;
      const loginAttempts = eventsData?.filter(e => e.event_type === 'login_attempt').length || 0;

      const conversionRates = {
        signupRate: landingPageViews > 0 ? (signupClicks / landingPageViews) * 100 : 0,
        subscriptionRate: signupClicks > 0 ? (subscriptionClicks / signupClicks) * 100 : 0,
        paymentRate: subscriptionClicks > 0 ? (paymentsCompleted / subscriptionClicks) * 100 : 0,
      };

      setMetrics({
        landingPageViews,
        signupClicks,
        subscriptionClicks,
        paymentsCompleted,
        signupsCompleted,
        loginAttempts,
        conversionRates
      });

      // Buscar estatísticas de usuários
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select('*');

      if (subscriptionsError) throw subscriptionsError;

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      const totalUsers = profilesData?.length || 0;
      const paidUsers = subscriptionsData?.filter(s => s.status === 'active' && s.plan_type === 'premium').length || 0;
      const freeUsers = totalUsers - paidUsers;
      const monthlyRevenue = subscriptionsData?.filter(s => s.status === 'active' && s.plan_type === 'premium')
        .reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;

      // Usuários cadastrados nos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentSignups = profilesData?.filter(p => new Date(p.created_at) >= sevenDaysAgo).length || 0;

      setUserStats({
        totalUsers,
        paidUsers,
        freeUsers,
        recentSignups,
        monthlyRevenue
      });

    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    metrics,
    userStats,
    events,
    loading,
    trackEvent,
    refetch: fetchAnalytics
  };
};
