
import { DollarSign, TrendingDown, Car, Clock } from "lucide-react";
import MetricCard from "./MetricCard";
import FuelExpenseCard from "./FuelExpenseCard";
import type { Metrics } from "@/types";

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
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6 mb-8">
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
      <FuelExpenseCard
        period={period}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
      />
    </div>
  );
};

export default DashboardMetricsSection;
