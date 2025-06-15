
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AdminChartProps {
  title: string;
  data: any[];
  type: 'line' | 'pie';
  dataKey: string;
  xAxisKey?: string;
  nameKey?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminChart = ({ title, data, type, dataKey, xAxisKey, nameKey }: AdminChartProps) => {
  const chartConfig = {
    [dataKey]: {
      label: dataKey === 'total_users' ? 'Total de Usuários' : 'Quantidade',
      color: '#2563eb',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          {type === 'line' ? (
            <LineChart data={data}>
              <XAxis 
                dataKey={xAxisKey}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                }}
              />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb' }}
              />
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={nameKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default AdminChart;
