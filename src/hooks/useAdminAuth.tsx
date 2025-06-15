
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

      // Verificação rigorosa do email do admin
      const adminEmail = 'dennervanes@hotmail.com';
      const userIsAdmin = user.email?.toLowerCase().trim() === adminEmail.toLowerCase().trim();
      
      console.log('Admin check:', {
        userEmail: user.email,
        adminEmail,
        isAdmin: userIsAdmin
      });
      
      setIsAdmin(userIsAdmin);
      setLoading(false);
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};
