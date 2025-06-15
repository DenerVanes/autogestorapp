
-- Atualizar tabela user_subscriptions para suporte completo ao Stripe
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('card', 'pix')),
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Atualizar status para incluir trial
ALTER TABLE public.user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_status_check;

ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT user_subscriptions_status_check 
CHECK (status IN ('trial', 'active', 'past_due', 'canceled', 'expired', 'incomplete'));

-- Criar tabela para histórico de pagamentos PIX
CREATE TABLE IF NOT EXISTS public.pix_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'brl',
  status TEXT NOT NULL,
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for pix_payments
ALTER TABLE public.pix_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for pix_payments
CREATE POLICY "select_own_pix_payments" ON public.pix_payments
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "insert_pix_payments" ON public.pix_payments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "update_pix_payments" ON public.pix_payments
  FOR UPDATE
  USING (true);

-- Criar função para inicializar trial de 7 dias
CREATE OR REPLACE FUNCTION public.initialize_user_trial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Inserir período de trial de 7 dias para novos usuários
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_type,
    status,
    trial_start_date,
    trial_end_date,
    started_at,
    expires_at
  ) VALUES (
    NEW.id,
    'trial',
    'trial',
    now(),
    now() + INTERVAL '7 days',
    now(),
    now() + INTERVAL '7 days'
  );
  RETURN NEW;
END;
$function$;

-- Criar trigger para inicializar trial automaticamente
DROP TRIGGER IF EXISTS on_auth_user_trial_created ON auth.users;
CREATE TRIGGER on_auth_user_trial_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.initialize_user_trial();

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_pix_payments_user_id ON public.pix_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_pix_payments_stripe_intent ON public.pix_payments(stripe_payment_intent_id);
