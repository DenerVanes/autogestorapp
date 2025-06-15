
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  Smartphone, 
  RefreshCw, 
  Settings,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useState } from 'react';
import PricingModal from './PricingModal';
import { toast } from 'sonner';

const SubscriptionStatus = () => {
  const { 
    status, 
    payment_method, 
    trial_end_date, 
    current_period_end,
    expires_at,
    days_remaining, 
    can_edit,
    loading,
    refreshSubscription,
    openCustomerPortal
  } = useSubscription();

  const [showPricing, setShowPricing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSubscription();
    setRefreshing(false);
    toast.success('Status atualizado!');
  };

  const handleOpenPortal = async () => {
    setOpeningPortal(true);
    try {
      const portalUrl = await openCustomerPortal();
      if (portalUrl) {
        window.open(portalUrl, '_blank');
      }
    } finally {
      setOpeningPortal(false);
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'trial':
        return {
          title: 'Período Gratuito',
          description: `${days_remaining || 0} dias restantes`,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock,
          badgeColor: 'bg-blue-600'
        };
      case 'active':
        return {
          title: 'Assinatura Ativa',
          description: payment_method === 'card' 
            ? 'Renovação automática' 
            : `Válida até ${expires_at ? new Date(expires_at).toLocaleDateString('pt-BR') : 'N/A'}`,
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          badgeColor: 'bg-green-600'
        };
      case 'past_due':
        return {
          title: 'Pagamento Pendente',
          description: 'Falha no último pagamento',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          badgeColor: 'bg-yellow-600'
        };
      case 'expired':
      case 'canceled':
        return {
          title: status === 'expired' ? 'Assinatura Expirada' : 'Assinatura Cancelada',
          description: 'Acesso limitado apenas para visualização',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: Crown,
          badgeColor: 'bg-red-600'
        };
      default:
        return {
          title: 'Status Desconhecido',
          description: 'Verificando...',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: RefreshCw,
          badgeColor: 'bg-gray-600'
        };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2">Verificando assinatura...</span>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <>
      <Card className={`${statusInfo.color} transition-all duration-200`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <StatusIcon className="h-6 w-6" />
              <div>
                <CardTitle className="text-lg">{statusInfo.title}</CardTitle>
                <CardDescription className="text-sm opacity-80">
                  {statusInfo.description}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={statusInfo.badgeColor}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              
              {payment_method && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  {payment_method === 'card' ? (
                    <CreditCard className="h-3 w-3" />
                  ) : (
                    <Smartphone className="h-3 w-3" />
                  )}
                  <span>{payment_method === 'card' ? 'Cartão' : 'PIX'}</span>
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Informações de datas */}
            {(trial_end_date || current_period_end || expires_at) && (
              <div className="flex items-center space-x-2 text-sm opacity-75">
                <Calendar className="h-4 w-4" />
                <span>
                  {status === 'trial' && trial_end_date && (
                    `Trial expira em: ${new Date(trial_end_date).toLocaleDateString('pt-BR')}`
                  )}
                  {status === 'active' && payment_method === 'card' && current_period_end && (
                    `Próxima cobrança: ${new Date(current_period_end).toLocaleDateString('pt-BR')}`
                  )}
                  {status === 'active' && payment_method === 'pix' && expires_at && (
                    `Acesso válido até: ${new Date(expires_at).toLocaleDateString('pt-BR')}`
                  )}
                </span>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Atualizando...' : 'Atualizar Status'}
              </Button>

              {status === 'active' && payment_method === 'card' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenPortal}
                  disabled={openingPortal}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {openingPortal ? 'Abrindo...' : 'Gerenciar Assinatura'}
                </Button>
              )}

              {(status === 'trial' || status === 'expired' || status === 'canceled' || 
                (status === 'active' && payment_method === 'pix')) && (
                <Button
                  size="sm"
                  onClick={() => setShowPricing(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  {status === 'active' && payment_method === 'pix' ? 'Renovar Acesso' : 'Fazer Assinatura'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <PricingModal 
        isOpen={showPricing} 
        onClose={() => setShowPricing(false)} 
      />
    </>
  );
};

export default SubscriptionStatus;
