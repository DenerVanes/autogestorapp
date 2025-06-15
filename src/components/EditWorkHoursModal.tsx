
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import type { WorkHoursRecord } from "@/types";

interface EditWorkHoursModalProps {
  record: WorkHoursRecord;
  isOpen: boolean;
  onClose: () => void;
}

const EditWorkHoursModal = ({ record, isOpen, onClose }: EditWorkHoursModalProps) => {
  const [startDate, setStartDate] = useState<Date>(record.startDateTime);
  const [startTime, setStartTime] = useState(format(record.startDateTime, 'HH:mm'));
  const [endDate, setEndDate] = useState<Date>(record.endDateTime);
  const [endTime, setEndTime] = useState(format(record.endDateTime, 'HH:mm'));

  const { updateWorkHours } = useUser();

  // Reset form when record changes
  useEffect(() => {
    setStartDate(record.startDateTime);
    setStartTime(format(record.startDateTime, 'HH:mm'));
    setEndDate(record.endDateTime);
    setEndTime(format(record.endDateTime, 'HH:mm'));
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${format(startDate, 'yyyy-MM-dd')}T${startTime}:00`);
    const endDateTime = new Date(`${format(endDate, 'yyyy-MM-dd')}T${endTime}:00`);

    if (endDateTime <= startDateTime) {
      alert('A data/hora de fim deve ser posterior à data/hora de início');
      return;
    }
    
    try {
      await updateWorkHours(record.id, {
        startDateTime,
        endDateTime
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar registro de horas:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span>Editar Registro de Horas</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data e Hora de Início */}
          <div className="space-y-2">
            <Label>Data e Hora de Início</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(newDate) => newDate && setStartDate(newDate)}
                    initialFocus
                    locale={ptBR}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Data e Hora de Fim */}
          <div className="space-y-2">
            <Label>Data e Hora de Fim</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(newDate) => newDate && setEndDate(newDate)}
                    initialFocus
                    locale={ptBR}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditWorkHoursModal;
