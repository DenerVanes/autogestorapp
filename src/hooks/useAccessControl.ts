
import { useSubscription } from './useSubscription';
import { toast } from 'sonner';

export const useAccessControl = () => {
  const { hasAccess, isTrial, subscription } = useSubscription();

  const checkAccess = (action: string = 'esta funcionalidade') => {
    if (!hasAccess) {
      if (isTrial) {
        toast.error('Seu período gratuito expirou. Assine o plano PRO para continuar usando a ferramenta.');
      } else {
        toast.error('Sua assinatura expirou. Renove seu plano PRO para continuar.');
      }
      return false;
    }
    return true;
  };

  const requireAccess = (callback: () => void, action?: string) => {
    if (checkAccess(action)) {
      callback();
    }
  };

  return {
    hasAccess,
    checkAccess,
    requireAccess,
    subscription
  };
};
