import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState(false);

  // Função para extrair token de diferentes fontes
  const extractToken = () => {
    // 1. Tentar pegar da query string (método padrão)
    let accessToken = searchParams.get('access_token');
    let type = searchParams.get('type');

    // 2. Se não encontrar, tentar pegar do hash fragment
    if (!accessToken) {
      const hash = window.location.hash;
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        accessToken = hashParams.get('access_token');
        type = hashParams.get('type');
      }
    }

    // 3. Tentar outros parâmetros que o Supabase pode usar
    if (!accessToken) {
      accessToken = searchParams.get('token') || searchParams.get('auth_token');
    }

    console.log('ResetPasswordPage: Token extraction:', {
      accessToken,
      type,
      hash: window.location.hash,
      searchParams: Object.fromEntries(searchParams.entries())
    });

    return { accessToken, type };
  };

  // Verificar token ao carregar a página
  useEffect(() => {
    const { accessToken, type } = extractToken();
    
    if (accessToken && type === 'recovery') {
      setToken(accessToken);
      setIsValidToken(true);
      console.log('ResetPasswordPage: Token válido encontrado');
    } else {
      console.log('ResetPasswordPage: Token inválido ou não encontrado');
      setIsValidToken(false);
      
      // Verificar se há erro no hash
      const hash = window.location.hash;
      if (hash.includes('error=')) {
        const errorParams = new URLSearchParams(hash.substring(1));
        const error = errorParams.get('error');
        const errorDescription = errorParams.get('error_description');
        
        if (error === 'access_denied' && errorDescription?.includes('expired')) {
          toast.error('Link de recuperação expirado. Solicite um novo link.');
        } else {
          toast.error('Token de redefinição inválido. Solicite um novo link.');
        }
      } else {
        toast.error('Token de redefinição inválido. Solicite um novo link.');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidToken || !token) {
      toast.error('Token de redefinição inválido. Solicite um novo link.');
      return;
    }

    if (!password || !confirmPassword) {
      toast.error('Preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      console.log('ResetPasswordPage: Tentando atualizar senha com token:', token);
      
      // Primeiro, verificar se conseguimos autenticar com o token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('ResetPasswordPage: Erro ao obter sessão:', sessionError);
      }
      
      // Tentar atualizar a senha
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error('ResetPasswordPage: Erro ao atualizar senha:', error);
        
        // Se o erro for relacionado ao token, tentar uma abordagem alternativa
        if (error.message.includes('token') || error.message.includes('expired')) {
          toast.error('Token de redefinição expirado ou inválido. Solicite um novo link.');
        } else {
          toast.error(error.message || 'Erro ao alterar senha.');
        }
      } else {
        toast.success('Senha alterada com sucesso! Faça login com sua nova senha.');
        navigate('/login');
      }
    } catch (err) {
      console.error('ResetPasswordPage: Erro inesperado:', err);
      toast.error('Erro ao alterar senha.');
    } finally {
      setLoading(false);
    }
  };

  // Se não há token válido, mostrar mensagem de erro
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Link Inválido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">
              O link de recuperação de senha é inválido ou expirou.
            </p>
            <Button 
              onClick={() => navigate('/login')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              Voltar para o Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Redefinir Senha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Nova senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage; 