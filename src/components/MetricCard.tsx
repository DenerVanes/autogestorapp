
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'green' | 'red' | 'blue';
  change?: string;
  breakdown?: Array<{ label: string; value: string; amount: number }>;
  showInfoIcon?: boolean;
}

const MetricCard = ({ title, value, icon: Icon, color, change, breakdown, showInfoIcon }: MetricCardProps) => {
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
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {showInfoIcon && breakdown && breakdown.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info 
                        className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" 
                      />
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      className="z-[99999] max-w-sm p-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-xl rounded-lg text-sm whitespace-pre-line animate-in fade-in-0 zoom-in-95 duration-200 fixed"
                      sideOffset={8}
                      style={{ zIndex: 99999, position: 'fixed' }}
                    >
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">
                          {title.includes("Receita") ? "Detalhamento das Receitas" : "Detalhamento das Despesas"}
                        </h4>
                        <div className="space-y-1">
                          {breakdown.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-gray-700">
                              <span className="font-medium">{item.label}</span>
                              <span className="text-green-600 font-semibold">{item.value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-3">
                          <div className="flex justify-between items-center font-bold text-gray-800">
                            <span>Total:</span>
                            <span className={cn("text-lg", `text-${color}-600`)}>{value}</span>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className={cn("text-2xl font-bold", `text-${color}-600`)}>{value}</p>
            {change && (
              <p className={cn("text-xs mt-1 font-medium", getChangeColor(change))}>
                {getChangeText(change)}
              </p>
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
