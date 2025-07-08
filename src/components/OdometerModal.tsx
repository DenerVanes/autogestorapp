
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Navigation } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { OdometerRecord } from "@/types";
import { toast } from "sonner";

interface OdometerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OdometerModal = ({ isOpen, onClose }: OdometerModalProps) => {
  const { odometerRecords, addOdometerRecord } = useUser();
  const [data, setData] = useState<Date>(new Date());
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<'inicial' | 'final'>('inicial');
  const [cicloAbertoId, setCicloAbertoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Verifica se há algum ciclo aberto (inicial sem final)
  useEffect(() => {
    const ciclosAbertos = odometerRecords.filter(record => {
      if (record.type !== 'inicial') return false;
      
      // Verifica se tem final correspondente
      const temFinal = odometerRecords.some(r => 
        r.type === 'final' && 
        r.pair_id === record.pair_id
      );
      
      return !temFinal;
    });

    if (ciclosAbertos.length > 0) {
      // Pega o mais recente
      const maisRecente = ciclosAbertos.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      
      setCicloAbertoId(maisRecente.id);
      setTipo('final');
    } else {
      setCicloAbertoId(null);
      setTipo('inicial');
    }
  }, [odometerRecords]);

  const cicloAberto = cicloAbertoId ? odometerRecords.find(r => r.id === cicloAbertoId) : null;

  const handleSubmit = async () => {
    if (!valor) {
      toast.error("Digite o valor do odômetro");
      return;
    }

    const valorNum = parseInt(valor);
    
    try {
      setLoading(true);
      
      if (tipo === 'inicial') {
        // Cria novo ciclo inicial
        await addOdometerRecord({
          date: data,
          type: 'inicial',
          value: valorNum
        });
        
        toast.success("Odômetro inicial registrado! Agora registre o final quando terminar.");
        
        // Limpar apenas o valor, não fechar o modal
        setValor("");
      } else if (tipo === 'final' && cicloAberto) {
        // Valida se o final é maior que o inicial
        if (valorNum <= cicloAberto.value) {
          toast.error("O odômetro final deve ser maior que o inicial");
          return;
        }

        // Calcula distância
        const distancia = valorNum - cicloAberto.value;
        if (distancia > 500) {
          if (!window.confirm(`Distância muito alta (${distancia}km). Confirma?`)) {
            return;
          }
        }

        // Cria registro final usando o mesmo pair_id
        await addOdometerRecord({
          date: new Date(), // data atual para o final
          type: 'final',
          value: valorNum,
          pair_id: cicloAberto.pair_id
        });

        toast.success(`Ciclo finalizado! Distância: ${distancia}km`);
        
        // Fechar modal apenas ao finalizar um ciclo
        setValor("");
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar odômetro:', error);
      toast.error("Erro ao salvar registro");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setValor("");
    setData(new Date());
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            <span>Registro de Odômetro</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {cicloAberto ? (
            // Há ciclo aberto - mostrar formulário para final
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">Ciclo em Aberto</h4>
              <p className="text-sm text-yellow-700 mb-2">
                Inicial: {cicloAberto.value} km em {format(new Date(cicloAberto.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </p>
              <p className="text-sm text-yellow-700">
                Agora registre o odômetro final para fechar este ciclo.
              </p>
            </div>
          ) : (
            // Nenhum ciclo aberto - permitir escolher data para inicial
            <div className="space-y-2">
              <Label>Data</Label>
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
                    {format(data, "dd/MM/yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data}
                    onSelect={d => d && setData(d)}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="space-y-2">
            <Label>
              Odômetro {tipo === 'inicial' ? 'Inicial' : 'Final'} (km)
            </Label>
            <Input
              type="number"
              value={valor}
              placeholder={`Digite km ${tipo === 'inicial' ? 'inicial' : 'final'}`}
              onChange={e => setValor(e.target.value)}
              disabled={loading}
            />
            {cicloAberto && valor && (
              <p className="text-sm text-blue-600">
                Distância: {parseInt(valor) - cicloAberto.value} km
              </p>
            )}
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Salvando...' : `Salvar ${tipo === 'inicial' ? 'Inicial' : 'Final'}`}
          </Button>

          {/* Histórico do dia atual */}
          <div className="mt-6">
            <Label>Registros de Hoje</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {odometerRecords
                .filter(r => {
                  const recordDate = format(new Date(r.date), 'yyyy-MM-dd');
                  const today = format(new Date(), 'yyyy-MM-dd');
                  return recordDate === today;
                })
                .map(record => (
                  <div key={record.id} className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm">
                    <div>
                      <span className="font-medium">{format(new Date(record.date), "HH:mm")}</span>
                      <span className="ml-2">{record.type}: {record.value} km</span>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs",
                      record.type === 'inicial' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    )}>
                      {record.type}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OdometerModal;
