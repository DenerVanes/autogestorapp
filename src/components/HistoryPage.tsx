import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, DollarSign, TrendingDown, Navigation, Clock, Edit2, Trash2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import EditTransactionModal from "./EditTransactionModal";
import EditOdometerModal from "./EditOdometerModal";
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
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
                <div className="space-y-3">
                  {workHours.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium">Jornada de Trabalho</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(record.startDateTime)} - {formatDate(record.endDateTime)}
                        </p>
                        <p className="text-xs text-purple-600 font-medium">
                          Duração: {calculateWorkDuration(record.startDateTime, record.endDateTime)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteWorkHours(record.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
    </div>
  );
};

export default HistoryPage;
