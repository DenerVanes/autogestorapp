
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  isOpen: boolean;
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onApply: () => void;
  onClose: () => void;
}

const DateRangePicker = ({ 
  isOpen, 
  dateRange, 
  onDateRangeChange, 
  onApply, 
  onClose 
}: DateRangePickerProps) => {
  const handleApply = () => {
    if (dateRange?.from && dateRange?.to) {
      onApply();
    }
  };

  const isValidRange = dateRange?.from && dateRange?.to;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecione o período personalizado</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={1}
            locale={ptBR}
            weekStartsOn={0}
            className="rounded-md border pointer-events-auto bg-white mx-auto"
            formatters={{
              formatWeekdayName: (date) => format(date, 'EEEEEE', { locale: ptBR }),
              formatMonthCaption: (date) => format(date, 'MMMM yyyy', { locale: ptBR }),
            }}
          />
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleApply}
              className="flex-1"
              disabled={!isValidRange}
            >
              Aplicar filtro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DateRangePicker;
