
import { Car, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function SignUpHeader() {
  const navigate = useNavigate();

  return (
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
          <img
            src="/nova-logo.png"
            alt="Logo Auto Gestor"
            className="w-8 h-8 rounded-full object-cover"
          />
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
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
  )
}

