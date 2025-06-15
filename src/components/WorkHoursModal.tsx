
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Clock } from "lucide-react";
import { format } from "date-fns";
import { useUser } from "@/contexts/UserContext";
import WorkHoursInfoCard from "./WorkHoursInfoCard";
import WorkSessionStatus from "./WorkSessionStatus";
import WorkHoursForm from "./WorkHoursForm";
import WorkHoursButtons from "./WorkHoursButtons";

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
          <WorkHoursInfoCard />

          <WorkSessionStatus 
            isWorkInProgress={isWorkInProgress}
            savedStartDateTime={savedStartDateTime}
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            <WorkHoursForm
              isWorkInProgress={isWorkInProgress}
              startDate={startDate}
              startTime={startTime}
              endDate={endDate}
              endTime={endTime}
              onStartDateChange={setStartDate}
              onStartTimeChange={setStartTime}
              onEndDateChange={setEndDate}
              onEndTimeChange={setEndTime}
            />

            <WorkHoursButtons
              isWorkInProgress={isWorkInProgress}
              onCancel={onClose}
              onClose={onClose}
              onCancelWork={handleCancelWork}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkHoursModal;
