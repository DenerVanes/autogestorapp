
import { Card, CardContent } from "@/components/ui/card";
import { Fuel } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { calculateKmRodado } from "@/utils/kmCalculator";
import { calculatePreviousFuelExpense, calculatePercentageChange } from "@/utils/comparisonCalculator";
import { subDays } from "date-fns";

interface FuelExpenseCardProps {
  period: string;
  customStartDate?: Date;
  customEndDate?: Date;
}

const FuelExpenseCard = ({ period, customStartDate, customEndDate }: FuelExpenseCardProps) => {
  const { user, transactions, odometerRecords } = useUser();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateFuelExpense = () => {
    // Check if user profile is complete
    if (!user?.vehicleType || !user?.vehicleModel || !user?.fuelConsumption) {
      return {
        value: 0,
        subtitle: "Configure seu perfil",
        error: true,
        change: undefined
      };
    }

    // Get km driven in the selected period
    const kmDriven = calculateKmRodado(odometerRecords, period, customStartDate, customEndDate);
    
    if (kmDriven === 0) {
      return {
        value: 0,
        subtitle: "Sem dados do período",
        error: true,
        change: undefined
      };
    }

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

    if (recentFuelTransactions.length === 0) {
      return {
        value: 0,
        subtitle: "Dados insuficientes",
        error: true,
        change: undefined
      };
    }

    const averagePricePerLiter = recentFuelTransactions.reduce((sum, t) => sum + (t.pricePerLiter || 0), 0) / recentFuelTransactions.length;
    
    // Calculate total fuel expense
    const totalExpense = litersConsumed * averagePricePerLiter;

    // Calculate previous period fuel expense for comparison
    const previousFuelExpense = calculatePreviousFuelExpense(transactions, odometerRecords, user, period, customStartDate, customEndDate);
    const change = calculatePercentageChange(totalExpense, previousFuelExpense);

    return {
      value: totalExpense,
      subtitle: `Baseado em ${kmDriven}km rodados`,
      error: false,
      change
    };
  };

  const fuelData = calculateFuelExpense();

  const getChangeColor = (changeValue?: string) => {
    if (!changeValue || changeValue === "Sem dados anteriores para comparar") return "text-gray-500";
    const isPositive = changeValue.startsWith('+');
    const isNegative = changeValue.startsWith('-');
    
    // For fuel expense, negative change is good (less expense)
    if (isPositive) return "text-red-600";
    if (isNegative) return "text-green-600";
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
            <p className="text-sm font-medium text-muted-foreground mb-1">Gasto de Combustível</p>
            <p className={cn(
              "text-2xl font-bold",
              fuelData.error ? "text-gray-500" : "text-orange-600"
            )}>
              {fuelData.error ? fuelData.subtitle : formatCurrency(fuelData.value)}
            </p>
            {!fuelData.error && (
              <p className="text-xs mt-1 font-medium text-gray-600">
                {fuelData.subtitle}
              </p>
            )}
            {fuelData.change && (
              <p className={cn("text-xs mt-1 font-medium", getChangeColor(fuelData.change))}>
                {getChangeText(fuelData.change)}
              </p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-full",
            fuelData.error ? "text-gray-400 bg-gray-50" : "text-orange-600 bg-orange-50"
          )}>
            <Fuel className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FuelExpenseCard;
