import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, DollarSign, TrendingDown, Navigation, Clock, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import EditTransactionModal from "./EditTransactionModal";
import EditOdometerModal from "./EditOdometerModal";
import EditWorkHoursModal from "./EditWorkHoursModal";
import { processWorkHoursWithCutoff } from "@/utils/workHoursProcessor";
import type { Transaction, OdometerRecord, WorkHoursRecord } from "@/types";

interface HistoryPageProps {
  onBack: () => void;
}

const HistoryPage = ({ onBack }: HistoryPageProps) => {
  const { 
    transactions, 
    odometerRecords, 
    workHours,
    deleteTransaction,
    deleteOdometerRecord,
    deleteWorkHours
  } = useUser();
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingOdometerRecord, setEditingOdometerRecord] = useState<OdometerRecord | null>(null);
  const [editingWorkHours, setEditingWorkHours] = useState<WorkHoursRecord | null>(null);

  // Processar registros de horas para mostrar divisões automáticas
  const processedWorkHours = processWorkHoursWithCutoff(workHours);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const formatWorkingDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const calculateWorkDuration = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}min`;
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      deleteTransaction(id);
    }
  };

  const handleDeleteOdometerRecord = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro de odômetro?')) {
      deleteOdometerRecord(id);
    }
  };

  const handleDeleteWorkHours = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro de horas?')) {
      deleteWorkHours(id);
    }
  };

  // Agrupar registros processados por registro original
  const groupedWorkHours = processedWorkHours.reduce((acc, record) => {
    if (!acc[record.originalId]) {
      acc[record.originalId] = [];
    }
    acc[record.originalId].push(record);
    return acc;
  }, {} as Record<string, typeof processedWorkHours>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Histórico de Lançamentos</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="receitas" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="receitas">Receitas</TabsTrigger>
            <TabsTrigger value="despesas">Despesas</TabsTrigger>
            <TabsTrigger value="odometro">Odômetro</TabsTrigger>
            <TabsTrigger value="horas">Horas</TabsTrigger>
          </TabsList>

          <TabsContent value="receitas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span>Receitas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.filter(t => t.type === 'receita').map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">{transaction.category}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-green-600">{formatCurrency(transaction.value)}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingTransaction(transaction)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {transactions.filter(t => t.type === 'receita').length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhuma receita registrada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="despesas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span>Despesas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.filter(t => t.type === 'despesa').map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium">{transaction.category}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                        {transaction.observation && (
                          <p className="text-xs text-muted-foreground">{transaction.observation}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-red-600">{formatCurrency(transaction.value)}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingTransaction(transaction)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {transactions.filter(t => t.type === 'despesa').length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhuma despesa registrada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="odometro">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="w-5 h-5 text-blue-600" />
                  <span>Registros de Odômetro</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {odometerRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">{record.type === 'inicial' ? 'Odômetro Inicial' : 'Odômetro Final'}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(record.date)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-blue-600">{record.value} km</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingOdometerRecord(record)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteOdometerRecord(record.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {odometerRecords.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhum registro de odômetro</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="horas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span>Horas Trabalhadas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(groupedWorkHours).map(([originalId, records]) => {
                    const originalRecord = workHours.find(w => w.id === originalId);
                    if (!originalRecord) return null;

                    const hasMultipleRecords = records.length > 1;

                    return (
                      <div key={originalId} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        {/* Cabeçalho do registro original */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-purple-900">Jornada de Trabalho</h3>
                            {hasMultipleRecords && (
                              <div className="flex items-center space-x-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Dividido às 04:00</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingWorkHours(originalRecord)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteWorkHours(originalRecord.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Detalhes dos períodos */}
                        <div className="space-y-2">
                          {records.map((record, index) => (
                            <div key={record.id} className="text-sm">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-muted-foreground">
                                    {hasMultipleRecords ? `Período ${index + 1}: ` : ''}
                                    {formatDate(record.startDateTime)} - {formatDate(record.endDateTime)}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-purple-600 font-medium">
                                    {calculateWorkDuration(record.startDateTime, record.endDateTime)}
                                  </span>
                                  <div className="text-xs text-purple-500">
                                    Contabilizado em: {formatWorkingDate(record.workingDate)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Duração total */}
                        <div className="mt-2 pt-2 border-t border-purple-200">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-purple-700 font-medium">Duração total:</span>
                            <span className="text-purple-600 font-semibold">
                              {calculateWorkDuration(originalRecord.startDateTime, originalRecord.endDateTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {workHours.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhuma hora trabalhada registrada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          isOpen={true}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      {editingOdometerRecord && (
        <EditOdometerModal
          record={editingOdometerRecord}
          isOpen={true}
          onClose={() => setEditingOdometerRecord(null)}
        />
      )}

      {editingWorkHours && (
        <EditWorkHoursModal
          record={editingWorkHours}
          isOpen={true}
          onClose={() => setEditingWorkHours(null)}
        />
      )}
    </div>
  );
};

export default HistoryPage;
