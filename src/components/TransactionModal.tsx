
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, DollarSign, TrendingDown, Navigation } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TransactionModalProps {
  type: 'receita' | 'despesa' | 'odometro';
  isOpen: boolean;
  onClose: () => void;
}

const TransactionModal = ({ type, isOpen, onClose }: TransactionModalProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [observation, setObservation] = useState("");
  const [odometerType, setOdometerType] = useState("");

  const getModalConfig = () => {
    switch (type) {
      case 'receita':
        return {
          title: 'Nova Receita',
          icon: DollarSign,
          color: 'text-green-600',
          categories: ['Uber', '99', 'InDrive', 'Gorjetas', 'Corridas Particulares']
        };
      case 'despesa':
        return {
          title: 'Nova Despesa',
          icon: TrendingDown,
          color: 'text-red-600',
          categories: ['Combustível', 'Alimentação', 'Manutenção']
        };
      case 'odometro':
        return {
          title: 'Registrar Odômetro',
          icon: Navigation,
          color: 'text-blue-600',
          categories: []
        };
      default:
        return { title: '', icon: DollarSign, color: '', categories: [] };
    }
  };

  const config = getModalConfig();
  const IconComponent = config.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você salvaria os dados
    console.log({ type, date, value, category, fuelType, pricePerLiter, subcategory, observation, odometerType });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <IconComponent className={cn("w-5 h-5", config.color)} />
            <span>{config.title}</span>
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

          {/* Valor (para receita e despesa) */}
          {type !== 'odometro' && (
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>
          )}

          {/* Categoria (para receita e despesa) */}
          {type !== 'odometro' && (
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {config.categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Campos específicos para combustível */}
          {type === 'despesa' && category === 'Combustível' && (
            <>
              <div className="space-y-2">
                <Label>Tipo de Combustível</Label>
                <Select value={fuelType} onValueChange={setFuelType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasolina">Gasolina</SelectItem>
                    <SelectItem value="alcool">Álcool</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor por Litro (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={pricePerLiter}
                  onChange={(e) => setPricePerLiter(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* Campos específicos para manutenção */}
          {type === 'despesa' && category === 'Manutenção' && (
            <>
              <div className="space-y-2">
                <Label>Subcategoria</Label>
                <Select value={subcategory} onValueChange={setSubcategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a subcategoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="troca-oleo">Troca de Óleo</SelectItem>
                    <SelectItem value="pneu">Pneu</SelectItem>
                    <SelectItem value="pastilha">Pastilha</SelectItem>
                    <SelectItem value="geral">Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Observação</Label>
                <Input
                  placeholder="Descrição da manutenção..."
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Campos específicos para odômetro */}
          {type === 'odometro' && (
            <>
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
            </>
          )}

          {/* Botões */}
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className={cn(
                "flex-1",
                type === 'receita' && "bg-green-600 hover:bg-green-700",
                type === 'despesa' && "bg-red-600 hover:bg-red-700",
                type === 'odometro' && "bg-blue-600 hover:bg-blue-700"
              )}
            >
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
