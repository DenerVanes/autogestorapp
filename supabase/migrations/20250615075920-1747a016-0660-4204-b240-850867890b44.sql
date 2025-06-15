
-- Remover todas as políticas existentes da tabela admin_users
DROP POLICY IF EXISTS "Users can view their own admin status" ON public.admin_users;
DROP POLICY IF EXISTS "Users can create admin entries" ON public.admin_users;
DROP POLICY IF EXISTS "Users can update admin entries" ON public.admin_users;
DROP POLICY IF EXISTS "Users can delete admin entries" ON public.admin_users;

-- Criar políticas corretas para evitar recursão infinita
-- Política para permitir que usuários vejam registros de admin (incluindo o próprio)
CREATE POLICY "Enable read access for authenticated users" 
ON public.admin_users 
FOR SELECT 
TO authenticated 
USING (true);

-- Política para permitir inserção apenas por admins ou sistema
CREATE POLICY "Enable insert for admins" 
ON public.admin_users 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Política para permitir atualização apenas por admins
CREATE POLICY "Enable update for admins" 
ON public.admin_users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Política para permitir exclusão apenas por admins
CREATE POLICY "Enable delete for admins" 
ON public.admin_users 
FOR DELETE 
TO authenticated 
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));
