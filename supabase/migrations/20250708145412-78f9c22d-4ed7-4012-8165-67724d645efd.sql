
-- Criar tabela para armazenar as metas dos usuários
CREATE TABLE public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weekly_goal NUMERIC NOT NULL DEFAULT 1000,
  monthly_goal NUMERIC NOT NULL DEFAULT 4000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar Row Level Security (RLS)
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas suas próprias metas
CREATE POLICY "Users can view their own goals" 
  ON public.user_goals 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para que usuários criem suas próprias metas
CREATE POLICY "Users can create their own goals" 
  ON public.user_goals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para que usuários atualizem suas próprias metas
CREATE POLICY "Users can update their own goals" 
  ON public.user_goals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para que usuários deletem suas próprias metas
CREATE POLICY "Users can delete their own goals" 
  ON public.user_goals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar índice único para garantir que cada usuário tenha apenas um registro de metas
CREATE UNIQUE INDEX user_goals_user_id_unique ON public.user_goals(user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_goals_updated_at 
    BEFORE UPDATE ON public.user_goals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
