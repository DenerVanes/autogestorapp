
import { Card, CardContent } from "@/components/ui/card";
import { Navigation, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OdometerSessionStatusProps {
  isOdometerInProgress: boolean;
  savedInitialReading: {
    date: Date;
    value: number;
    id: string;
    pair_id: string;
  } | null;
}

const OdometerSessionStatus = ({ 
  isOdometerInProgress, 
  savedInitialReading 
}: OdometerSessionStatusProps) => {
  if (!isOdometerInProgress || !savedInitialReading) return null;

  return (
    <Card className="mb-6 bg-orange-50 border-orange-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Navigation className="w-5 h-5 text-orange-600 mt-0.5" />
          </div>
          <div>
            <h4 className="font-semibold text-orange-800 mb-1">Registro em Andamento</h4>
            <div className="text-sm text-orange-700 space-y-1">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>
                  Iniciado em: {format(savedInitialReading.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4" />
                <span>Odômetro inicial: {savedInitialReading.value.toLocaleString()} km</span>
              </div>
            </div>
            <p className="text-xs text-orange-600 mt-2">
              Agora registre o odômetro final para concluir este ciclo.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OdometerSessionStatus;
