
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

interface WorkHoursButtonsProps {
  isWorkInProgress: boolean;
  onCancel: () => void;
  onClose: () => void;
  onCancelWork: () => void;
}

const WorkHoursButtons = ({ 
  isWorkInProgress, 
  onCancel, 
  onClose, 
  onCancelWork 
}: WorkHoursButtonsProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      {isWorkInProgress && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancelWork}
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
  );
};

export default WorkHoursButtons;
