import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function SignUpForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Por favor, digite seu nome completo.");
      return;
    }
    if (!email.trim()) {
      toast.error("Por favor, digite o e-mail.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const emailRedirectTo = `${window.location.origin}/`;
      const { data, error } = await signUp(
        email,
        password,
        { name: name.trim() },
        emailRedirectTo
      );

      if (error) {
        if (error.message.includes('duplicate key value')) {
          toast.error("Já existe uma conta cadastrada com este email.");
        } else if (error.message.toLowerCase().includes('violates not-null constraint')) {
          toast.error("Erro no cadastro: dados obrigatórios ausentes.");
        } else if (error.message.toLowerCase().includes('trigger') && error.message.toLowerCase().includes('name')) {
          toast.error("Erro no cadastro: nome obrigatório, por favor preencha corretamente.");
        } else {
          toast.error(error.message || "Ocorreu um erro inesperado ao criar a conta.");
        }
      } else if (data.user) {
        // Initialize trial subscription for the new user
        try {
          console.log('Initializing trial for user:', data.user.id);
          const { error: trialError } = await supabase.functions.invoke('initialize-trial', {
            body: { userId: data.user.id }
          });

          if (trialError) {
            console.error('Error initializing trial:', trialError);
            // Don't show error to user since account was created successfully
            // Trial can be created later if needed
          } else {
            console.log('Trial initialized successfully');
          }
        } catch (trialError) {
          console.error('Error calling initialize-trial function:', trialError);
          // Don't show error to user since account was created successfully
        }

        toast.success("Conta criada com sucesso! Verifique seu e-mail para confirmar.");
      }
    } catch (error: any) {
      toast.error("Ocorreu um erro inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-all duration-300 py-6 text-lg rounded-2xl font-semibold"
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
  );
}
