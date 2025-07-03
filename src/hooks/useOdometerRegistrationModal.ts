
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const useOdometerRegistrationModal = (isOpen: boolean) => {
  const { odometerRecords, addOdometerRecord } = useUser();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [odometerValue, setOdometerValue] = useState("");
  const [isOdometerInProgress, setIsOdometerInProgress] = useState(false);
  const [savedInitialReading, setSavedInitialReading] = useState<{
    date: Date;
    value: number;
    id: string;
    pair_id: string;
  } | null>(null);

  // Verifica se há algum ciclo aberto quando o modal abre
  useEffect(() => {
    if (!isOpen) return;

    // Procura por registros iniciais sem final correspondente
    const openCycles = odometerRecords.filter(record => {
      if (record.type !== 'inicial') return false;
      
      // Verifica se tem final correspondente
      const hasFinal = odometerRecords.some(r => 
        r.type === 'final' && 
        r.pair_id === record.pair_id
      );
      
      return !hasFinal;
    });

    if (openCycles.length > 0) {
      // Pega o mais recente
      const mostRecent = openCycles.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      
      setIsOdometerInProgress(true);
      setSavedInitialReading({
        date: mostRecent.date instanceof Date ? mostRecent.date : new Date(mostRecent.date),
        value: mostRecent.value,
        id: mostRecent.id,
        pair_id: mostRecent.pair_id || mostRecent.id
      });
      setOdometerValue("");
    } else {
      setIsOdometerInProgress(false);
      setSavedInitialReading(null);
      setOdometerValue("");
      setDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, [isOpen, odometerRecords]);

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
      
      await addOdometerRecord({
        date: now, // Usa horário atual para o final
        type: 'final',
        value: finalValue,
        pair_id: savedInitialReading.pair_id
      });

      const distance = finalValue - savedInitialReading.value;
      toast.success(`Ciclo finalizado! Distância: ${distance}km`);
      setOdometerValue("");
    } catch (error) {
      console.error('Erro ao salvar odômetro final:', error);
      toast.error("Erro ao salvar registro final");
    }
  };

  const handleCancelOdometer = () => {
    if (window.confirm("Tem certeza que deseja cancelar o registro em andamento?")) {
      setIsOdometerInProgress(false);
      setSavedInitialReading(null);
      setOdometerValue("");
      toast.info("Registro cancelado");
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
