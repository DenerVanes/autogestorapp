
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DollarSign, TrendingDown, Car, Clock, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import FloatingActionButton from "./FloatingActionButton";
import MetricCard from "./MetricCard";
import TransactionModal from "./TransactionModal";
import WorkHoursModal from "./WorkHoursModal";
import RevenueExpenseChart from "./RevenueExpenseChart";
import HistoryPage from "./HistoryPage";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";

type TransactionType = 'receita' | 'despesa' | 'odometro' | 'horas' | null;

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("hoje");
  const [modalType, setModalType] = useState<TransactionType>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  
  const { getMetrics, getChartData, transactions } = useUser();

  const metrics = getMetrics(selectedPeriod, customStartDate, customEndDate);
  const chartData = getChartData(selectedPeriod, customStartDate, customEndDate);

  const handleFloatingButtonClick = (type: TransactionType) => {
    setModalType(type);
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    if (value !== 'personalizado') {
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
    }
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
                <h1 className="text-xl font-semibold text-foreground">Drive Control</h1>
                <p className="text-sm text-muted-foreground">Dashboard</p>
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
                <Popover open={showCustomCalendar} onOpenChange={setShowCustomCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="bg-white/80">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {customStartDate && customEndDate 
                        ? `${format(customStartDate, 'dd/MM')} - ${format(customEndDate, 'dd/MM')}`
                        : 'Selecionar período'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium">Data de início:</label>
                        <Calendar
                          mode="single"
                          selected={customStartDate}
                          onSelect={setCustomStartDate}
                          className="rounded-md border mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Data de fim:</label>
                        <Calendar
                          mode="single"
                          selected={customEndDate}
                          onSelect={setCustomEndDate}
                          className="rounded-md border mt-1"
                        />
                      </div>
                      <Button 
                        onClick={() => setShowCustomCalendar(false)}
                        className="w-full"
                        disabled={!customStartDate || !customEndDate}
                      >
                        Aplicar filtro
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
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
            change="+12.5%"
          />
          <MetricCard
            title="Despesa Total"
            value={formatCurrency(metrics.despesa)}
            icon={TrendingDown}
            color="red"
            change="+5.2%"
          />
          <MetricCard
            title="Saldo Total"
            value={formatCurrency(metrics.saldo)}
            icon={DollarSign}
            color={metrics.saldo >= 0 ? "green" : "red"}
            change={metrics.saldo >= 0 ? "+8.7%" : "-3.2%"}
          />
          <MetricCard
            title="KM Rodado"
            value={`${metrics.kmRodado} km`}
            icon={Car}
            color="blue"
            change="+8.1%"
          />
          <MetricCard
            title="R$ por KM"
            value={formatCurrency(metrics.valorPorKm)}
            icon={DollarSign}
            color="green"
            change="+4.3%"
          />
          <MetricCard
            title="R$ por Hora"
            value={formatCurrency(metrics.valorPorHora)}
            icon={Clock}
            color="green"
            change="+6.8%"
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
              <CardTitle>Últimos Lançamentos</CardTitle>
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
              {transactions.slice(0, 5).map((transaction) => (
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
              {transactions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhum lançamento registrado</p>
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
