
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OdometerFormProps {
  isOdometerInProgress: boolean;
  date: string;
  odometerValue: string;
  savedInitialReading: {
    date: Date;
    value: number;
    id: string;
  } | null;
  onDateChange: (value: string) => void;
  onOdometerValueChange: (value: string) => void;
}

const OdometerForm = ({
  isOdometerInProgress,
  date,
  odometerValue,
  savedInitialReading,
  onDateChange,
  onOdometerValueChange
}: OdometerFormProps) => {
  const calculateDistance = () => {
    if (!savedInitialReading || !odometerValue) return null;
    const final = parseInt(odometerValue);
    if (isNaN(final)) return null;
    return final - savedInitialReading.value;
  };

  const distance = calculateDistance();

  if (!isOdometerInProgress) {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="odometerDate">Data do Registro</Label>
          <Input
            id="odometerDate"
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="odometerInitial">Odômetro Inicial (km)</Label>
          <Input
            id="odometerInitial"
            type="number"
            value={odometerValue}
            onChange={(e) => onOdometerValueChange(e.target.value)}
            required
            placeholder="Ex: 125000"
          />
        </div>
      </>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="odometerFinal">Odômetro Final (km)</Label>
      <Input
        id="odometerFinal"
        type="number"
        value={odometerValue}
        onChange={(e) => onOdometerValueChange(e.target.value)}
        required
        placeholder="Ex: 125150"
      />
      {distance !== null && (
        <div className={`text-sm p-2 rounded ${
          distance > 0 
            ? 'text-green-700 bg-green-50' 
            : 'text-red-700 bg-red-50'
        }`}>
          Quilometragem: {distance} km
        </div>
      )}
    </div>
  );
};

export default OdometerForm;
