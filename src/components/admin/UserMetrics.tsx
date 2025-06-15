
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX, TrendingUp, Calendar } from 'lucide-react';

interface UserMetricsProps {
  userStats: {
    totalUsers: number;
    paidUsers: number;
    freeUsers: number;
    recentSignups: number;
    monthlyRevenue: number;
  } | null;
}

const UserMetrics = ({ userStats }: UserMetricsProps) => {
  if (!userStats) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Usuários</CardTitle>
            <CardDescription>Carregando dados dos usuários...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const conversionRate = userStats.totalUsers > 0 
    ? (userStats.paidUsers / userStats.totalUsers) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários cadastrados na plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Pagantes</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userStats.paidUsers}</div>
            <p className="text-xs text-muted-foreground">
              {conversionRate.toFixed(1)}% de conversão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Gratuitos</CardTitle>
            <UserX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{userStats.freeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Potencial de conversão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Usuários</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userStats.recentSignups}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análise Detalhada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Usuários</CardTitle>
            <CardDescription>Análise da base de usuários por tipo de plano</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Usuários Pagantes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{userStats.paidUsers}</Badge>
                  <span className="text-sm text-gray-500">{conversionRate.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${conversionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium">Usuários Gratuitos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{userStats.freeUsers}</Badge>
                  <span className="text-sm text-gray-500">{(100 - conversionRate).toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${100 - conversionRate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas Financeiras</CardTitle>
            <CardDescription>Receita e potencial de crescimento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Receita Mensal Atual</span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-green-600">
                R$ {userStats.monthlyRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">
                Baseado em {userStats.paidUsers} assinantes ativos
              </p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Receita por usuário (ARPU)</span>
                <span className="font-medium">
                  R$ {userStats.paidUsers > 0 ? (userStats.monthlyRevenue / userStats.paidUsers).toFixed(2) : '0.00'}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Potencial se 100% pagantes</span>
                <span className="font-medium text-blue-600">
                  R$ {userStats.paidUsers > 0 ? ((userStats.monthlyRevenue / userStats.paidUsers) * userStats.totalUsers).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Insights e Oportunidades</CardTitle>
          <CardDescription>Análise automática baseada nos dados atuais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Crescimento Recente</h4>
              <p className="text-sm text-blue-700">
                {userStats.recentSignups} novos usuários na última semana. 
                {userStats.recentSignups > 5 
                  ? " Excelente taxa de crescimento!" 
                  : " Considere campanhas de marketing para aumentar aquisição."}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">Oportunidade de Conversão</h4>
              <p className="text-sm text-green-700">
                {userStats.freeUsers} usuários gratuitos representam potencial de 
                R$ {userStats.paidUsers > 0 ? ((userStats.monthlyRevenue / userStats.paidUsers) * userStats.freeUsers).toFixed(2) : '0.00'} 
                em receita adicional.
              </p>
            </div>

            {conversionRate < 5 && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-2">Taxa de Conversão Baixa</h4>
                <p className="text-sm text-orange-700">
                  Com {conversionRate.toFixed(1)}% de conversão, há espaço para melhorar a experiência do usuário
                  e a proposta de valor do plano pago.
                </p>
              </div>
            )}

            {conversionRate >= 10 && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Alta Performance</h4>
                <p className="text-sm text-purple-700">
                  Excelente taxa de conversão de {conversionRate.toFixed(1)}%! 
                  Continue focando na aquisição de novos usuários.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserMetrics;
