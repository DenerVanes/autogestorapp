
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "lucide-react";

const OdometerInfoCard = () => {
  return (
    <Card className="mb-6 bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Navigation className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Como funciona o registro de odômetro:</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Inicial:</strong> Registre o km no início da jornada</li>
              <li>• <strong>Final:</strong> Registre o km no final da jornada</li>
              <li>• A quilometragem será calculada automaticamente</li>
              <li>• O horário é registrado automaticamente pelo sistema</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OdometerInfoCard;
