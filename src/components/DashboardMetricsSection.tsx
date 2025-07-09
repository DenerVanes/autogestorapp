
import MetricCard from "./MetricCard";
import BestDayCard from "./BestDayCard";
import { DollarSign, TrendingDown, TrendingUp, Route, Clock, Gauge } from "lucide-react";
import { Metrics } from "@/types";
import { calculatePreviousPeriodComparison } from "@/utils/comparisonCalculator";

interface DashboardMetricsSectionProps {
  metrics: Metrics;
  period: string;
  customStartDate?: Date;
  customEndDate?: Date;
}

const DashboardMetricsSection = ({ metrics, period, customStartDate, customEndDate }: DashboardMetricsSectionProps) => {
  const comparison = calculatePreviousPeriodComparison(metrics, period, customStartDate, customEndDate);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDistance = (km: number) => {
    if (km >= 1000) {
      return `${(km / 1000).toFixed(1)}mil km`;
    }
    return `${km.toFixed(0)} km`;
  };

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (wholeHours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${wholeHours}h`;
    } else {
      return `${wholeHours}h ${minutes}min`;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Receita Total"
        value={formatCurrency(metrics.receita)}
        icon={DollarSign}
        color="green"
        change={comparison.receita.change}
        breakdown={comparison.receita.breakdown}
        showInfoIcon={true}
      />
      
      <MetricCard
        title="Despesa Total"
        value={formatCurrency(metrics.despesa)}
        icon={TrendingDown}
        color="red"
        change={comparison.despesa.change}
        breakdown={comparison.despesa.breakdown}
        showInfoIcon={true}
      />
      
      <MetricCard
        title="Saldo Atual"
        value={formatCurrency(metrics.saldo)}
        icon={TrendingUp}
        color={metrics.saldo >= 0 ? "green" : "red"}
        change={comparison.saldo.change}
        subtitle={`Receita - Despesa`}
      />

      <BestDayCard />
      
      <MetricCard
        title="KM Rodado"
        value={formatDistance(metrics.kmRodado)}
        icon={Route}
        color="blue"
        change={comparison.kmRodado.change}
        subtitle={`${formatCurrency(metrics.valorPorKm)} por km`}
      />
      
      <MetricCard
        title="Horas Trabalhadas"
        value={formatHours(metrics.horasTrabalhadas)}
        icon={Clock}
        color="blue"
        change={comparison.horasTrabalhadas.change}
        subtitle={`${formatCurrency(metrics.valorPorHora)} por hora`}
      />
      
      <MetricCard
        title="Valor por KM"
        value={formatCurrency(metrics.valorPorKm)}
        icon={Gauge}
        color="blue"
        change={comparison.valorPorKm.change}
        subtitle="Receita ÷ KM rodado"
        comparison={comparison.valorPorKm.comparison}
      />
      
      <MetricCard
        title="Valor por Hora"
        value={formatCurrency(metrics.valorPorHora)}
        icon={Clock}
        color="blue"
        change={comparison.valorPorHora.change}
        subtitle="Receita ÷ Horas trabalhadas"
        comparison={comparison.valorPorHora.comparison}
      />
    </div>
  );
};

export default DashboardMetricsSection;
