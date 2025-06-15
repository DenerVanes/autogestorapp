
-- Remove o trigger antigo se existir
DROP TRIGGER IF EXISTS add_user_trial ON auth.users;

-- Cria o trigger para trial de 7 dias para cada novo usuário criado
CREATE TRIGGER add_user_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_trial();
