
import { useSubscription } from './useSubscription';
import { toast } from 'sonner';

export const useAccessControl = () => {
  const { hasAccess, isTrial, isExpired, subscription } = useSubscription();

  /**
   * Verifica se o usuário pode acessar determinada ação.
   * - Se o trial expirou (>7 dias) ou assinatura acabou, bloqueia ações e mostra aviso.
   */
  const checkAccess = (action: string = 'esta funcionalidade') => {
    if (!hasAccess) {
      if (isTrial || (subscription && subscription.plan_type === 'trial')) {
        toast.error('Seu período gratuito expirou. Para continuar, faça a assinatura PRO!');
      } else {
        toast.error('Sua assinatura expirou. Renove seu plano PRO para continuar.');
      }
      return false;
    }
    return true;
  };

  /**
   * Envolve uma ação que requer acesso liberado.
   * Se não tiver acesso, exibe aviso e não executa a ação.
   */
  const requireAccess = (callback: () => void, action?: string) => {
    if (checkAccess(action)) {
      callback();
    }
  };

  return {
    hasAccess,
    checkAccess,
    requireAccess,
    subscription,
    isTrial,
    isExpired,
  };
};
