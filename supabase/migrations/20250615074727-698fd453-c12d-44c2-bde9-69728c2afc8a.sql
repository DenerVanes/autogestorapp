
-- Criar tabela para eventos de analytics
CREATE TABLE public.analytics_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL CHECK (event_type IN ('landing_page_view', 'signup_click', 'subscription_click', 'payment_completed', 'signup_completed', 'login_attempt')),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Criar tabela para assinaturas de usuários
CREATE TABLE public.user_subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'premium')),
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, plan_type)
);

-- Criar tabela para usuários admin
CREATE TABLE public.admin_users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    email TEXT NOT NULL,
    permissions JSONB DEFAULT '{"full_access": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas para analytics_events (apenas admins podem ver tudo)
CREATE POLICY "Admins can view all analytics events" 
    ON public.analytics_events 
    FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can insert analytics events" 
    ON public.analytics_events 
    FOR INSERT 
    WITH CHECK (true);

-- Políticas para user_subscriptions (usuários veem apenas seus dados, admins veem tudo)
CREATE POLICY "Users can view their own subscriptions" 
    ON public.user_subscriptions 
    FOR SELECT 
    USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own subscriptions" 
    ON public.user_subscriptions 
    FOR INSERT 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions" 
    ON public.user_subscriptions 
    FOR UPDATE 
    USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Políticas para admin_users (apenas admins podem ver)
CREATE POLICY "Admins can view admin users" 
    ON public.admin_users 
    FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_subscriptions_updated
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Inserir primeiro admin (substitua pelo email do criador)
INSERT INTO public.admin_users (user_id, email, permissions)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'dennervanes@hotmail.com' LIMIT 1),
    'dennervanes@hotmail.com',
    '{"full_access": true, "can_view_analytics": true, "can_manage_users": true}'::jsonb
);

-- Criar índices para performance
CREATE INDEX idx_analytics_events_type_date ON public.analytics_events(event_type, created_at);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
