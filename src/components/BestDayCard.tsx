
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, TrendingUp, Clock, Route, DollarSign } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { calculateBestDay } from '@/utils/bestDayCalculator';
import { cn } from '@/lib/utils';

const BestDayCard = () => {
  const { transactions, workHours, odometerRecords, loading } = useUser();
  const [showDetails, setShowDetails] = useState(false);

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-muted-foreground">Melhor Dia para Trabalhar</p>
              </div>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
            <div className="p-3 rounded-full bg-green-50">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const bestDayResult = calculateBestDay(transactions, workHours, odometerRecords);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogTrigger asChild>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-muted-foreground">Melhor Dia para Trabalhar</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {bestDayResult.dadosSuficientes ? bestDayResult.melhorDia : 'Dados insuficientes'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {bestDayResult.dadosSuficientes 
                      ? 'Baseado nos últimos 3 meses' 
                      : 'Trabalhe mais dias para análise'
                    }
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-50">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Análise Completa dos Dias da Semana
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {bestDayResult.dadosSuficientes ? (
                <>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      Seu melhor dia é {bestDayResult.melhorDia}
                    </h3>
                    <p className="text-sm text-green-600">
                      Baseado em análise dos últimos 3 meses
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Ranking Completo:</h4>
                    {bestDayResult.ranking.map((day, index) => (
                      <div 
                        key={day.dayNumber} 
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all",
                          index === 0 
                            ? "border-green-200 bg-green-50" 
                            : "border-gray-200 bg-white"
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                              index === 0 
                                ? "bg-green-600 text-white" 
                                : "bg-gray-300 text-gray-600"
                            )}>
                              {index + 1}
                            </span>
                            <h5 className="font-semibold text-gray-800">{day.dayName}</h5>
                          </div>
                          <span className="text-sm text-gray-600">
                            {day.diasTrabalhados} dia{day.diasTrabalhados !== 1 ? 's' : ''} trabalhado{day.diasTrabalhados !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <div>
                              <p className="text-gray-600">Lucro Médio</p>
                              <p className="font-semibold text-green-600">
                                {formatCurrency(day.lucroMedio)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Route className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="text-gray-600">R$ por KM</p>
                              <p className="font-semibold text-blue-600">
                                {formatCurrency(day.rsPorKmMedio)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <div>
                              <p className="text-gray-600">R$ por Hora</p>
                              <p className="font-semibold text-purple-600">
                                {formatCurrency(day.rsPorHoraMedio)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">Como calculamos:</p>
                    <p>• Lucro Médio: (Receita - Gasto Combustível) ÷ Dias Trabalhados (40% do peso)</p>
                    <p>• R$ por KM: Receita Total ÷ KM Rodados (30% do peso)</p>
                    <p>• R$ por Hora: Receita Total ÷ Horas Trabalhadas (30% do peso)</p>
                    <p className="mt-2">* Consideramos apenas dias com pelo menos 3 registros nos últimos 3 meses</p>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Dados Insuficientes para Análise
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Você precisa trabalhar mais dias para que possamos identificar seu melhor dia da semana.
                  </p>
                  <div className="text-sm text-gray-600 bg-white p-4 rounded-lg">
                    <p className="font-medium mb-2">Para ativar esta análise:</p>
                    <p>• Trabalhe pelo menos 3 dias em cada dia da semana</p>
                    <p>• Registre receitas, gastos e horas trabalhadas</p>
                    <p>• Dados dos últimos 3 meses são considerados</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
};

export default BestDayCard;
