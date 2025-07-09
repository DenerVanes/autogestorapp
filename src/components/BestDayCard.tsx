import React, { useState, useMemo } from "react";
import { Calendar, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { calculateBestDay, formatDayName, BestDayData } from "@/utils/bestDayCalculator";

interface BestDayCardProps {
  className?: string;
}

const BestDayCard: React.FC<BestDayCardProps> = ({ className }) => {
  const { transactions, odometerRecords, workHours } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const bestDayData: BestDayData = useMemo(() => {
    return calculateBestDay(transactions, odometerRecords, workHours);
  }, [transactions, odometerRecords, workHours]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderMainContent = () => {
    if (!bestDayData.hasEnoughData) {
      return (
        <div className="text-center">
          <div className="text-2xl font-bold text-muted-foreground mb-2">
            Dados insuficientes
          </div>
          <div className="text-sm text-muted-foreground">
            Trabalhe mais dias para ver sua análise
          </div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600 mb-2">
          {formatDayName(bestDayData.bestDay!)}
        </div>
        <div className="text-sm text-muted-foreground">
          Baseado nos últimos 3 meses
        </div>
      </div>
    );
  };

  const renderDetailedModal = () => {
    const validDays = bestDayData.allDays
      .filter(day => day.diasTrabalhados >= 3 && day.pontuacao > 0)
      .sort((a, b) => b.pontuacao - a.pontuacao);

    return (
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Ranking dos Melhores Dias para Trabalhar
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {validDays.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Não há dados suficientes para análise. 
                Trabalhe pelo menos 3 dias em cada dia da semana nos últimos 3 meses.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {validDays.map((day, index) => (
                <div 
                  key={day.dayName}
                  className={`p-4 rounded-lg border ${
                    index === 0 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-card border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <h3 className="font-semibold text-lg">
                        {formatDayName(day.dayName)}
                      </h3>
                      {index === 0 && (
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {day.diasTrabalhados} dias trabalhados
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="font-medium text-green-600">Lucro Médio</div>
                      <div className="text-lg font-bold">{formatCurrency(day.lucroMedio)}</div>
                      <div className="text-xs text-muted-foreground">40% do peso</div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium text-blue-600">R$ por KM</div>
                      <div className="text-lg font-bold">{formatCurrency(day.rsPorKmMedio)}</div>
                      <div className="text-xs text-muted-foreground">30% do peso</div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium text-purple-600">R$ por Hora</div>
                      <div className="text-lg font-bold">{formatCurrency(day.rsPorHoraMedio)}</div>
                      <div className="text-xs text-muted-foreground">30% do peso</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Pontuação Total:
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {day.pontuacao.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Como calculamos
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• <strong>Lucro Médio:</strong> (Receita - Gasto Combustível) ÷ Dias trabalhados (40%)</p>
              <p>• <strong>R$ por KM:</strong> Receita Total ÷ KM Rodado (30%)</p>
              <p>• <strong>R$ por Hora:</strong> Receita Total ÷ Horas Trabalhadas (30%)</p>
              <p>• Consideramos apenas dias com pelo menos 3 registros nos últimos 3 meses</p>
            </div>
          </div>
        </div>
      </DialogContent>
    );
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card className={`cursor-pointer hover:shadow-md transition-shadow ${className}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Melhor Dia para Trabalhar
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderMainContent()}
          </CardContent>
        </Card>
      </DialogTrigger>
      {renderDetailedModal()}
    </Dialog>
  );
};

export default BestDayCard;