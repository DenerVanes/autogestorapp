
import { Navigation, X } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OdometerInfoCard from "./OdometerInfoCard";
import OdometerSessionStatus from "./OdometerSessionStatus";
import OdometerForm from "./OdometerForm";
import OdometerButtons from "./OdometerButtons";

interface OdometerRegistrationModalContentProps {
  isOdometerInProgress: boolean;
  savedInitialReading: {
    date: Date;
    value: number;
    id: string;
  } | null;
  date: string;
  odometerValue: string;
  onDateChange: (value: string) => void;
  onOdometerValueChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onCancelOdometer: () => void;
}

const OdometerRegistrationModalContent = ({
  isOdometerInProgress,
  savedInitialReading,
  date,
  odometerValue,
  onDateChange,
  onOdometerValueChange,
  onSubmit,
  onClose,
  onCancelOdometer
}: OdometerRegistrationModalContentProps) => {
  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          <span>
            {isOdometerInProgress ? 'Finalizar Registro' : 'Iniciar Registro'}
          </span>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <OdometerInfoCard />

        <OdometerSessionStatus 
          isOdometerInProgress={isOdometerInProgress}
          savedInitialReading={savedInitialReading}
        />

        <form onSubmit={onSubmit} className="space-y-4">
          <OdometerForm
            isOdometerInProgress={isOdometerInProgress}
            date={date}
            odometerValue={odometerValue}
            savedInitialReading={savedInitialReading}
            onDateChange={onDateChange}
            onOdometerValueChange={onOdometerValueChange}
          />

          <OdometerButtons
            isOdometerInProgress={isOdometerInProgress}
            onCancel={onClose}
            onClose={onClose}
            onCancelOdometer={onCancelOdometer}
          />
        </form>
      </CardContent>
    </>
  );
};

export default OdometerRegistrationModalContent;
