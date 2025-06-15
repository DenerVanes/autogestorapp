
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Navigation } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import type { OdometerRecord } from "@/types";

interface EditOdometerModalProps {
  record: OdometerRecord;
  isOpen: boolean;
  onClose: () => void;
}

const EditOdometerModal = ({ record, isOpen, onClose }: EditOdometerModalProps) => {
  const [date, setDate] = useState<Date>(record.date);
  const [value, setValue] = useState(record.value.toString());
  const [odometerType, setOdometerType] = useState(record.type);

  const { updateOdometerRecord } = useUser();

  // Reset form when record changes
  useEffect(() => {
    setDate(record.date);
    setValue(record.value.toString());
    setOdometerType(record.type);
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateOdometerRecord(record.id, {
        date,
        type: odometerType as 'inicial' | 'final',
        value: parseInt(value)
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar registro de odômetro:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            <span>Editar Registro de Odômetro</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data */}
          <div className="space-y-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  locale={ptBR}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tipo de Registro */}
          <div className="space-y-2">
            <Label>Tipo de Registro</Label>
            <Select value={odometerType} onValueChange={setOdometerType} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inicial">Odômetro Inicial</SelectItem>
                <SelectItem value="final">Odômetro Final</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quilometragem */}
          <div className="space-y-2">
            <Label>Quilometragem</Label>
            <Input
              type="number"
              placeholder="000000"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          {/* Botões */}
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOdometerModal;
