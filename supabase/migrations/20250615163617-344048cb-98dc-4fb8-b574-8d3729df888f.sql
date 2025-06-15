
-- Primeiro, vamos garantir que temos uma view para estatísticas administrativas
CREATE OR REPLACE VIEW admin_statistics AS
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM user_subscriptions WHERE status = 'active') as active_subscribers,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_7_days,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30_days,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '1 day') as daily_active_users,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days') as monthly_active_users;

-- Criar uma view para dados do gráfico de crescimento de usuários
CREATE OR REPLACE VIEW user_growth_chart AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_users,
  SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as total_users
FROM profiles 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- Criar uma view para distribuição de tipos de usuário
CREATE OR REPLACE VIEW user_type_distribution AS
SELECT 
  CASE 
    WHEN us.plan_type IS NOT NULL AND us.status = 'active' THEN 'Premium'
    ELSE 'Gratuito'
  END as user_type,
  COUNT(*) as count
FROM profiles p
LEFT JOIN user_subscriptions us ON p.id = us.user_id AND us.status = 'active'
GROUP BY user_type;

-- Garantir que o usuário admin tenha acesso às views
GRANT SELECT ON admin_statistics TO authenticated;
GRANT SELECT ON user_growth_chart TO authenticated;
GRANT SELECT ON user_type_distribution TO authenticated;
