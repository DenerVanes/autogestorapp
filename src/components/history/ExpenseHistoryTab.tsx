
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, Edit2, Trash2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Transaction } from "@/types";

interface ExpenseHistoryTabProps {
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const ExpenseHistoryTab = ({ onEditTransaction, onDeleteTransaction }: ExpenseHistoryTabProps) => {
  const { transactions } = useUser();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  return (
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
                  onClick={() => onEditTransaction(transaction)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onDeleteTransaction(transaction.id)}
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
  );
};

export default ExpenseHistoryTab;
