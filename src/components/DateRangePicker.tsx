
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onApply: () => void;
}

const DateRangePicker = ({ dateRange, onDateRangeChange, onApply }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    if (dateRange?.from && dateRange?.to) {
      onApply();
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const isValidRange = dateRange?.from && dateRange?.to;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-white/80 min-h-[44px] md:min-h-auto"
          size="sm"
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          {dateRange?.from && dateRange?.to 
            ? `${format(dateRange.from, 'dd/MM', { locale: ptBR })} - ${format(dateRange.to, 'dd/MM', { locale: ptBR })}`
            : 'Período'
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50" align="end">
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Selecione o período:</label>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={1}
              locale={ptBR}
              weekStartsOn={0}
              className="rounded-md border pointer-events-auto bg-white"
              formatters={{
                formatWeekdayName: (date) => format(date, 'EEEEEE', { locale: ptBR }),
                formatMonthCaption: (date) => format(date, 'MMMM yyyy', { locale: ptBR }),
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleCancel}
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
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
