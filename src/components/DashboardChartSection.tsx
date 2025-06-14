
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RevenueExpenseChart from "./RevenueExpenseChart";
import type { ChartData } from "@/types";

interface DashboardChartSectionProps {
  chartData: ChartData[];
}

const DashboardChartSection = ({ chartData }: DashboardChartSectionProps) => {
  return (
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
  );
};

export default DashboardChartSection;
