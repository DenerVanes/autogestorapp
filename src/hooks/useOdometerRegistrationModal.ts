
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const useOdometerRegistrationModal = (isOpen: boolean) => {
  const { odometerRecords, addOdometerRecord, deleteOdometerRecord } = useUser();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [odometerValue, setOdometerValue] = useState("");
  const [isOdometerInProgress, setIsOdometerInProgress] = useState(false);
  const [savedInitialReading, setSavedInitialReading] = useState<{
    date: Date;
    value: number;
    id: string;
    pair_id: string;
  } | null>(null);

  // Função para converter data UTC para horário do Brasil
  const convertToBrazilTime = (date: Date | string): Date => {
    const utcDate = typeof date === 'string' ? new Date(date) : date;
    // Adiciona 3 horas para converter de UTC para horário do Brasil
    const brazilTime = new Date(utcDate.getTime() + (3 * 60 * 60 * 1000));
    return brazilTime;
  };

  // Função para obter a data no formato brasileiro (DD/MM/YYYY)
  const getBrazilDateString = (date: Date | string): string => {
    const brazilDate = convertToBrazilTime(date);
    return format(brazilDate, 'yyyy-MM-dd');
  };

  // Verifica se há algum ciclo aberto quando o modal abre
  useEffect(() => {
    if (!isOpen) return;

    console.log('=== VERIFICANDO CICLOS ABERTOS ===');
    console.log('Total de registros disponíveis:', odometerRecords.length);

    // Procura por registros iniciais que não têm final correspondente
    const openCycles = odometerRecords.filter(record => {
      if (record.type !== 'inicial') return false;
      
      // Só considera registros que têm pair_id válido
      if (!record.pair_id) {
        console.log(`Registro inicial ${record.id} ignorado - sem pair_id`);
        return false;
      }
      
      // Verifica se tem final correspondente com o mesmo pair_id
      const hasFinal = odometerRecords.some(r => 
        r.type === 'final' && 
        r.pair_id === record.pair_id &&
        r.pair_id !== null // Garante que o pair_id não é null
      );
      
      console.log(`Registro inicial ${record.id} (pair_id: ${record.pair_id}): tem final? ${hasFinal}`);
      return !hasFinal;
    });

    console.log('Ciclos abertos encontrados:', openCycles.length);

    if (openCycles.length > 0) {
      // Pega o mais recente
      const mostRecent = openCycles.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      
      console.log('Ciclo aberto mais recente:', {
        id: mostRecent.id,
        value: mostRecent.value,
        pair_id: mostRecent.pair_id,
        date: mostRecent.date
      });
      
      setIsOdometerInProgress(true);
      setSavedInitialReading({
        date: mostRecent.date instanceof Date ? mostRecent.date : new Date(mostRecent.date),
        value: mostRecent.value,
        id: mostRecent.id,
        pair_id: mostRecent.pair_id || mostRecent.id
      });
      setOdometerValue("");
    } else {
      console.log('Nenhum ciclo aberto encontrado - limpando estado');
      setIsOdometerInProgress(false);
      setSavedInitialReading(null);
      setOdometerValue("");
      setDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, [isOpen, odometerRecords]);

  // Limpa o estado quando o modal fecha
  useEffect(() => {
    if (!isOpen) {
      console.log('Modal fechado - limpando estado');
      setIsOdometerInProgress(false);
      setSavedInitialReading(null);
      setOdometerValue("");
      setDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, [isOpen]);

  const handleStartOdometer = async () => {
    if (!odometerValue) {
      toast.error("Digite o valor do odômetro inicial");
      return;
    }

    try {
      const selectedDate = new Date(date + 'T00:00:00');
      const now = new Date();
      const finalDate = new Date(selectedDate.getTime());
      finalDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

      console.log('Registrando odômetro inicial:', {
        date: finalDate,
        value: parseInt(odometerValue)
      });

      await addOdometerRecord({
        date: finalDate,
        type: 'inicial',
        value: parseInt(odometerValue)
      });

      toast.success("Odômetro inicial registrado! Agora registre o final quando terminar.");
      setOdometerValue("");
    } catch (error) {
      console.error('Erro ao salvar odômetro inicial:', error);
      toast.error("Erro ao salvar registro inicial");
    }
  };

  const handleEndOdometer = () => {
    if (!odometerValue || !savedInitialReading) {
      toast.error("Digite o valor do odômetro final");
      return false;
    }

    const finalValue = parseInt(odometerValue);
    
    if (finalValue <= savedInitialReading.value) {
      toast.error("O odômetro final deve ser maior que o inicial");
      return false;
    }

    const distance = finalValue - savedInitialReading.value;
    if (distance > 500) {
      if (!window.confirm(`Distância muito alta (${distance}km). Confirma?`)) {
        return false;
      }
    }

    // Registra o final
    handleSaveFinal(finalValue);
    return true;
  };

  const handleSaveFinal = async (finalValue: number) => {
    if (!savedInitialReading) return;

    try {
      const now = new Date();
      
      console.log('Registrando odômetro final:', {
        date: now,
        value: finalValue,
        pair_id: savedInitialReading.pair_id
      });

      await addOdometerRecord({
        date: now, // Usa horário atual para o final
        type: 'final',
        value: finalValue,
        pair_id: savedInitialReading.pair_id
      });

      const distance = finalValue - savedInitialReading.value;
      toast.success(`Ciclo finalizado! Distância: ${distance}km`);
      
      // Limpa o estado após salvar
      setOdometerValue("");
      setIsOdometerInProgress(false);
      setSavedInitialReading(null);
      
      // Força refresh dos dados para atualizar cards e histórico
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Erro ao salvar odômetro final:', error);
      toast.error("Erro ao salvar registro final");
    }
  };

  const handleCancelOdometer = async () => {
    if (!savedInitialReading) return;
    
    if (window.confirm("Tem certeza que deseja cancelar o registro em andamento? Este registro inicial será excluído permanentemente.")) {
      try {
        console.log('Cancelando e deletando registro inicial:', savedInitialReading.id);
        
        // Deleta o registro inicial do Supabase
        await deleteOdometerRecord(savedInitialReading.id);
        
        // Limpa o estado local
        setIsOdometerInProgress(false);
        setSavedInitialReading(null);
        setOdometerValue("");
        setDate(format(new Date(), "yyyy-MM-dd"));
        
        toast.success("Registro cancelado e excluído com sucesso");
      } catch (error) {
        console.error('Erro ao cancelar registro:', error);
        toast.error("Erro ao cancelar registro");
      }
    }
  };

  return {
    date,
    setDate,
    odometerValue,
    setOdometerValue,
    isOdometerInProgress,
    savedInitialReading,
    handleStartOdometer,
    handleEndOdometer,
    handleCancelOdometer
  };
};
