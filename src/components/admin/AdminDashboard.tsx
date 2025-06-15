
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, UserCheck, TrendingUp, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminMetricCard from './AdminMetricCard';
import AdminChart from './AdminChart';
import { adminService, AdminStatistics, UserGrowthData, UserTypeDistribution } from '@/services/adminService';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [growthData, setGrowthData] = useState<UserGrowthData[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<UserTypeDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);
        
        const [stats, growth, distribution] = await Promise.all([
          adminService.getStatistics(),
          adminService.getUserGrowthData(),
          adminService.getUserTypeDistribution()
        ]);

        setStatistics(stats);
        setGrowthData(growth);
        setTypeDistribution(distribution);
      } catch (error) {
        console.error('Error loading admin data:', error);
        toast.error('Erro ao carregar dados administrativos');
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

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

  const conversionRate = statistics 
    ? ((statistics.active_subscribers / statistics.total_users) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard Administrativo</h1>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdminMetricCard
            title="Total de Usuários"
            value={statistics?.total_users || 0}
            icon={Users}
            description="Usuários cadastrados"
          />
          
          <AdminMetricCard
            title="Assinantes Ativos"
            value={statistics?.active_subscribers || 0}
            icon={UserCheck}
            description={`Taxa de conversão: ${conversionRate}%`}
          />
          
          <AdminMetricCard
            title="Novos Usuários (7 dias)"
            value={statistics?.new_users_7_days || 0}
            icon={TrendingUp}
            description="Últimos 7 dias"
          />
          
          <AdminMetricCard
            title="Novos Usuários (30 dias)"
            value={statistics?.new_users_30_days || 0}
            icon={Activity}
            description="Últimos 30 dias"
          />
        </div>

        {/* Gráficos */}
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
      </div>
    </div>
  );
};

export default AdminDashboard;
