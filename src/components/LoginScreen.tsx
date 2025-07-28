import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

const LoginScreen = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Login realizado com sucesso!");
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/reset-password'
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
        setShowResetModal(false);
        setResetEmail("");
      }
    } catch (err) {
      toast.error("Erro ao solicitar recuperação de senha.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/landing')}
            className="flex items-center min-w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          {/* Logo removido do header */}
          <div className="flex-1" />
          <Button 
            variant="outline" 
            onClick={() => navigate('/signup')}
            className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600 min-w-fit"
          >
            Criar Conta
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo e nome da ferramenta */}
          <div className="text-center mb-8">
            <img
              src="/nova-logo.png"
              alt="Logo Auto Gestor"
              className="inline-block w-16 h-16 rounded-full object-cover mb-4"
            />
            <h1 className="text-3xl font-bold text-orange-600">
              Auto Gestor APP
            </h1>
            <p className="text-muted-foreground mt-2">
              Controle financeiro inteligente
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle>Entrar na sua conta</CardTitle>
              <CardDescription>
                Acesse sua conta para continuar gerenciando suas finanças
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-all duration-300 py-6 text-lg rounded-2xl font-semibold"
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>

                <div className="flex justify-between items-center mt-2">
                  <span
                    className="text-sm text-orange-600 hover:text-orange-700 transition-colors cursor-pointer underline"
                    onClick={() => { console.log('Clicou em Recuperar senha'); setShowResetModal(true); }}
                    role="button"
                    tabIndex={0}
                  >
                    Recuperar senha
                  </span>
                </div>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Não tem uma conta? Cadastre-se gratuitamente
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Texto informativo */}
          <div className="mt-8 text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Controle sua vida financeira como motorista de aplicativo.</strong>
              <br />
              Acompanhe gastos, receitas, média por KM e tenha clareza total do seu lucro!
            </p>
          </div>
        </div>
      </div>

      {/* Modal de recuperação de senha - fora do Card para garantir renderização correta */}
      <Dialog open={showResetModal} onOpenChange={(open) => { console.log('Modal aberto?', open); setShowResetModal(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar senha</DialogTitle>
            <DialogDescription>
              Informe seu e-mail cadastrado. Você receberá um link para redefinir sua senha.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              type="email"
              placeholder="seu@email.com"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              required
              autoFocus
            />
            <DialogFooter>
              <Button type="submit" disabled={resetLoading} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                {resetLoading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginScreen;
