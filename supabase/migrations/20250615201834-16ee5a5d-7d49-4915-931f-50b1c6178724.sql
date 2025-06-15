
-- Remove todos os triggers que dependem da função initialize_user_trial
DROP TRIGGER IF EXISTS on_auth_user_trial_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS add_user_trial ON auth.users;

-- Agora remove a função sem dependências
DROP FUNCTION IF EXISTS public.initialize_user_trial();
