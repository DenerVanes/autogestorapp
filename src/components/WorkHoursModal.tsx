
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Clock, Play, Square } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUser } from "@/contexts/UserContext";
import WorkHoursInfoCard from "./WorkHoursInfoCard";

interface WorkHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkHoursModal = ({ isOpen, onClose }: WorkHoursModalProps) => {
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endTime, setEndTime] = useState('');
  const [isWorkInProgress, setIsWorkInProgress] = useState(false);
  const [savedStartDateTime, setSavedStartDateTime] = useState<Date | null>(null);
  const { addWorkHours } = useUser();

  useEffect(() => {
    // Check if there's a work session in progress
    const savedStart = localStorage.getItem('workStartDateTime');
    if (savedStart) {
      const startDateTime = new Date(savedStart);
      setSavedStartDateTime(startDateTime);
      setIsWorkInProgress(true);
      setStartDate(format(startDateTime, 'yyyy-MM-dd'));
      setStartTime(format(startDateTime, 'HH:mm'));
    }
  }, [isOpen]);

  const handleStartWork = () => {
    if (!startDate || !startTime) {
      alert('Por favor, preencha a data e hora de início');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    localStorage.setItem('workStartDateTime', startDateTime.toISOString());
    setSavedStartDateTime(startDateTime);
    setIsWorkInProgress(true);
  };

  const handleEndWork = () => {
    if (!savedStartDateTime) {
      alert('Não há jornada de trabalho iniciada');
      return;
    }

    if (!endDate || !endTime) {
      alert('Por favor, preencha a data e hora de fim');
      return;
    }

    const endDateTime = new Date(`${endDate}T${endTime}:00`);
    
    if (endDateTime <= savedStartDateTime) {
      alert('A data/hora de fim deve ser posterior à data/hora de início');
      return;
    }

    addWorkHours({
      startDateTime: savedStartDateTime,
      endDateTime
    });

    // Clear saved work session
    localStorage.removeItem('workStartDateTime');
    setSavedStartDateTime(null);
    setIsWorkInProgress(false);
    setStartTime('');
    setEndTime('');
    onClose();
  };

  const handleCancelWork = () => {
    localStorage.removeItem('workStartDateTime');
    setSavedStartDateTime(null);
    setIsWorkInProgress(false);
    setStartTime('');
    setEndTime('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isWorkInProgress) {
      handleStartWork();
    } else {
      handleEndWork();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span>
              {isWorkInProgress ? 'Finalizar Jornada' : 'Iniciar Jornada'}
            </span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Informativo sobre como funciona */}
          <WorkHoursInfoCard />

          {isWorkInProgress && savedStartDateTime && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                Jornada iniciada em:
              </p>
              <p className="text-sm text-green-700">
                {format(savedStartDateTime, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isWorkInProgress ? (
              <div className="space-y-2">
                <Label htmlFor="startDate">Data e Hora de Início</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    placeholder="HH:MM"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="endDate">Data e Hora de Fim</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    placeholder="HH:MM"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              {isWorkInProgress && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancelWork}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Cancelar Jornada
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button 
                type="submit" 
                className={`${
                  isWorkInProgress 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isWorkInProgress ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Finalizar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkHoursModal;
