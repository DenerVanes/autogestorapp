import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, UserCheck, TrendingUp, TrendingDown, DollarSign, Activity, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminMetricCard from './AdminMetricCard';
import AdminChart from './AdminChart';
import { adminService, AdminKpiSummary, UserGrowthData, UserTypeDistribution } from '@/services/adminService';
import { toast } from 'sonner';
// import AdminRecentUsersTable from './AdminRecentUsersTable';
// import AdminRecentProSubscribersTable from './AdminRecentProSubscribersTable';
// import AdminConversionFunnel from './AdminConversionFunnel';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [kpiSummary, setKpiSummary] = useState<AdminKpiSummary | null>(null);
  const [growthData, setGrowthData] = useState<UserGrowthData[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<UserTypeDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.email !== 'dennervanes@hotmail.com') {
      toast.error('Acesso negado');
      navigate('/');
      return;
    }

    const loadAdminData = async () => {
      try {
        setLoading(true);
        const [summary, growth, distribution] = await Promise.all([
          adminService.getKpiSummary(),
          adminService.getUserGrowthData(),
          adminService.getUserTypeDistribution()
        ]);

        setKpiSummary(summary);
        setGrowthData(growth);
        setTypeDistribution(distribution);
        
        toast.success('Dados administrativos carregados');
      } catch (error) {
        console.error('Error loading admin data:', error);
        toast.error('Erro ao carregar dados administrativos');
        if (error instanceof Error && error.message.includes('Acesso negado')) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard Administrativo</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard Administrativo</h1>
          </div>
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <Shield className="w-4 h-4" />
            <span>Acesso Autorizado: {user?.email}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AdminMetricCard
            title="Usuários Registrados"
            value={kpiSummary?.total_users || 0}
            icon={Users}
            description="Total de usuários na plataforma"
          />
          <AdminMetricCard
            title="Usuários Ativos (7 dias)"
            value={kpiSummary?.active_users_7_days || 0}
            icon={Activity}
            description="Usuários com atividade recente"
          />
          <AdminMetricCard
            title="Usuários PRO Ativos"
            value={kpiSummary?.active_pro_users || 0}
            icon={UserCheck}
            description="Total de assinantes com plano PRO"
          />
          <AdminMetricCard
            title="Cancelamentos (Mês)"
            value={kpiSummary?.canceled_this_month || 0}
            icon={TrendingDown}
            description="Usuários que cancelaram no mês atual"
          />
          <AdminMetricCard
            title="Receita Atual (Mês)"
            value={formatCurrency(kpiSummary?.current_monthly_revenue || 0)}
            icon={DollarSign}
            description="Receita mensal recorrente (MRR)"
          />
          <AdminMetricCard
            title="Previsão Receita (M+1)"
            value={formatCurrency(kpiSummary?.next_month_revenue_forecast || 0)}
            icon={TrendingUp}
            description="Previsão de receita para o próximo mês"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminChart
            title="Crescimento de Usuários"
            data={growthData}
            type="line"
            dataKey="total_users"
            xAxisKey="date"
          />
          <AdminChart
            title="Distribuição de Usuários"
            data={typeDistribution}
            type="pie"
            dataKey="count"
            nameKey="user_type"
          />
        </div>

        {/* Tabela de Usuários Recentes */}
        {/* <AdminRecentUsersTable /> */}

        {/* Tabela de Assinantes PRO Recentes */}
        {/* <AdminRecentProSubscribersTable /> */}

        {/* Funil de Conversão */}
        {/* <AdminConversionFunnel /> */}
      </div>
    </div>
  );
};

export default AdminDashboard;
