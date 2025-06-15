
import { Clock } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import WorkHoursInfoCard from "./WorkHoursInfoCard";
import WorkSessionStatus from "./WorkSessionStatus";
import WorkHoursForm from "./WorkHoursForm";
import WorkHoursButtons from "./WorkHoursButtons";

interface WorkHoursModalContentProps {
  isWorkInProgress: boolean;
  savedStartDateTime: Date | null;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  onStartDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onCancelWork: () => void;
}

const WorkHoursModalContent = ({
  isWorkInProgress,
  savedStartDateTime,
  startDate,
  startTime,
  endDate,
  endTime,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  onSubmit,
  onClose,
  onCancelWork
}: WorkHoursModalContentProps) => {
  return (
    <>
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

        <form onSubmit={onSubmit} className="space-y-4">
          <WorkHoursForm
            isWorkInProgress={isWorkInProgress}
            startDate={startDate}
            startTime={startTime}
            endDate={endDate}
            endTime={endTime}
            onStartDateChange={onStartDateChange}
            onStartTimeChange={onStartTimeChange}
            onEndDateChange={onEndDateChange}
            onEndTimeChange={onEndTimeChange}
          />

          <WorkHoursButtons
            isWorkInProgress={isWorkInProgress}
            onCancel={onClose}
            onClose={onClose}
            onCancelWork={onCancelWork}
          />
        </form>
      </CardContent>
    </>
  );
};

export default WorkHoursModalContent;
