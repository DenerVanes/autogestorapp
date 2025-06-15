
-- Remover políticas existentes se existirem e recriar
DROP POLICY IF EXISTS "select_own_pix_payments" ON public.pix_payments;
DROP POLICY IF EXISTS "update_pix_payments" ON public.pix_payments;
DROP POLICY IF EXISTS "insert_pix_payments" ON public.pix_payments;

-- Recriar políticas para pagamentos PIX
CREATE POLICY "select_own_pix_payments" ON public.pix_payments
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "update_pix_payments" ON public.pix_payments
FOR UPDATE
USING (true);

CREATE POLICY "insert_pix_payments" ON public.pix_payments
FOR INSERT
WITH CHECK (true);

-- Verificar se o trigger já existe antes de criar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recriar o trigger para novos usuários
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_trial();
