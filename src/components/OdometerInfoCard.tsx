
import { Card, CardContent } from "@/components/ui/card";
import { Navigation, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const OdometerInfoCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-6 bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-blue-900 text-sm">
                Como Funciona o Registro de Odômetro
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 hover:text-blue-700 p-1 h-auto"
              >
                {isExpanded ? 'Minimizar' : 'Ver detalhes'}
              </Button>
            </div>
            
            <p className="text-blue-800 text-sm mt-1">
              Múltiplos ciclos no mesmo dia são somados automaticamente
            </p>

            {isExpanded && (
              <div className="mt-3 space-y-3 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <Navigation className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Múltiplos Ciclos por Dia:</p>
                    <p>• Pode-se registrar mais de 1 ciclo no dia</p>
                    <p>• Exemplo: Manhã 130-180km, Tarde 180-220km, Noite 220-250km</p>
                    <p>• Todos os ciclos serão somados e lançados como km rodado total</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Navigation className="w-4 h-4 mt-0.5 flex-shrink-0 rotate-45" />
                  <div>
                    <p className="font-medium">Ciclo Atravessando Dias:</p>
                    <p>• Pode-se registrar inicial em um dia e final no outro dia</p>
                    <p>• A quilometragem será calculada no dia do registro inicial</p>
                    <p>• Exemplo: Inicial 200km (dia 8), Final 250km (dia 9) = 50km contabilizados no dia 8</p>
                  </div>
                </div>

                <div className="bg-blue-100 p-3 rounded-lg">
                  <p className="font-medium text-blue-900">Como Usar:</p>
                  <p>• <strong>Inicial:</strong> Registre o km no início da jornada ou turno</p>
                  <p>• <strong>Final:</strong> Registre o km no final da jornada ou turno</p>
                  <p>• O horário é registrado automaticamente pelo sistema</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OdometerInfoCard;
