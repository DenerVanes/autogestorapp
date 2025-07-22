
import { Car, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function SignUpHeader() {
  const navigate = useNavigate();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center min-w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center space-x-2 min-w-0 flex-1 justify-center">
          <img
            src="/nova-logo.png"
            alt="Logo Auto Gestor"
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/login')}
          className="border-blue-600 text-blue-600 hover:bg-blue-50 min-w-fit"
        >
          Fazer Login
        </Button>
      </div>
    </header>
  )
}

