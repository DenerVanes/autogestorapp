
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingDown, Car, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import FloatingActionButton from "./FloatingActionButton";
import MetricCard from "./MetricCard";
import TransactionModal from "./TransactionModal";
import WorkHoursModal from "./WorkHoursModal";
import RevenueExpenseChart from "./RevenueExpenseChart";
import HistoryPage from "./HistoryPage";
import DateRangePicker from "./DateRangePicker";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { filterByPeriod } from "@/utils/dateFilters";

type TransactionType = 'receita' | 'despesa' | 'odometro' | 'horas' | null;

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("hoje");
  const [modalType, setModalType] = useState<TransactionType>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>();
  
  const { user, getMetrics, getChartData, transactions } = useUser();

  const customStartDate = dateRange?.from;
  const customEndDate = dateRange?.to;

  const metrics = getMetrics(selectedPeriod, customStartDate, customEndDate);
  const chartData = getChartData(selectedPeriod, customStartDate, customEndDate);
  
  // Apply the same date filter to recent transactions
  const filteredTransactions = filterByPeriod(transactions, selectedPeriod, customStartDate, customEndDate);

  const handleFloatingButtonClick = (type: TransactionType) => {
    setModalType(type);
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    if (value !== 'personalizado') {
      setDateRange(undefined);
    }
  };

  const handleDateRangeApply = () => {
    setSelectedPeriod('personalizado');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'hoje':
        return 'de hoje';
      case '7dias':
        return 'dos últimos 7 dias';
      case '30dias':
        return 'dos últimos 30 dias';
      case 'personalizado':
        if (customStartDate && customEndDate) {
          return `de ${format(customStartDate, 'dd/MM', { locale: ptBR })} a ${format(customEndDate, 'dd/MM', { locale: ptBR })}`;
        }
        return 'do período personalizado';
      default:
        return 'do período selecionado';
    }
  };

  if (showHistory) {
    return <HistoryPage onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {getGreeting()}, {user?.name || 'Usuário'}!
                </h1>
                <p className="text-sm text-muted-foreground">Aqui está o seu dashboard atualizado</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-40 bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                  <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
              
              {selectedPeriod === 'personalizado' && (
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  onApply={handleDateRangeApply}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <MetricCard
            title="Receita Total"
            value={formatCurrency(metrics.receita)}
            icon={DollarSign}
            color="green"
            change={metrics.changes?.receita}
          />
          <MetricCard
            title="Despesa Total"
            value={formatCurrency(metrics.despesa)}
            icon={TrendingDown}
            color="red"
            change={metrics.changes?.despesa}
          />
          <MetricCard
            title="Saldo Total"
            value={formatCurrency(metrics.saldo)}
            icon={DollarSign}
            color={metrics.saldo >= 0 ? "green" : "red"}
            change={metrics.changes?.saldo}
          />
          <MetricCard
            title="KM Rodado"
            value={`${metrics.kmRodado} km`}
            icon={Car}
            color="blue"
            change={metrics.changes?.kmRodado}
          />
          <MetricCard
            title="R$ por KM"
            value={formatCurrency(metrics.valorPorKm)}
            icon={DollarSign}
            color="green"
            change={metrics.changes?.valorPorKm}
          />
          <MetricCard
            title="R$ por Hora"
            value={formatCurrency(metrics.valorPorHora)}
            icon={Clock}
            color="green"
            change={metrics.changes?.valorPorHora}
          />
        </div>

        {/* Chart Section */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <RevenueExpenseChart data={chartData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>Nenhum dado encontrado para o período selecionado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lançamentos {getPeriodLabel()}</CardTitle>
              <Button 
                variant="outline" 
                onClick={() => setShowHistory(true)}
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
                  Nenhum lançamento encontrado {getPeriodLabel()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onAction={handleFloatingButtonClick} />

      {/* Modals */}
      {modalType && modalType !== 'horas' && (
        <TransactionModal
          type={modalType}
          isOpen={true}
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === 'horas' && (
        <WorkHoursModal
          isOpen={true}
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
