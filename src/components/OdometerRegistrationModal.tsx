
import { Card } from "@/components/ui/card";
import { useOdometerRegistrationModal } from "@/hooks/useOdometerRegistrationModal";
import OdometerRegistrationModalContent from "./OdometerRegistrationModalContent";

interface OdometerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OdometerRegistrationModal = ({ isOpen, onClose }: OdometerRegistrationModalProps) => {
  const {
    date,
    setDate,
    odometerValue,
    setOdometerValue,
    isOdometerInProgress,
    savedInitialReading,
    handleStartOdometer,
    handleEndOdometer,
    handleCancelOdometer
  } = useOdometerRegistrationModal(isOpen);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOdometerInProgress) {
      handleStartOdometer();
    } else {
      const success = handleEndOdometer();
      if (success) {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <OdometerRegistrationModalContent
          isOdometerInProgress={isOdometerInProgress}
          savedInitialReading={savedInitialReading}
          date={date}
          odometerValue={odometerValue}
          onDateChange={setDate}
          onOdometerValueChange={setOdometerValue}
          onSubmit={handleSubmit}
          onClose={onClose}
          onCancelOdometer={handleCancelOdometer}
        />
      </Card>
    </div>
  );
};

export default OdometerRegistrationModal;
