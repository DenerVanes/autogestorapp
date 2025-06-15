
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Clock, Zap, CreditCard } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { useState } from "react";

const SubscriptionBanner = () => {
  const { subscription, hasAccess, isExpired, daysRemaining, isTrial, createCheckout } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!subscription) return null;

  const handleUpgrade = async (planType: 'recurring' | 'pix') => {
    setLoading(true);
    try {
      const result = await createCheckout(planType);
      
      if (planType === 'pix' && result) {
        toast.success('Pagamento PIX criado! Use o código para pagamento.');
        // Aqui você pode mostrar o QR code ou código PIX
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (isExpired || !hasAccess) {
    return (
      <Alert className="mb-6 border-red-200 bg-red-50">
        <Crown className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {isTrial 
            ? `Seu período gratuito de 7 dias expirou. Assine o plano PRO para continuar criando lançamentos.`
            : `Sua assinatura PRO expirou. Renove para continuar com acesso completo.`
          }
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="ml-3 bg-green-600 hover:bg-green-700">
                <Crown className="mr-2 h-4 w-4" />
                Assine PRO
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Escolha seu Plano PRO
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <CreditCard className="h-5 w-5" />
                      Plano Recorrente
                    </CardTitle>
                    <CardDescription>
                      Renovação automática mensal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">R$ 29,90/mês</div>
                    <ul className="text-sm space-y-1 mb-4">
                      <li>✅ Acesso completo às funcionalidades</li>
                      <li>✅ Renovação automática</li>
                      <li>✅ Sem preocupação com vencimento</li>
                      <li>✅ Pode cancelar a qualquer momento</li>
                    </ul>
                    <Button 
                      onClick={() => handleUpgrade('recurring')}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      {loading ? 'Processando...' : 'Assinar com Cartão'}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <Crown className="h-5 w-5" />
                      Plano PIX
                    </CardTitle>
                    <CardDescription>
                      30 dias de acesso por pagamento
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">R$ 29,90</div>
                    <ul className="text-sm space-y-1 mb-4">
                      <li>✅ Acesso por 30 dias</li>
                      <li>✅ Pagamento via PIX</li>
                      <li>✅ Sem compromisso mensal</li>
                      <li>✅ Pague quando quiser usar</li>
                    </ul>
                    <Button 
                      onClick={() => handleUpgrade('pix')}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      {loading ? 'Processando...' : 'Pagar com PIX'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        </AlertDescription>
      </Alert>
    );
  }

  if (hasAccess && daysRemaining <= 7) {
    return (
      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <Clock className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          {isTrial 
            ? `Você tem ${daysRemaining} dias restantes no seu período gratuito.`
            : `Sua assinatura PRO expira em ${daysRemaining} dias.`
          }
          {(isTrial || subscription.plan_type === 'pro_pix') && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="ml-3 border-orange-300 text-orange-700 hover:bg-orange-100">
                  <Crown className="mr-2 h-4 w-4" />
                  {isTrial ? 'Assine PRO' : 'Renovar'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    {isTrial ? 'Escolha seu Plano PRO' : 'Renovar Assinatura'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700">
                        <CreditCard className="h-5 w-5" />
                        Plano Recorrente
                      </CardTitle>
                      <CardDescription>
                        Renovação automática mensal
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">R$ 29,90/mês</div>
                      <ul className="text-sm space-y-1 mb-4">
                        <li>✅ Acesso completo às funcionalidades</li>
                        <li>✅ Renovação automática</li>
                        <li>✅ Sem preocupação com vencimento</li>
                        <li>✅ Pode cancelar a qualquer momento</li>
                      </ul>
                      <Button 
                        onClick={() => handleUpgrade('recurring')}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        {loading ? 'Processando...' : 'Assinar com Cartão'}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <Crown className="h-5 w-5" />
                        Plano PIX
                      </CardTitle>
                      <CardDescription>
                        30 dias de acesso por pagamento
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">R$ 29,90</div>
                      <ul className="text-sm space-y-1 mb-4">
                        <li>✅ Acesso por 30 dias</li>
                        <li>✅ Pagamento via PIX</li>
                        <li>✅ Sem compromisso mensal</li>
                        <li>✅ Pague quando quiser usar</li>
                      </ul>
                      <Button 
                        onClick={() => handleUpgrade('pix')}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        {loading ? 'Processando...' : 'Pagar com PIX'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default SubscriptionBanner;
