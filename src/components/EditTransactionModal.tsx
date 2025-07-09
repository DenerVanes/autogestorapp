
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, DollarSign, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import type { Transaction } from "@/types";

interface EditTransactionModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

const EditTransactionModal = ({ transaction, isOpen, onClose }: EditTransactionModalProps) => {
  const [date, setDate] = useState<Date>(transaction.date);
  const [value, setValue] = useState(transaction.id ? transaction.value.toString() : "");
  const [category, setCategory] = useState(transaction.category);
  const [fuelType, setFuelType] = useState(transaction.fuelType || "");
  const [pricePerLiter, setPricePerLiter] = useState(transaction.pricePerLiter?.toString() || "");
  const [subcategory, setSubcategory] = useState(transaction.subcategory || "");
  const [observation, setObservation] = useState(transaction.observation || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateTransaction, addTransaction } = useUser();

  // Reset form when transaction changes
  useEffect(() => {
    if (isOpen) {
      setDate(transaction.date);
      setValue(transaction.id ? transaction.value.toString() : "");
      setCategory(transaction.category);
      setFuelType(transaction.fuelType || "");
      setPricePerLiter(transaction.pricePerLiter?.toString() || "");
      setSubcategory(transaction.subcategory || "");
      setObservation(transaction.observation || "");
      setIsSubmitting(false);
    }
  }, [transaction, isOpen]);

  const getModalConfig = () => {
    const isNewTransaction = !transaction.id;
    const action = isNewTransaction ? 'Nova' : 'Editar';
    
    switch (transaction.type) {
      case 'receita':
        return {
          title: `${action} Receita`,
          icon: DollarSign,
          color: 'text-green-600',
          categories: ['Uber', '99', 'InDrive', 'iFood', 'Gorjetas', 'Corridas Particulares']
        };
      case 'despesa':
        return {
          title: `${action} Despesa`,
          icon: TrendingDown,
          color: 'text-red-600',
          categories: [
            'Combustível',
            'Alimentação',
            'Manutenção',
            'IPVA',
            'Financiamento',
            'Aluguel Veículo',
            'Lava Rápido',
            'Seguro'
          ]
        };
      default:
        return { title: '', icon: DollarSign, color: '', categories: [] };
    }
  };

  const config = getModalConfig();
  const IconComponent = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    console.log('EditTransactionModal - handleSubmit chamado');
    setIsSubmitting(true);
    
    const transactionData = {
      type: transaction.type,
      date,
      value: parseFloat(value),
      category,
      ...(transaction.type === 'despesa' && category === 'Combustível' && {
        fuelType,
        pricePerLiter: parseFloat(pricePerLiter)
      }),
      ...(transaction.type === 'despesa' && category === 'Manutenção' && {
        subcategory,
        observation
      })
    };

    console.log('Transaction data to save:', transactionData);

    try {
      if (!transaction.id) {
        console.log('Criando nova transação...');
        await addTransaction(transactionData);
        console.log('Transação criada com sucesso!');
      } else {
        console.log('Editando transação existente...');
        await updateTransaction(transaction.id, transactionData);
        console.log('Transação editada com sucesso!');
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      alert('Erro ao salvar transação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
                  disabled={isSubmitting}
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

          {/* Valor */}
          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="Digite o valor"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory} required disabled={isSubmitting}>
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

          {/* Campos específicos para combustível */}
          {transaction.type === 'despesa' && category === 'Combustível' && (
            <>
              <div className="space-y-2">
                <Label>Tipo de Combustível</Label>
                <Select value={fuelType} onValueChange={setFuelType} required disabled={isSubmitting}>
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
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          {/* Campos específicos para manutenção */}
          {transaction.type === 'despesa' && category === 'Manutenção' && (
            <>
              <div className="space-y-2">
                <Label>Subcategoria</Label>
                <Select value={subcategory} onValueChange={setSubcategory} required disabled={isSubmitting}>
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
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          {/* Botões */}
          <div className="flex space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className={cn(
                "flex-1",
                transaction.type === 'receita' && "bg-green-600 hover:bg-green-700",
                transaction.type === 'despesa' && "bg-red-600 hover:bg-red-700"
              )}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionModal;
