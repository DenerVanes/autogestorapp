
import { Card, CardContent } from "@/components/ui/card";
import { Info, Clock, Calendar } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const WorkHoursInfoCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-blue-900 text-sm">
                Como Funciona o Registro de Horas
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
              Múltiplos registros no mesmo dia são somados automaticamente
            </p>

            {isExpanded && (
              <div className="mt-3 space-y-3 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Múltiplos Registros por Dia:</p>
                    <p>• Pode-se registrar mais de 1 vez no dia</p>
                    <p>• Exemplo: Manhã 06:00-10:00, Tarde 12:00-16:00, Noite 20:00-23:00</p>
                    <p>• Todos os registros serão somados entre início e fim</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Registro Atravessando Dias:</p>
                    <p>• Pode-se registrar início em um dia e fim no outro dia</p>
                    <p>• As horas serão calculadas no dia do registro inicial</p>
                    <p>• Exemplo: Início 23:00 (dia 8), Fim 03:00 (dia 9) = contabilizado no dia 8</p>
                  </div>
                </div>

                <div className="bg-blue-100 p-3 rounded-lg">
                  <p className="font-medium text-blue-900">Lembrete:</p>
                  <p>Registros que atravessam 04:00 são divididos automaticamente seguindo o padrão Uber para cálculo correto do "R$ por hora".</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkHoursInfoCard;
