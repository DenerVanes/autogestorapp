
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (password !== confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }

      if (password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        return;
      }

      const { error } = await signUp(email, password, { name });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Conta criada com sucesso! Verifique seu email para confirmar.");
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Auto Gestor APP
            </h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/login')}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Fazer Login
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Teste Grátis por 7 Dias
            </h2>
            <p className="text-gray-600">
              Crie sua conta e comece a controlar suas finanças agora mesmo
            </p>
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <p className="text-green-800 font-medium">
                ✅ Sem cartão de crédito • ✅ Cancele quando quiser
              </p>
            </div>
          </div>

          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle>Criar Conta Gratuita</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para começar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      className="pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
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
                      placeholder="Mínimo 6 caracteres"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Digite a senha novamente"
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all duration-300 py-6 text-lg"
                >
                  {isLoading ? "Criando conta..." : "COMEÇAR TESTE GRÁTIS"}
                </Button>

                <div className="text-center text-sm text-gray-500">
                  Ao criar uma conta, você concorda com nossos termos de uso
                </div>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Já tem uma conta? Faça login
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong className="text-gray-900">Junte-se a centenas de motoristas</strong>
              <br />
              que já transformaram sua gestão financeira com o Auto Gestor APP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
