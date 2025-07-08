
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
import { useFormPersistence } from "@/hooks/useFormPersistence";

interface OdometerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OdometerModal = ({ isOpen, onClose }: OdometerModalProps) => {
  const { odometerRecords, addOdometerRecord } = useUser();
  const [cicloAbertoId, setCicloAbertoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Usar persistência de formulário
  const { formData, updateFormData, clearSavedData } = useFormPersistence('odometer_modal', {
    data: new Date(),
    valor: "",
    tipo: 'inicial' as 'inicial' | 'final'
  });

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
      updateFormData({ tipo: 'final' });
    } else {
      setCicloAbertoId(null);
      updateFormData({ tipo: 'inicial' });
    }
  }, [odometerRecords, updateFormData]);

  const cicloAberto = cicloAbertoId ? odometerRecords.find(r => r.id === cicloAbertoId) : null;

  const handleSubmit = async () => {
    if (!formData.valor) {
      toast.error("Digite o valor do odômetro");
      return;
    }

    const valorNum = parseInt(formData.valor);
    
    try {
      setLoading(true);
      
      if (formData.tipo === 'inicial') {
        // Cria novo ciclo inicial
        await addOdometerRecord({
          date: formData.data,
          type: 'inicial',
          value: valorNum
        });
        
        toast.success("Odômetro inicial registrado! Agora registre o final quando terminar.");
        
        // Limpar apenas o valor, não fechar o modal
        updateFormData({ valor: "" });
      } else if (formData.tipo === 'final' && cicloAberto) {
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
        
        // Limpar dados salvos e fechar modal após finalizar o ciclo
        clearSavedData();
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar odômetro:', error);
      toast.error("Erro ao salvar registro");
    } finally {
      setLoading(false);
    }
  };

  // Limpar dados salvos quando modal é fechado pelo usuário
  const handleClose = () => {
    if (formData.tipo === 'final' && cicloAberto) {
      // Se tem ciclo aberto, não limpar os dados
      onClose();
    } else {
      // Se não tem ciclo aberto, pode limpar
      clearSavedData();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
                      !formData.data && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.data, "dd/MM/yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.data}
                    onSelect={d => d && updateFormData({ data: d })}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="space-y-2">
            <Label>
              Odômetro {formData.tipo === 'inicial' ? 'Inicial' : 'Final'} (km)
            </Label>
            <Input
              type="number"
              value={formData.valor}
              placeholder={`Digite km ${formData.tipo === 'inicial' ? 'inicial' : 'final'}`}
              onChange={e => updateFormData({ valor: e.target.value })}
              disabled={loading}
            />
            {cicloAberto && formData.valor && (
              <p className="text-sm text-blue-600">
                Distância: {parseInt(formData.valor) - cicloAberto.value} km
              </p>
            )}
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Salvando...' : `Salvar ${formData.tipo === 'inicial' ? 'Inicial' : 'Final'}`}
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
