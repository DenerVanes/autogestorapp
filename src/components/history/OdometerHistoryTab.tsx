
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation, Edit2, Trash2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { OdometerRecord } from "@/types";

interface OdometerHistoryTabProps {
  onEditOdometerRecord: (record: OdometerRecord) => void;
  onDeleteOdometerRecord: (id: string) => void;
}

const OdometerHistoryTab = ({ onEditOdometerRecord, onDeleteOdometerRecord }: OdometerHistoryTabProps) => {
  const { odometerRecords } = useUser();

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          <span>Registros de Odômetro</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {odometerRecords.map((record) => (
            <div key={record.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">{record.type === 'inicial' ? 'Odômetro Inicial' : 'Odômetro Final'}</p>
                <p className="text-sm text-muted-foreground">{formatDate(record.date)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-blue-600">{record.value} km</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEditOdometerRecord(record)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onDeleteOdometerRecord(record.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {odometerRecords.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhum registro de odômetro</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OdometerHistoryTab;
