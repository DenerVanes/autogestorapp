
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

interface OdometerButtonsProps {
  isOdometerInProgress: boolean;
  onCancel: () => void;
  onClose: () => void;
  onCancelOdometer: () => void;
}

const OdometerButtons = ({ 
  isOdometerInProgress, 
  onCancel, 
  onClose, 
  onCancelOdometer 
}: OdometerButtonsProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      {isOdometerInProgress && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancelOdometer}
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          Cancelar Registro
        </Button>
      )}
      <Button type="button" variant="outline" onClick={onClose}>
        Fechar
      </Button>
      <Button 
        type="submit" 
        className={`${
          isOdometerInProgress 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isOdometerInProgress ? (
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

export default OdometerButtons;
