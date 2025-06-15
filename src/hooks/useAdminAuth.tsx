
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useAdminAuth = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Verificar se o email do usuário é o admin autorizado
      const adminEmail = 'dennervanes@hotmail.com';
      const userIsAdmin = user.email === adminEmail;
      
      setIsAdmin(userIsAdmin);
      setLoading(false);
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};
