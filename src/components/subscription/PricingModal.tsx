
import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Check, Crown, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PricingModal = ({ isOpen, onClose }: PricingModalProps) => {
  const { createCheckout } = useSubscription();
  const [loading, setLoading] = useState<'card' | 'pix' | null>(null);

  const handleCheckout = async (paymentMethod: 'card' | 'pix') => {
    setLoading(paymentMethod);
    
    try {
      const checkoutUrl = await createCheckout(paymentMethod);
      
      if (checkoutUrl) {
        // Abrir Stripe em nova aba
        window.open(checkoutUrl, '_blank');
        onClose();
        toast.success('Redirecionando para o pagamento...');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setLoading(null);
    }
  };

  const features = [
    'Lançamentos ilimitados de receitas e despesas',
    'Controle completo de quilometragem',
    'Registro de horas trabalhadas',
    'Relatórios e métricas avançadas',
    'Gráficos de desempenho',
    'Histórico completo de transações',
    'Suporte prioritário'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            <div className="flex items-center justify-center space-x-2">
              <Crown className="h-6 w-6 text-amber-500" />
              <span>Plano Premium</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center">
            Escolha a forma de pagamento que preferir
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recursos incluídos */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <Check className="h-5 w-5 mr-2" />
                O que está incluído:
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-green-700">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Opções de pagamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cartão de Crédito */}
            <Card className="border-blue-200 hover:border-blue-400 transition-colors relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 hover:bg-blue-600">
                  <Zap className="h-3 w-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-800">Cartão de Crédito</CardTitle>
                <CardDescription>Assinatura recorrente mensal</CardDescription>
                <div className="text-3xl font-bold text-blue-900">
                  R$ 29,90
                  <span className="text-sm font-normal text-gray-600">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>✅ Renovação automática</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✅ Sem interrupções</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✅ Cancele quando quiser</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleCheckout('card')}
                  disabled={loading !== null}
                >
                  {loading === 'card' ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando...
                    </div>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Assinar com Cartão
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* PIX */}
            <Card className="border-green-200 hover:border-green-400 transition-colors">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <Smartphone className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-800">PIX</CardTitle>
                <CardDescription>Pagamento mensal avulso</CardDescription>
                <div className="text-3xl font-bold text-green-900">
                  R$ 29,90
                  <span className="text-sm font-normal text-gray-600">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>✅ Pagamento instantâneo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✅ 30 dias de acesso</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>📅 Renovação manual</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleCheckout('pix')}
                  disabled={loading !== null}
                >
                  {loading === 'pix' ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando...
                    </div>
                  ) : (
                    <>
                      <Smartphone className="h-4 w-4 mr-2" />
                      Pagar com PIX
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>💳 Pagamentos processados com segurança pelo Stripe</p>
            <p>🔒 Dados protegidos com criptografia SSL</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;
