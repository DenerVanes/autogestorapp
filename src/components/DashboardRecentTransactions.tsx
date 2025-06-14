
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types";

interface DashboardRecentTransactionsProps {
  filteredTransactions: Transaction[];
  periodLabel: string;
  onShowHistory: () => void;
}

const DashboardRecentTransactions = ({ 
  filteredTransactions, 
  periodLabel, 
  onShowHistory 
}: DashboardRecentTransactionsProps) => {
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
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lançamentos {periodLabel}</CardTitle>
          <Button 
            variant="outline" 
            onClick={onShowHistory}
            className="flex items-center space-x-2"
          >
            <span>Ver tudo</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredTransactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  transaction.type === 'receita' ? 'bg-green-500' : 'bg-red-500'
                )}></div>
                <div>
                  <p className="font-medium">{transaction.category}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                </div>
              </div>
              <span className={cn(
                "font-semibold",
                transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'
              )}>
                {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.value)}
              </span>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhum lançamento encontrado {periodLabel}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardRecentTransactions;
