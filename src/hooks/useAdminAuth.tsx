
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  permissions: Record<string, boolean>;
}

export const useAdminAuth = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('=== VERIFICANDO STATUS DE ADMIN ===');
      
      if (!user) {
        console.log('Usuário não logado');
        setIsAdmin(false);
        setAdminData(null);
        setLoading(false);
        return;
      }

      try {
        console.log('Verificando status de admin para usuário:', {
          id: user.id,
          email: user.email
        });
        
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.log('Erro ou usuário não é admin:', error.message);
          setIsAdmin(false);
          setAdminData(null);
        } else {
          console.log('✅ USUÁRIO É ADMIN:', data);
          setIsAdmin(true);
          setAdminData({
            id: data.id,
            email: data.email,
            permissions: (data.permissions as Record<string, boolean>) || { full_access: true }
          });
        }
      } catch (error) {
        console.error('Erro ao verificar admin:', error);
        setIsAdmin(false);
        setAdminData(null);
      } finally {
        setLoading(false);
        console.log('=== FIM VERIFICAÇÃO ADMIN ===');
      }
    };

    checkAdminStatus();
  }, [user]);

  console.log('Hook useAdminAuth retornando:', {
    isAdmin,
    adminData: adminData?.email,
    loading,
    userId: user?.id
  });

  return { isAdmin, adminData, loading };
};
