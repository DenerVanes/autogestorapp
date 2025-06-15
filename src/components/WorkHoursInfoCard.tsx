
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
              Jornadas são agrupadas seguindo o padrão Uber com corte às 04:00
            </p>

            {isExpanded && (
              <div className="mt-3 space-y-3 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Regra do Corte às 04:00:</p>
                    <p>• Horários até 04:00 da manhã são contabilizados no dia anterior</p>
                    <p>• Horários após 04:01 são contabilizados no dia atual</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Divisão Automática:</p>
                    <p>Registros que atravessam 04:00 são divididos automaticamente:</p>
                    <p>→ Até 04:00: contabilizado no dia anterior</p>
                    <p>→ Após 04:01: contabilizado no dia atual</p>
                  </div>
                </div>

                <div className="bg-blue-100 p-3 rounded-lg">
                  <p className="font-medium text-blue-900">Exemplo:</p>
                  <p>Trabalhou das 23:00 às 06:00</p>
                  <p>→ 23:00-04:00 = dia anterior</p>
                  <p>→ 04:01-06:00 = dia atual</p>
                </div>

                <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                  Esta lógica garante o cálculo correto do "R$ por hora" e alinhamento com o padrão da indústria.
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
