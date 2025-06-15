
-- Habilita a Segurança em Nível de Linha (RLS) e adiciona políticas

-- Tabela de Perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver o próprio perfil" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários podem atualizar o próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Tabela de Transações
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar as próprias transações" ON public.transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tabela de Registros de Hodômetro
ALTER TABLE public.odometer_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar os próprios registros de hodômetro" ON public.odometer_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tabela de Horas Trabalhadas
ALTER TABLE public.work_hours_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar as próprias horas trabalhadas" ON public.work_hours_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tabela de Assinaturas de Usuário
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver a própria assinatura" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);

