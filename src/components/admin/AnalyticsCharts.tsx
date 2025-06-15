
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AnalyticsChartsProps {
  metrics: {
    landingPageViews: number;
    signupClicks: number;
    subscriptionClicks: number;
    paymentsCompleted: number;
    signupsCompleted: number;
    loginAttempts: number;
    conversionRates: {
      signupRate: number;
      subscriptionRate: number;
      paymentRate: number;
    };
  } | null;
}

const AnalyticsCharts = ({ metrics }: AnalyticsChartsProps) => {
  if (!metrics) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Gráficos de Analytics</CardTitle>
            <CardDescription>Carregando dados dos gráficos...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Dados para gráfico de funil
  const funnelData = [
    { name: 'Landing Page', value: metrics.landingPageViews, color: '#3B82F6' },
    { name: 'Cliques Cadastro', value: metrics.signupClicks, color: '#10B981' },
    { name: 'Cliques Assinatura', value: metrics.subscriptionClicks, color: '#F59E0B' },
    { name: 'Pagamentos', value: metrics.paymentsCompleted, color: '#8B5CF6' },
  ];

  // Dados para gráfico de taxa de conversão
  const conversionData = [
    { name: 'Taxa de Cadastro', rate: metrics.conversionRates.signupRate },
    { name: 'Taxa de Interesse', rate: metrics.conversionRates.subscriptionRate },
    { name: 'Taxa de Pagamento', rate: metrics.conversionRates.paymentRate },
  ];

  // Dados simulados para gráfico temporal (últimos 7 dias)
  const timelineData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      views: Math.floor(metrics.landingPageViews / 7) + Math.floor(Math.random() * 10),
      signups: Math.floor(metrics.signupClicks / 7) + Math.floor(Math.random() * 3),
      payments: Math.floor(metrics.paymentsCompleted / 7) + Math.floor(Math.random() * 2),
    };
  });

  const chartConfig = {
    views: { label: 'Visualizações', color: '#3B82F6' },
    signups: { label: 'Cadastros', color: '#10B981' },
    payments: { label: 'Pagamentos', color: '#8B5CF6' },
  };

  return (
    <div className="space-y-6">
      {/* Gráfico de Funil */}
      <Card>
        <CardHeader>
          <CardTitle>Volume por Etapa do Funil</CardTitle>
          <CardDescription>Quantidade absoluta de usuários em cada etapa</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Taxa de Conversão */}
        <Card>
          <CardHeader>
            <CardTitle>Taxas de Conversão</CardTitle>
            <CardDescription>Percentual de conversão em cada etapa</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Taxa']}
                  />
                  <Bar dataKey="rate" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição do Funil</CardTitle>
            <CardDescription>Proporção visual de cada etapa</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={funnelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Temporal */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência dos Últimos 7 Dias</CardTitle>
          <CardDescription>Evolução temporal das principais métricas</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="signups" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="payments" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Resumo Estatístico */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Resumo Estatístico</CardTitle>
          <CardDescription>Principais indicadores de performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {((metrics.signupClicks / metrics.landingPageViews) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 mt-1">Taxa de Interesse Inicial</p>
              <p className="text-xs text-gray-500 mt-2">
                Usuários que demonstram interesse após visitar a landing page
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {((metrics.paymentsCompleted / metrics.landingPageViews) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 mt-1">Conversão Geral</p>
              <p className="text-xs text-gray-500 mt-2">
                Taxa de conversão da landing page até o pagamento
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.paymentsCompleted > 0 ? 
                  (metrics.subscriptionClicks / metrics.paymentsCompleted).toFixed(1) : '0'
                }x
              </div>
              <p className="text-sm text-gray-600 mt-1">Eficiência de Conversão</p>
              <p className="text-xs text-gray-500 mt-2">
                Quantos interessados são necessários por pagamento
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCharts;
