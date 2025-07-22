
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChartData {
  date: string;
  receita: number;
  despesa: number;
}

interface RevenueExpenseChartProps {
  data: ChartData[];
}

const RevenueExpenseChart = ({ data }: RevenueExpenseChartProps) => {
  const formatTooltipValue = (value: number, name: string) => {
    return [`R$ ${value.toFixed(2)}`, name === 'receita' ? 'Receita' : 'Despesa'];
  };

  const formatXAxisLabel = (tickItem: string) => {
    try {
      const date = parseISO(tickItem);
      // Apenas o dia e mês, ex: 22/07
      return format(date, 'dd/MM', { locale: ptBR });
    } catch {
      return tickItem;
    }
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 20, bottom: 35 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisLabel}
            stroke="#64748b"
            fontSize={11}
            height={60}
            interval={0}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tickFormatter={(value) => `R$ ${value}`}
          />
          <Tooltip 
            formatter={formatTooltipValue}
            labelFormatter={(label) => {
              try {
                const date = parseISO(label);
                const dayName = format(date, 'EEEE', { locale: ptBR });
                const fullDate = format(date, 'dd/MM/yyyy', { locale: ptBR });
                return `${dayName}, ${fullDate}`;
              } catch {
                return label;
              }
            }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          {/* Receitas e despesas em colunas separadas lado a lado */}
          <Bar 
            dataKey="receita" 
            fill="#22c55e" 
            name="receita" 
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          />
          <Bar 
            dataKey="despesa" 
            fill="#ef4444" 
            name="despesa" 
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueExpenseChart;
