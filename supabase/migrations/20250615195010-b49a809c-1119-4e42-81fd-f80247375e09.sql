
-- Verifique se existe um CHECK constraint para plan_type e remova-o se necessário.
ALTER TABLE public.user_subscriptions
  DROP CONSTRAINT IF EXISTS user_subscriptions_plan_type_check;

-- (Opcional) Se quiser garantir tipos válidos programaticamente, use um trigger de validação, não um CHECK constraint.

-- Você pode revisar o conteúdo do trigger initialize_user_trial() para garantir que o valor de plan_type seja sempre correto, como 'trial'.

-- Nenhum dado será perdido — essa alteração só remove a limitação do CHECK constraint.

