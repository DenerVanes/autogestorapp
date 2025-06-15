
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Eye, UserPlus, CreditCard, CheckCircle } from 'lucide-react';

interface ConversionFunnelProps {
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
  compact?: boolean;
}

const ConversionFunnel = ({ metrics, compact = false }: ConversionFunnelProps) => {
  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const funnelSteps = [
    {
      icon: Eye,
      title: 'Acessos à Landing Page',
      value: metrics.landingPageViews,
      percentage: 100,
      color: 'bg-blue-500',
      description: 'Visitantes únicos'
    },
    {
      icon: UserPlus,
      title: 'Cliques em "Criar Cadastro"',
      value: metrics.signupClicks,
      percentage: metrics.conversionRates.signupRate,
      color: 'bg-green-500',
      description: `${metrics.conversionRates.signupRate.toFixed(1)}% taxa de conversão`
    },
    {
      icon: CreditCard,
      title: 'Cliques em "Assinar Plano"',
      value: metrics.subscriptionClicks,
      percentage: metrics.conversionRates.subscriptionRate,
      color: 'bg-orange-500',
      description: `${metrics.conversionRates.subscriptionRate.toFixed(1)}% taxa de conversão`
    },
    {
      icon: CheckCircle,
      title: 'Pagamentos Efetivados',
      value: metrics.paymentsCompleted,
      percentage: metrics.conversionRates.paymentRate,
      color: 'bg-purple-500',
      description: `${metrics.conversionRates.paymentRate.toFixed(1)}% conversão final`
    }
  ];

  if (compact) {
    return (
      <div className="space-y-4">
        {funnelSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${step.color} text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{step.value}</p>
                <p className="text-xs text-gray-500">{step.percentage.toFixed(1)}%</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📈 Funil de Conversão - Últimos 30 Dias</CardTitle>
        <CardDescription>
          Acompanhe a jornada completa dos usuários desde o primeiro acesso até o pagamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {funnelSteps.map((step, index) => {
          const Icon = step.icon;
          const progressWidth = index === 0 ? 100 : (step.value / metrics.landingPageViews) * 100;
          
          return (
            <div key={index} className="relative">
              {/* Linha conectora */}
              {index < funnelSteps.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-200"></div>
              )}
              
              <div className="flex items-start gap-4 p-6 border-2 border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                <div className={`p-3 rounded-xl ${step.color} text-white flex-shrink-0`}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{step.value}</p>
                      {index > 0 && (
                        <p className="text-sm text-gray-500">{step.percentage.toFixed(1)}% conversão</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{step.description}</span>
                      <span className="font-medium">{progressWidth.toFixed(1)}% do tráfego total</span>
                    </div>
                    <Progress value={progressWidth} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Resumo Final */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Taxa de Cadastro</p>
              <p className="text-2xl font-bold text-blue-600">
                {metrics.conversionRates.signupRate.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Taxa de Interesse em Pagamento</p>
              <p className="text-2xl font-bold text-orange-600">
                {metrics.conversionRates.subscriptionRate.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Taxa de Conversão Final</p>
              <p className="text-2xl font-bold text-purple-600">
                {metrics.conversionRates.paymentRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionFunnel;
