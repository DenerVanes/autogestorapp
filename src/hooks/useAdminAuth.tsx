
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
        console.log('❌ Usuário não logado');
        setIsAdmin(false);
        setAdminData(null);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Verificando status de admin para usuário:', {
          id: user.id,
          email: user.email
        });
        
        // Buscar por user_id primeiro
        let { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .single();

        console.log('📊 Resultado da consulta por user_id:', { data, error });

        // Se não encontrou por user_id, tentar por email
        if (error && error.code === 'PGRST116') {
          console.log('🔄 Tentando buscar por email...');
          const emailResult = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', user.email)
            .single();
          
          console.log('📊 Resultado da consulta por email:', emailResult);
          data = emailResult.data;
          error = emailResult.error;
        }

        if (error && error.code !== 'PGRST116') {
          console.log('⚠️ Erro na consulta:', error.message);
          setIsAdmin(false);
          setAdminData(null);
        } else if (!data) {
          console.log('❌ Usuário não é admin - nenhum registro encontrado');
          console.log('💡 Para tornar-se admin, execute:');
          console.log(`INSERT INTO admin_users (user_id, email) VALUES ('${user.id}', '${user.email}');`);
          setIsAdmin(false);
          setAdminData(null);
        } else {
          console.log('✅ USUÁRIO É ADMIN! Dados:', data);
          setIsAdmin(true);
          setAdminData({
            id: data.id,
            email: data.email,
            permissions: (data.permissions as Record<string, boolean>) || { full_access: true }
          });
        }
      } catch (error) {
        console.error('💥 Erro ao verificar admin:', error);
        setIsAdmin(false);
        setAdminData(null);
      } finally {
        setLoading(false);
        console.log('=== FIM VERIFICAÇÃO ADMIN ===');
      }
    };

    checkAdminStatus();
  }, [user]);

  console.log('🔄 Hook useAdminAuth retornando:', {
    isAdmin,
    adminData: adminData?.email,
    loading,
    userId: user?.id,
    userEmail: user?.email
  });

  return { isAdmin, adminData, loading };
};
