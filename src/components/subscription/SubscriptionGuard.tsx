
import { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Calendar } from 'lucide-react';
import PricingModal from './PricingModal';
import { useState } from 'react';

interface SubscriptionGuardProps {
  children: ReactNode;
  feature?: string;
  showUpgrade?: boolean;
}

const SubscriptionGuard = ({ children, feature, showUpgrade = true }: SubscriptionGuardProps) => {
  const { status, can_edit, days_remaining, trial_end_date, loading } = useSubscription();
  const [showPricing, setShowPricing] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se pode editar, mostrar conteúdo
  if (can_edit) {
    return <>{children}</>;
  }

  // Se não pode editar, mostrar bloqueio
  return (
    <div className="space-y-4">
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-amber-600" />
          </div>
          <CardTitle className="text-amber-800">
            {status === 'trial' ? 'Período Gratuito Expirado' : 'Assinatura Necessária'}
          </CardTitle>
          <CardDescription className="text-amber-700">
            {status === 'trial' 
              ? `Seu período gratuito de 7 dias expirou. Para continuar ${feature ? `usando ${feature}` : 'criando e editando dados'}, faça uma assinatura.`
              : `Para acessar ${feature ? feature : 'esta funcionalidade'}, você precisa de uma assinatura ativa.`
            }
          </CardDescription>
        </CardHeader>
        
        {showUpgrade && (
          <CardContent className="text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-amber-700">
                <Calendar className="h-4 w-4" />
                <span>
                  {status === 'trial' && trial_end_date
                    ? `Trial expirou em ${new Date(trial_end_date).toLocaleDateString('pt-BR')}`
                    : 'Acesso limitado apenas para visualização'
                  }
                </span>
              </div>
              
              <Button 
                onClick={() => setShowPricing(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                <Crown className="h-4 w-4 mr-2" />
                Fazer Assinatura
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <PricingModal 
        isOpen={showPricing} 
        onClose={() => setShowPricing(false)} 
      />
    </div>
  );
};

export default SubscriptionGuard;
