
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { calculateKmRodado } from "@/utils/kmCalculator";
import { calculatePreviousProfit, calculatePercentageChange } from "@/utils/comparisonCalculator";
import { filterByPeriod } from "@/utils/dateFilters";
import { subDays } from "date-fns";

interface ProfitCardProps {
  period: string;
  customStartDate?: Date;
  customEndDate?: Date;
}

const ProfitCard = ({ period, customStartDate, customEndDate }: ProfitCardProps) => {
  const { user, transactions, odometerRecords } = useUser();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateProfit = () => {
    // Get filtered transactions for the selected period
    const filteredTransactions = filterByPeriod(transactions, period, customStartDate, customEndDate);
    
    // Calculate total revenue
    const totalRevenue = filteredTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.value, 0);

    // Calculate fuel expense
    let fuelExpense = 0;

    // Check if user profile is complete for fuel calculation
    if (user?.vehicleType && user?.vehicleModel && user?.fuelConsumption) {
      // Get km driven in the selected period
      const kmDriven = calculateKmRodado(odometerRecords, period, customStartDate, customEndDate);
      
      if (kmDriven > 0) {
        // Calculate liters consumed
        const litersConsumed = kmDriven / user.fuelConsumption;

        // Get average fuel price from last 7 days
        const sevenDaysAgo = subDays(new Date(), 7);
        const recentFuelTransactions = transactions.filter(t => 
          t.type === 'despesa' && 
          t.fuelType && 
          t.pricePerLiter && 
          t.date >= sevenDaysAgo
        );

        if (recentFuelTransactions.length > 0) {
          const averagePricePerLiter = recentFuelTransactions.reduce((sum, t) => sum + (t.pricePerLiter || 0), 0) / recentFuelTransactions.length;
          fuelExpense = litersConsumed * averagePricePerLiter;
        }
      }
    }

    // Calculate profit
    const profit = totalRevenue - fuelExpense;

    // Calculate previous period profit for comparison
    const previousProfit = calculatePreviousProfit(transactions, odometerRecords, user, period, customStartDate, customEndDate);
    const change = calculatePercentageChange(profit, previousProfit);

    return {
      value: profit,
      revenue: totalRevenue,
      fuelExpense: fuelExpense,
      hasData: totalRevenue > 0 || fuelExpense > 0,
      change
    };
  };

  const profitData = calculateProfit();

  // Determine color and icon based on profit value
  const getColorAndIcon = () => {
    if (profitData.value > 0) {
      return {
        color: "text-green-600 bg-green-50",
        icon: TrendingUp,
        textColor: "text-green-600"
      };
    } else if (profitData.value < 0) {
      return {
        color: "text-red-600 bg-red-50",
        icon: TrendingDown,
        textColor: "text-red-600"
      };
    } else {
      return {
        color: "text-gray-600 bg-gray-50",
        icon: DollarSign,
        textColor: "text-gray-600"
      };
    }
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

  const { color, icon: Icon, textColor } = getColorAndIcon();

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">Lucro</p>
            <p className={cn("text-2xl font-bold", textColor)}>
              {formatCurrency(profitData.value)}
            </p>
            <p className="text-xs mt-1 font-medium text-gray-600">
              Receita - Combustível
            </p>
            {profitData.change && (
              <p className={cn("text-xs mt-1 font-medium", getChangeColor(profitData.change))}>
                {getChangeText(profitData.change)}
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-full", color)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitCard;
