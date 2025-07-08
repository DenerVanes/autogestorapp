
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Play, Square } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WorkHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkHoursModal = ({ isOpen, onClose }: WorkHoursModalProps) => {
  const { workHours, addWorkHours } = useUser();
  const [isWorking, setIsWorking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  // Verifica se há alguma sessão de trabalho em aberto
  useEffect(() => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    const openSession = workHours.find(record => {
      const recordDate = format(new Date(record.startDateTime), 'yyyy-MM-dd');
      return recordDate === todayStr && !record.endDateTime;
    });

    if (openSession) {
      setIsWorking(true);
      setStartTime(new Date(openSession.startDateTime));
    } else {
      setIsWorking(false);
      setStartTime(null);
    }
  }, [workHours]);

  const handleStartWork = async () => {
    try {
      setLoading(true);
      const now = new Date();
      
      await addWorkHours({
        startDateTime: now,
        endDateTime: null // Sessão aberta
      });
      
      setIsWorking(true);
      setStartTime(now);
      toast.success("Expediente iniciado!");
      
      // Não fechar o modal, deixar aberto para o usuário finalizar quando quiser
    } catch (error) {
      console.error('Erro ao iniciar expediente:', error);
      toast.error("Erro ao iniciar expediente");
    } finally {
      setLoading(false);
    }
  };

  const handleEndWork = async () => {
    if (!startTime) return;

    try {
      setLoading(true);
      const now = new Date();
      
      // Encontrar a sessão aberta de hoje
      const today = format(new Date(), 'yyyy-MM-dd');
      const openSession = workHours.find(record => {
        const recordDate = format(new Date(record.startDateTime), 'yyyy-MM-dd');
        return recordDate === today && !record.endDateTime;
      });

      if (openSession) {
        // Atualizar com data/hora de fim
        await addWorkHours({
          startDateTime: new Date(openSession.startDateTime),
          endDateTime: now
        });
        
        const duration = Math.round((now.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 100)) / 100;
        toast.success(`Expediente finalizado! Duração: ${duration.toFixed(2)}h`);
        
        setIsWorking(false);
        setStartTime(null);
        
        // Fechar modal após finalizar o expediente
        onClose();
      }
    } catch (error) {
      console.error('Erro ao finalizar expediente:', error);
      toast.error("Erro ao finalizar expediente");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDuration = () => {
    if (!startTime) return "00:00:00";
    
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Atualizar o cronômetro a cada segundo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isWorking && startTime) {
      interval = setInterval(() => {
        // Forçar re-render para atualizar o cronômetro
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorking, startTime]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Controle de Horas</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-center">
          {isWorking ? (
            <>
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Expediente em Andamento
                </h3>
                <p className="text-sm text-green-700 mb-4">
                  Iniciado às {startTime && format(startTime, "HH:mm:ss", { locale: ptBR })}
                </p>
                <div className="text-3xl font-mono text-green-700 mb-4">
                  {getCurrentDuration()}
                </div>
              </div>
              
              <Button 
                onClick={handleEndWork}
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                <Square className="w-4 h-4 mr-2" />
                {loading ? 'Finalizando...' : 'Finalizar Expediente'}
              </Button>
            </>
          ) : (
            <>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Pronto para Iniciar
                </h3>
                <p className="text-sm text-blue-700">
                  Clique no botão abaixo para começar a contabilizar suas horas de trabalho.
                </p>
              </div>
              
              <Button 
                onClick={handleStartWork}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                <Play className="w-4 h-4 mr-2" />
                {loading ? 'Iniciando...' : 'Iniciar Expediente'}
              </Button>
            </>
          )}

          {/* Histórico do dia */}
          <div className="mt-6 text-left">
            <h4 className="font-medium mb-3">Registros de Hoje</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {workHours
                .filter(record => {
                  const recordDate = format(new Date(record.startDateTime), 'yyyy-MM-dd');
                  const today = format(new Date(), 'yyyy-MM-dd');
                  return recordDate === today && record.endDateTime;
                })
                .map(record => {
                  const start = new Date(record.startDateTime);
                  const end = new Date(record.endDateTime!);
                  const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 100)) / 100;
                  
                  return (
                    <div key={record.id} className="flex justify-between bg-gray-50 rounded p-2 text-sm">
                      <span>
                        {format(start, "HH:mm", { locale: ptBR })} - {format(end, "HH:mm", { locale: ptBR })}
                      </span>
                      <span className="font-medium">{duration.toFixed(2)}h</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkHoursModal;
