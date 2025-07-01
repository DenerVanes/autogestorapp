import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { subscriptionService, UserSubscription } from "@/services/subscriptionService";
import { toast } from "sonner";
import { format } from "date-fns";

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  accessToken: string;
}

const ManageSubscriptionModal = ({ isOpen, onClose, userId, accessToken }: ManageSubscriptionModalProps) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      subscriptionService.getCurrentUserSubscription(userId)
        .then(setSubscription)
        .finally(() => setLoading(false));
    }
  }, [isOpen, userId]);

  const handleCancel = async () => {
    if (!window.confirm("Tem certeza que deseja cancelar sua assinatura PRO?")) return;
    setCanceling(true);
    try {
      const res = await fetch(
        "https://ymytximfmqcubhdvkruu.supabase.co/functions/v1/cancel-subscription",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Assinatura PRO cancelada com sucesso!");
        onClose();
      } else {
        toast.error("Erro ao cancelar assinatura: " + (data.error || "Tente novamente."));
      }
    } catch (err: any) {
      toast.error("Erro ao cancelar assinatura: " + err.message);
    } finally {
      setCanceling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Assinatura PRO</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center text-gray-500">Carregando...</div>
        ) : !subscription ? (
          <div className="py-8 text-center text-red-500">Assinatura não encontrada.</div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="font-semibold">Status:</span> {subscription.status}
            </div>
            <div>
              <span className="font-semibold">Plano:</span> {subscription.plan_type}
            </div>
            <div>
              <span className="font-semibold">Data de contratação:</span> {subscription.current_period_start ? format(new Date(subscription.current_period_start), 'dd/MM/yyyy') : '-'}
            </div>
            <div>
              <span className="font-semibold">Próxima renovação:</span> {subscription.current_period_end ? format(new Date(subscription.current_period_end), 'dd/MM/yyyy') : '-'}
            </div>
            <div>
              <span className="font-semibold">Valor:</span> {subscription.amount ? `R$ ${subscription.amount.toFixed(2)}` : '-'}
            </div>
            <div>
              <span className="font-semibold">Método de pagamento:</span> {subscription.payment_method || '-'}
            </div>
            <div className="pt-4">
              <Button variant="destructive" onClick={handleCancel} disabled={canceling} className="w-full">
                {canceling ? "Cancelando..." : "Cancelar Assinatura PRO"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ManageSubscriptionModal; 