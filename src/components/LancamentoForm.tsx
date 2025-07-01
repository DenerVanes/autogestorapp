import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Lancamento } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";

interface LancamentoFormProps {
  onSaveInicial: (odometroInicial: number, data: Date) => void;
  onFinalizar: (lancamentoPendente: Lancamento, odometroFinal: number) => void;
  lancamentoPendente: Lancamento | null;
}

export function LancamentoForm({ onSaveInicial, onFinalizar, lancamentoPendente }: LancamentoFormProps) {
  const [odometroInicial, setOdometroInicial] = useState<string>("");
  const [odometroFinal, setOdometroFinal] = useState<string>("");
  const [data, setData] = useState<Date>(new Date());

  const handleSaveInicial = () => {
    if (odometroInicial) {
      // Create a new Date object with the selected date components to avoid timezone issues
      const selectedDate = new Date(data.getFullYear(), data.getMonth(), data.getDate());
      onSaveInicial(Number(odometroInicial), selectedDate);
      setOdometroInicial("");
    }
  };

  const handleFinalizar = () => {
    if (odometroFinal && lancamentoPendente) {
      onFinalizar(lancamentoPendente, Number(odometroFinal));
      setOdometroFinal("");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Registrar Odômetro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!lancamentoPendente ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Data do Registro</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data ? format(data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : <span>Escolha uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={data}
                    onSelect={(d) => d && setData(d)}
                    initialFocus
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="odometro-inicial">Odômetro Inicial</Label>
              <Input
                id="odometro-inicial"
                type="number"
                value={odometroInicial}
                onChange={(e) => setOdometroInicial(e.target.value)}
                placeholder="Ex: 45000"
              />
            </div>
            <Button onClick={handleSaveInicial} className="w-full">
              Salvar Inicial
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p>
              <strong>Lançamento Pendente:</strong> {lancamentoPendente.odometroInicial} km
            </p>
            <Label htmlFor="odometro-final">Odômetro Final</Label>
            <Input
              id="odometro-final"
              type="number"
              value={odometroFinal}
              onChange={(e) => setOdometroFinal(e.target.value)}
              placeholder="Ex: 45200"
            />
            <Button onClick={handleFinalizar} className="w-full">
              Finalizar Lançamento
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 