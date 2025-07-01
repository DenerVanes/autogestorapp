import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'green' | 'red' | 'blue';
  change?: string;
  breakdown?: Array<{ label: string; value: string; amount: number }>;
  showInfoIcon?: boolean;
  subtitle?: string;
  comparison?: string;
}

const MetricCard = ({ title, value, icon: Icon, color, change, breakdown, showInfoIcon, subtitle, comparison }: MetricCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Group fuel expenses for expense breakdown
  const getProcessedBreakdown = () => {
    if (!breakdown || title !== "Despesa Total") return breakdown;

    const fuelCategories = ['Combustível', 'Gasolina', 'Álcool', 'Diesel'];
    const fuelItems: Array<{ label: string; value: string; amount: number }> = [];
    const nonFuelItems: Array<{ label: string; value: string; amount: number }> = [];
    
    breakdown.forEach(item => {
      const isFuelItem = fuelCategories.some(fuelCat => 
        item.label.includes(fuelCat)
      );
      
      if (isFuelItem) {
        fuelItems.push(item);
      } else {
        nonFuelItems.push(item);
      }
    });

    // If there are fuel items, group them
    if (fuelItems.length > 0) {
      const totalFuelAmount = fuelItems.reduce((sum, item) => sum + item.amount, 0);
      const groupedFuelItem = {
        label: "Combustível",
        value: formatCurrency(totalFuelAmount),
        amount: totalFuelAmount
      };
      
      return [groupedFuelItem, ...nonFuelItems];
    }

    return breakdown;
  };

  const processedBreakdown = getProcessedBreakdown();

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                {showInfoIcon && (
                  <Info 
                    className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" 
                    onClick={() => setIsDialogOpen(true)}
                  />
                )}
              </div>
              <p className={cn("text-2xl font-bold", `text-${color}-600`)}>{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1 mb-0 font-normal">{subtitle}</p>
              )}
              {comparison && (
                <p className="text-xs text-gray-700 mt-1 mb-0 font-medium">{comparison}</p>
              )}
              {change && (
                <p className={cn("text-xs mt-1 font-medium", getChangeColor(change))}>
                  {change}
                </p>
              )}
            </div>
            <div className={cn("p-3 rounded-full", colorClasses[color])}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md" style={{ zIndex: 999999 }}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800">
              {title.includes("Receita") ? "Detalhamento das Receitas" : "Detalhamento das Despesas"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {processedBreakdown && processedBreakdown.length > 0 ? (
              <div className="space-y-3">
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {processedBreakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium text-gray-700 text-sm">{item.label}</span>
                      <span className="text-green-600 font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center font-bold text-gray-800">
                    <span>Total:</span>
                    <span className={cn("text-lg", `text-${color}-600`)}>{value}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-600">
                Nenhum dado disponível para o período selecionado
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MetricCard;
