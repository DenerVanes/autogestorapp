
import { DollarSign, TrendingDown, Car, Clock } from "lucide-react";
import MetricCard from "./MetricCard";
import FuelExpenseCard from "./FuelExpenseCard";
import type { Metrics } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { filterByPeriod } from "@/utils/dateFilters";

interface DashboardMetricsSectionProps {
  metrics: Metrics & { changes: Record<string, string> };
  period: string;
  customStartDate?: Date;
  customEndDate?: Date;
}

const DashboardMetricsSection = ({ 
  metrics, 
  period, 
  customStartDate, 
  customEndDate 
}: DashboardMetricsSectionProps) => {
  const { transactions } = useUser();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calculate revenue breakdown by category
  const getRevenueBreakdown = () => {
    const filteredTransactions = filterByPeriod(transactions, period, customStartDate, customEndDate);
    const revenueTransactions = filteredTransactions.filter(t => t.type === 'receita');
    
    const breakdown = revenueTransactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Outros';
      acc[category] = (acc[category] || 0) + transaction.value;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(breakdown)
      .map(([label, amount]) => ({
        label,
        value: formatCurrency(amount),
        amount
      }))
      .filter(item => item.amount > 0);
  };

  // Calculate expense breakdown by category and description
  const getExpenseBreakdown = () => {
    const filteredTransactions = filterByPeriod(transactions, period, customStartDate, customEndDate);
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'despesa');
    
    return expenseTransactions
      .map(transaction => {
        const category = transaction.category || 'Outros';
        const description = transaction.observation || transaction.subcategory || '';
        const label = description ? `${category} - ${description}` : category;
        
        return {
          label,
          value: formatCurrency(transaction.value),
          amount: transaction.value
        };
      })
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  };

  const revenueBreakdown = getRevenueBreakdown();
  const expenseBreakdown = getExpenseBreakdown();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6 mb-8">
      <MetricCard
        title="Receita Total"
        value={formatCurrency(metrics.receita)}
        icon={DollarSign}
        color="green"
        change={metrics.changes?.receita}
        breakdown={revenueBreakdown}
        showInfoIcon={true}
      />
      <MetricCard
        title="Despesa Total"
        value={formatCurrency(metrics.despesa)}
        icon={TrendingDown}
        color="red"
        change={metrics.changes?.despesa}
        breakdown={expenseBreakdown}
        showInfoIcon={true}
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
      <FuelExpenseCard
        period={period}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
      />
    </div>
  );
};

export default DashboardMetricsSection;
