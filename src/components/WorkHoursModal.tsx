
import { Card } from "@/components/ui/card";
import { useWorkHoursModal } from "@/hooks/useWorkHoursModal";
import WorkHoursModalContent from "./WorkHoursModalContent";

interface WorkHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkHoursModal = ({ isOpen, onClose }: WorkHoursModalProps) => {
  const {
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    endDate,
    setEndDate,
    endTime,
    setEndTime,
    isWorkInProgress,
    savedStartDateTime,
    handleStartWork,
    handleEndWork,
    handleCancelWork
  } = useWorkHoursModal(isOpen);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isWorkInProgress) {
      handleStartWork();
    } else {
      const success = handleEndWork();
      if (success) {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <WorkHoursModalContent
          isWorkInProgress={isWorkInProgress}
          savedStartDateTime={savedStartDateTime}
          startDate={startDate}
          startTime={startTime}
          endDate={endDate}
          endTime={endTime}
          onStartDateChange={setStartDate}
          onStartTimeChange={setStartTime}
          onEndDateChange={setEndDate}
          onEndTimeChange={setEndTime}
          onSubmit={handleSubmit}
          onClose={onClose}
          onCancelWork={handleCancelWork}
        />
      </Card>
    </div>
  );
};

export default WorkHoursModal;
