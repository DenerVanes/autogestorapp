
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { processWorkHoursWithCutoff } from "@/utils/workHoursProcessor";
import type { WorkHoursRecord } from "@/types";

interface WorkHoursHistoryTabProps {
  onEditWorkHours: (record: WorkHoursRecord) => void;
  onDeleteWorkHours: (id: string) => void;
}

const WorkHoursHistoryTab = ({ onEditWorkHours, onDeleteWorkHours }: WorkHoursHistoryTabProps) => {
  const { workHours } = useUser();

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const formatWorkingDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const calculateWorkDuration = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}min`;
  };

  // Processar registros de horas para mostrar divisões automáticas
  const processedWorkHours = processWorkHoursWithCutoff(workHours);

  // Agrupar registros processados por registro original
  const groupedWorkHours = processedWorkHours.reduce((acc, record) => {
    if (!acc[record.originalId]) {
      acc[record.originalId] = [];
    }
    acc[record.originalId].push(record);
    return acc;
  }, {} as Record<string, typeof processedWorkHours>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-purple-600" />
          <span>Horas Trabalhadas</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(groupedWorkHours).map(([originalId, records]) => {
            const originalRecord = workHours.find(w => w.id === originalId);
            if (!originalRecord) return null;

            const hasMultipleRecords = records.length > 1;

            return (
              <div key={originalId} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                {/* Cabeçalho do registro original */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-purple-900">Jornada de Trabalho</h3>
                    {hasMultipleRecords && (
                      <div className="flex items-center space-x-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Dividido às 04:00</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEditWorkHours(originalRecord)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDeleteWorkHours(originalRecord.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Detalhes dos períodos */}
                <div className="space-y-2">
                  {records.map((record, index) => (
                    <div key={record.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-muted-foreground">
                            {hasMultipleRecords ? `Período ${index + 1}: ` : ''}
                            {formatDate(record.startDateTime)} - {formatDate(record.endDateTime)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-purple-600 font-medium">
                            {calculateWorkDuration(record.startDateTime, record.endDateTime)}
                          </span>
                          <div className="text-xs text-purple-500">
                            Contabilizado em: {formatWorkingDate(record.workingDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Duração total */}
                <div className="mt-2 pt-2 border-t border-purple-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-purple-700 font-medium">Duração total:</span>
                    <span className="text-purple-600 font-semibold">
                      {calculateWorkDuration(originalRecord.startDateTime, originalRecord.endDateTime)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {workHours.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhuma hora trabalhada registrada</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkHoursHistoryTab;
