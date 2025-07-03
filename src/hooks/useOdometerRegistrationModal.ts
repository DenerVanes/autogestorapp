
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
  } | null>(null);

  // Função para converter data UTC para horário do Brasil
  const convertToBrazilTime = (date: Date | string): Date => {
    const utcDate = typeof date === 'string' ? new Date(date) : date;
    // Subtrai 3 horas para converter de UTC para horário do Brasil
    const brazilTime = new Date(utcDate.getTime() - (3 * 60 * 60 * 1000));
    return brazilTime;
  };

  // Função para obter a data no formato brasileiro (DD/MM/YYYY)
  const getBrazilDateString = (date: Date | string): string => {
    const brazilDate = convertToBrazilTime(date);
    return format(brazilDate, 'yyyy-MM-dd');
  };

  // Verifica se há algum registro inicial sem final para a data selecionada
  useEffect(() => {
    if (!isOpen) return;

    console.log('=== VERIFICANDO REGISTROS ABERTOS PARA A DATA ===');
    console.log('Data selecionada:', date);
    console.log('Total de registros disponíveis:', odometerRecords.length);

    // Procura por registros iniciais na data selecionada que não têm final correspondente
    const openRecordsForDate = odometerRecords.filter(record => {
      if (record.type !== 'inicial') return false;
      
      const recordDate = getBrazilDateString(record.date);
      console.log(`Registro inicial ${record.id} - Data: ${recordDate}, Valor: ${record.value}`);
      
      if (recordDate !== date) return false;
      
      // Verifica se tem final correspondente na mesma data
      const hasFinal = odometerRecords.some(r => 
        r.type === 'final' && 
        getBrazilDateString(r.date) === date
      );
      
      console.log(`Registro inicial ${record.id} tem final na data ${date}? ${hasFinal}`);
      return !hasFinal;
    });

    console.log('Registros abertos encontrados para a data:', openRecordsForDate.length);

    if (openRecordsForDate.length > 0) {
      // Pega o mais recente
      const mostRecent = openRecordsForDate.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      
      console.log('Registro aberto mais recente:', {
        id: mostRecent.id,
        value: mostRecent.value,
        date: mostRecent.date
      });
      
      setIsOdometerInProgress(true);
      setSavedInitialReading({
        date: mostRecent.date instanceof Date ? mostRecent.date : new Date(mostRecent.date),
        value: mostRecent.value,
        id: mostRecent.id
      });
      setOdometerValue("");
    } else {
      console.log('Nenhum registro aberto encontrado para a data - limpando estado');
      setIsOdometerInProgress(false);
      setSavedInitialReading(null);
      setOdometerValue("");
    }
  }, [isOpen, odometerRecords, date]);

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
        value: finalValue
      });

      await addOdometerRecord({
        date: now, // Usa horário atual para o final
        type: 'final',
        value: finalValue
      });

      const distance = finalValue - savedInitialReading.value;
      toast.success(`Ciclo finalizado! Distância: ${distance}km`);
      
      // Limpa o estado após salvar
      setOdometerValue("");
      setIsOdometerInProgress(false);
      setSavedInitialReading(null);
    } catch (error) {
      console.error('Erro ao salvar odômetro final:', error);
      toast.error("Erro ao salvar registro final");
    }
  };

  const handleCancelOdometer = () => {
    if (window.confirm("Tem certeza que deseja cancelar o registro em andamento?")) {
      console.log('Cancelando registro em andamento');
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
