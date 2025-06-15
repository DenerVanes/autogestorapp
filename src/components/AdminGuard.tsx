
import { ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AdminGuardProps {
  children: ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminAuth();

  // Aguardar carregamento completo
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Verificação dupla de segurança
  if (!user) {
    console.warn('Usuário não autenticado tentando acessar área admin');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin || user.email !== 'dennervanes@hotmail.com') {
    console.warn('Acesso negado ao painel admin para:', user.email);
    return <Navigate to="/" replace />;
  }

  console.log('Acesso autorizado ao painel admin para:', user.email);
  return <>{children}</>;
};

export default AdminGuard;
