
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'green' | 'red' | 'blue';
  change?: string;
  breakdown?: Array<{ label: string; value: string; amount: number }>;
}

const MetricCard = ({ title, value, icon: Icon, color, change, breakdown }: MetricCardProps) => {
  const colorClasses = {
    green: "text-green-600 bg-green-50",
    red: "text-red-600 bg-red-50",
    blue: "text-blue-600 bg-blue-50"
  };

  const getChangeColor = (changeValue?: string) => {
    if (!changeValue || changeValue === "Sem dados anteriores para comparar") return "text-gray-500";
    const isPositive = changeValue.startsWith('+');
    const isNegative = changeValue.startsWith('-');
    
    if (isPositive) return "text-green-600";
    if (isNegative) return "text-red-600";
    return "text-gray-500";
  };

  const getChangeText = (changeValue?: string) => {
    if (!changeValue) return "";
    if (changeValue === "Sem dados anteriores para comparar") return changeValue;
    return `${changeValue} vs mês anterior`;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className={cn("text-2xl font-bold", `text-${color}-600`)}>{value}</p>
            {change && (
              <p className={cn("text-xs mt-1 font-medium", getChangeColor(change))}>
                {getChangeText(change)}
              </p>
            )}
            
            {breakdown && breakdown.length > 0 && (
              <div className="mt-3 space-y-1">
                {breakdown
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 4)
                  .map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-xs text-gray-600">
                      <span>{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-full", colorClasses[color])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
