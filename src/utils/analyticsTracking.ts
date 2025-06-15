
import { supabase } from '@/integrations/supabase/client';

class AnalyticsTracker {
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  async track(eventType: string, metadata?: Record<string, any>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const event = {
        event_type: eventType,
        user_id: user?.id || null,
        session_id: this.sessionId,
        metadata: metadata || {}
      };

      console.log('Tracking event:', event);

      const { error } = await supabase
        .from('analytics_events')
        .insert([event]);

      if (error) {
        console.error('Error tracking event:', error);
      } else {
        console.log('Event tracked successfully:', eventType);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Métodos de conveniência para eventos específicos
  trackLandingPageView() {
    this.track('landing_page_view', {
      page: 'landing',
      timestamp: new Date().toISOString()
    });
  }

  trackSignupClick() {
    this.track('signup_click', {
      source: 'landing_page',
      timestamp: new Date().toISOString()
    });
  }

  trackSubscriptionClick() {
    this.track('subscription_click', {
      source: 'pricing_section',
      timestamp: new Date().toISOString()
    });
  }

  trackPaymentCompleted(amount?: number, planType?: string) {
    this.track('payment_completed', {
      amount,
      plan_type: planType,
      timestamp: new Date().toISOString()
    });
  }

  trackSignupCompleted() {
    this.track('signup_completed', {
      timestamp: new Date().toISOString()
    });
  }

  trackLoginAttempt(success: boolean) {
    this.track('login_attempt', {
      success,
      timestamp: new Date().toISOString()
    });
  }
}

// Instância singleton
export const analytics = new AnalyticsTracker();

// Hook para usar analytics em componentes React
export const useAnalyticsTracker = () => {
  return analytics;
};
