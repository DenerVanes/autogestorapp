ALTER TABLE public.profiles ALTER COLUMN name DROP NOT NULL;

-- Adicionar políticas RLS para a tabela lancamento
ALTER TABLE public.lancamento ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (ler)
CREATE POLICY "Usuários podem ver os próprios registros de lancamento" 
ON public.lancamento FOR SELECT 
USING (auth.uid() = user_id);

-- Política para INSERT (criar)
CREATE POLICY "Usuários podem criar registros de lancamento" 
ON public.lancamento FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE (atualizar)
CREATE POLICY "Usuários podem atualizar os próprios registros de lancamento" 
ON public.lancamento FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Política para DELETE (deletar)
CREATE POLICY "Usuários podem deletar os próprios registros de lancamento" 
ON public.lancamento FOR DELETE 
USING (auth.uid() = user_id);

-- Função para buscar informações de assinatura do usuário
CREATE OR REPLACE FUNCTION get_user_subscription_info(user_id_param UUID)
RETURNS TABLE(plan_type TEXT, status TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT us.plan_type, us.status
  FROM user_subscriptions us
  WHERE us.user_id = user_id_param;
END;
$$;

-- Função para conceder acesso PRO
CREATE OR REPLACE FUNCTION grant_pro_access(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, plan_type, status, created_at, updated_at)
  VALUES (user_id_param, 'pro', 'active', NOW(), NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    plan_type = 'pro',
    status = 'active',
    updated_at = NOW();
END;
$$;

-- Função para remover acesso PRO
CREATE OR REPLACE FUNCTION remove_pro_access(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM user_subscriptions 
  WHERE user_id = user_id_param;
END;
$$;

-- Políticas para permitir que apenas o admin acesse as funções
GRANT EXECUTE ON FUNCTION get_user_subscription_info(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION grant_pro_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_pro_access(UUID) TO authenticated;
