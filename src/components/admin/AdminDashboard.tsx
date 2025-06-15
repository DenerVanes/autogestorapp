
import { useState } from 'react';
import { ArrowLeft, Users, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConversionFunnel from './ConversionFunnel';
import UserMetrics from './UserMetrics';
import AnalyticsCharts from './AnalyticsCharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const { metrics, userStats, loading, refetch } = useAnalytics();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-sm text-gray-500">
                  {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            <Button onClick={refetch} variant="outline">
              Atualizar Dados
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="funnel">Funil de Conversão</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {userStats?.recentSignups || 0} novos esta semana
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Pagantes</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats?.paidUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {userStats?.freeUsers || 0} usuários gratuitos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {(userStats?.monthlyRevenue || 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Assinantes ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversão Geral</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.conversionRates.paymentRate.toFixed(1) || '0.0'}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Visitantes → Pagamentos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Resumo do Funil */}
            <Card>
              <CardHeader>
                <CardTitle>Funil de Conversão - Últimos 30 Dias</CardTitle>
                <CardDescription>
                  Acompanhe a jornada dos usuários desde a landing page até o pagamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConversionFunnel metrics={metrics} compact />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funnel">
            <ConversionFunnel metrics={metrics} />
          </TabsContent>

          <TabsContent value="users">
            <UserMetrics userStats={userStats} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsCharts metrics={metrics} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
