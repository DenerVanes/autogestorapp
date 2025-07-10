import { DollarSign, TrendingDown, Car, Clock } from "lucide-react";
import MetricCard from "./MetricCard";
import FuelExpenseCard from "./FuelExpenseCard";
import ProfitCard from "./ProfitCard";
import BestDayCard from "./BestDayCard";
import type { Metrics } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { filterByPeriod } from "@/utils/dateFilters";
import React from "react";
import { calculatePreviousMetrics } from "@/utils/comparisonCalculator";

interface DashboardMetricsSectionProps {
  metrics: Metrics;
  period: string;
  customStartDate?: Date;
  customEndDate?: Date;
  children?: React.ReactNode;
}

function getPreviousPeriod(period: string) {
  switch (period) {
    case "este-mes": return "mes-passado";
    case "esta-semana": return "semana-passada";
    case "hoje": return "ontem";
    default: return "mes-passado";
  }
}

function getSimpleChange(current: number, previous: number) {
  console.log("getSimpleChange", { current, previous }); // log para depuração
  if (Math.abs(previous) < 0.01) previous = 0;
  if (Math.abs(current) < 0.01) current = 0;

  if (current === 0 && previous === 0) {
    return "0% vs mês anterior";
  }
  if (previous === 0) {
    return current > 0 ? "+100% vs mês anterior" : "0% vs mês anterior";
  }
  const percent = ((current - previous) / previous) * 100;
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent.toFixed(1)}% vs mês anterior`;
}

const DashboardMetricsSection = ({ 
  metrics, 
  period, 
  customStartDate, 
  customEndDate,
  children
}: DashboardMetricsSectionProps) => {
  const { transactions, lancamentos, workHours } = useUser();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Cálculo dos valores do período anterior usando a lógica correta de intervalo
  const prevMetrics = calculatePreviousMetrics(
    transactions,
    lancamentos,
    workHours,
    period,
    customStartDate,
    customEndDate
  );
  const prevReceita = prevMetrics.receita;
  const prevDespesa = prevMetrics.despesa;
  const prevSaldo = prevMetrics.saldo;
  const prevKmRodado = prevMetrics.kmRodado;
  const prevValorPorKm = prevMetrics.valorPorKm;
  const prevValorPorHora = prevMetrics.valorPorHora;

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
    <div className="mb-8">
      {/* Primeira fileira - 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Receita Total"
          value={formatCurrency(metrics.receita)}
          icon={DollarSign}
          color="green"
          breakdown={revenueBreakdown}
          showInfoIcon={true}
          change={getSimpleChange(metrics.receita, prevReceita)}
        />
        <MetricCard
          title="Despesa Total"
          value={formatCurrency(metrics.despesa)}
          icon={TrendingDown}
          color="red"
          breakdown={expenseBreakdown}
          showInfoIcon={true}
          change={getSimpleChange(metrics.despesa, prevDespesa)}
        />
        <MetricCard
          title="Saldo Total"
          value={formatCurrency(metrics.saldo)}
          icon={DollarSign}
          color={metrics.saldo >= 0 ? "green" : "red"}
          change={getSimpleChange(metrics.saldo, prevSaldo)}
        />
        <MetricCard
          title="KM Rodado"
          value={`${metrics.kmRodado} km`}
          icon={Car}
          color="blue"
          change={getSimpleChange(metrics.kmRodado, prevKmRodado)}
        />
      </div>
      {/* Segunda fileira - Lucro e outros cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <ProfitCard
          metrics={metrics}
          period={period}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />
        <MetricCard
          title="R$ por KM"
          value={formatCurrency(metrics.valorPorKm)}
          icon={DollarSign}
          color="green"
          change={getSimpleChange(metrics.valorPorKm, prevValorPorKm)}
        />
        <MetricCard
          title="R$ por Hora"
          value={formatCurrency(metrics.valorPorHora)}
          icon={Clock}
          color="green"
          change={getSimpleChange(metrics.valorPorHora, prevValorPorHora)}
        />
        <FuelExpenseCard
          metrics={metrics}
          period={period}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />
      </div>
      {/* Terceira fileira - Card de Metas e Melhor Dia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          {children}
        </div>
        <BestDayCard />
      </div>
    </div>
  );
};

export default DashboardMetricsSection;
