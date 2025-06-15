
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WorkHoursFormProps {
  isWorkInProgress: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  onStartDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}

const WorkHoursForm = ({
  isWorkInProgress,
  startDate,
  startTime,
  endDate,
  endTime,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange
}: WorkHoursFormProps) => {
  if (!isWorkInProgress) {
    return (
      <div className="space-y-2">
        <Label htmlFor="startDate">Data e Hora de Início</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            required
          />
          <Input
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            required
            placeholder="HH:MM"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="endDate">Data e Hora de Fim</Label>
      <div className="grid grid-cols-2 gap-2">
        <Input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          required
        />
        <Input
          type="time"
          value={endTime}
          onChange={(e) => onEndTimeChange(e.target.value)}
          required
          placeholder="HH:MM"
        />
      </div>
    </div>
  );
};

export default WorkHoursForm;
