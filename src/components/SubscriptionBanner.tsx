
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

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await createCheckout('recurring');
      setIsOpen(false);
    } catch (error: any) {
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
            ? `Período gratuito expirou. Assine o PRO para continuar.`
            : `Assinatura expirou. Renove o PRO para continuar.`
          }
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="ml-3 bg-green-600 hover:bg-green-700">
                <Crown className="mr-2 h-4 w-4" />
                Assine PRO
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Plano PRO
                </DialogTitle>
              </DialogHeader>
              
              <div className="mt-4">
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <CreditCard className="h-5 w-5" />
                      Plano PRO - Recorrente
                    </CardTitle>
                    <CardDescription>
                      Renovação automática mensal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">R$ 19,90/mês</div>
                    <ul className="text-sm space-y-1 mb-4">
                      <li>✅ Acesso completo às funcionalidades</li>
                      <li>✅ Renovação automática</li>
                      <li>✅ Sem preocupação com vencimento</li>
                      <li>✅ Pode cancelar a qualquer momento</li>
                    </ul>
                    <Button 
                      onClick={handleUpgrade}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      {loading ? 'Processando...' : 'Assinar Agora'}
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
          {isTrial && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="ml-3 border-orange-300 text-orange-700 hover:bg-orange-100">
                  <Crown className="mr-2 h-4 w-4" />
                  Assine PRO
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    Assine o Plano PRO
                  </DialogTitle>
                </DialogHeader>
                
                <div className="mt-4">
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700">
                        <CreditCard className="h-5 w-5" />
                        Plano PRO - Recorrente
                      </CardTitle>
                      <CardDescription>
                        Renovação automática mensal
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">R$ 19,90/mês</div>
                      <ul className="text-sm space-y-1 mb-4">
                        <li>✅ Acesso completo às funcionalidades</li>
                        <li>✅ Renovação automática</li>
                        <li>✅ Sem preocupação com vencimento</li>
                        <li>✅ Pode cancelar a qualquer momento</li>
                      </ul>
                      <Button 
                        onClick={handleUpgrade}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        {loading ? 'Processando...' : 'Assinar Agora'}
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
