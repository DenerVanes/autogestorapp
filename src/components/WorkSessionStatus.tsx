
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WorkSessionStatusProps {
  isWorkInProgress: boolean;
  savedStartDateTime: Date | null;
}

const WorkSessionStatus = ({ isWorkInProgress, savedStartDateTime }: WorkSessionStatusProps) => {
  if (!isWorkInProgress || !savedStartDateTime) return null;

  return (
    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-sm text-green-800 font-medium">
        Jornada iniciada em:
      </p>
      <p className="text-sm text-green-700">
        {format(savedStartDateTime, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
      </p>
    </div>
  );
};

export default WorkSessionStatus;
