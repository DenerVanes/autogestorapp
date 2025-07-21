import { Card, CardContent } from "@/components/ui/card";
import { Fuel } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { calculatePreviousFuelExpense, calculatePercentageChange } from "@/utils/comparisonCalculator";
import { subDays } from "date-fns";
import type { Metrics } from "@/types";
import { filterByPeriod } from "@/utils/dateFilters";
import { calculateKmRodado } from "@/utils/kmCalculator";

interface FuelExpenseCardProps {
  metrics: Metrics;
  period: string;
  customStartDate?: Date;
  customEndDate?: Date;
  change?: string;
}

const FuelExpenseCard = ({ metrics, period, customStartDate, customEndDate, change }: FuelExpenseCardProps) => {
  const { user, transactions, odometerRecords, lancamentos } = useUser();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateFuelExpense = () => {
    // LOG DE DEPURAÇÃO DO FILTRO ATUAL
    console.log('[FUEL CARD DEBUG] period:', period, '| customStartDate:', customStartDate, '| customEndDate:', customEndDate);
    // Check if user profile is complete
    if (!user?.vehicleType || !user?.vehicleModel || !user?.fuelConsumption) {
      return {
        value: 0,
        subtitle: "Configure seu perfil",
        error: true,
        change: undefined
      };
    }

    // Lógica correta: KM rodado / consumo médio * valor médio do litro
    // Sempre recalcule o km rodado do período atual
    const kmRodado = calculateKmRodado(odometerRecords, period, customStartDate, customEndDate);
    const consumoMedio = user.fuelConsumption;
    let valorLitro = 0;
    // Filtra lançamentos de combustível do período ATUAL
    const fuelTransactions = filterByPeriod(transactions, period, customStartDate, customEndDate)
      .filter(t => t.type === 'despesa' && t.category === 'Combustível' && t.pricePerLiter);
    if (fuelTransactions.length > 0) {
      // Média dos valores do litro abastecido no período
      valorLitro = fuelTransactions.reduce((acc, t) => acc + (t.pricePerLiter || 0), 0) / fuelTransactions.length;
    } else {
      // Se não houver lançamentos no período, pega o último valor conhecido
      const allFuelTransactions = transactions
        .filter(t => t.type === 'despesa' && t.category === 'Combustível' && t.pricePerLiter)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      valorLitro = allFuelTransactions[0]?.pricePerLiter || 0;
    }
    const litrosConsumidos = kmRodado / consumoMedio;
    const totalExpense = litrosConsumidos * valorLitro;

    // --- NOVA LÓGICA DE COMPARAÇÃO: usar o mesmo filtro do valor exibido, mas para o período anterior ---
    function getPreviousPeriod(period, customStartDate, customEndDate) {
      // Sempre use o "agora" do momento do cálculo
      const now = new Date();
      if (period === 'este-mes') {
        return {
          period: 'mes-passado',
          customStartDate: undefined,
          customEndDate: undefined
        };
      } else if (period === 'hoje' || period === 'ontem' || (customStartDate && customEndDate && customStartDate.toDateString() === customEndDate.toDateString())) {
        // 1 dia
        // Sempre recalcule a data base do filtro
        let baseStart;
        if (period === 'ontem') {
          // Para ontem, sempre use o dia anterior ao "agora"
          baseStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        } else if (period === 'hoje') {
          baseStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else {
          baseStart = customStartDate ? new Date(customStartDate) : now;
        }
        const prevStart = new Date(baseStart);
        prevStart.setMonth(prevStart.getMonth() - 1);
        return {
          period: 'personalizado',
          customStartDate: prevStart,
          customEndDate: prevStart
        };
      } else {
        // Intervalo
        let baseStart = customStartDate ? new Date(customStartDate) : now;
        let baseEnd = customEndDate ? new Date(customEndDate) : now;
        const prevStart = new Date(baseStart);
        prevStart.setMonth(prevStart.getMonth() - 1);
        const prevEnd = new Date(baseEnd);
        prevEnd.setMonth(prevEnd.getMonth() - 1);
        return {
          period: 'personalizado',
          customStartDate: prevStart,
          customEndDate: prevEnd
        };
      }
    }
    const prev = getPreviousPeriod(period, customStartDate, customEndDate);
    // Sempre recalcule o km rodado do período anterior
    const kmRodadoAnterior = calculateKmRodado(odometerRecords, prev.period, prev.customStartDate, prev.customEndDate);
    let prevValorLitro = 0;
    const prevFuelTransactions = filterByPeriod(transactions, prev.period, prev.customStartDate, prev.customEndDate)
      .filter(t => t.type === 'despesa' && t.category === 'Combustível' && t.pricePerLiter);
    if (prevFuelTransactions.length > 0) {
      prevValorLitro = prevFuelTransactions.reduce((acc, t) => acc + (t.pricePerLiter || 0), 0) / prevFuelTransactions.length;
    } else {
      const allFuelTransactions = transactions
        .filter(t => t.type === 'despesa' && t.category === 'Combustível' && t.pricePerLiter)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      prevValorLitro = allFuelTransactions[0]?.pricePerLiter || 0;
    }
    const prevLitrosConsumidos = kmRodadoAnterior / consumoMedio;
    const prevTotalExpense = prevLitrosConsumidos * prevValorLitro;
    // --- COMPARAÇÃO CORRETA ---
    let smartChange = '';
    if (prevTotalExpense === 0) {
      smartChange = totalExpense > 0 ? '+100% vs mês anterior' : 'Sem dados anteriores para comparar';
    } else {
      const percent = ((totalExpense - prevTotalExpense) / Math.abs(prevTotalExpense)) * 100;
      smartChange = `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}% vs mês anterior`;
    }
    // LOGS DETALHADOS DE DEPURAÇÃO DO CÁLCULO
    console.log('[FUEL CARD DEBUG] ATUAL:', {
      kmRodado, valorLitro, litrosConsumidos, totalExpense
    });
    console.log('[FUEL CARD DEBUG] ANTERIOR:', {
      kmRodadoAnterior, prevValorLitro, prevLitrosConsumidos, prevTotalExpense
    });
    console.log('[FUEL CARD DEBUG] smartChange:', smartChange);

    // Função utilitária para pegar yyyy-mm-dd no fuso do Brasil
    function toBrazilDateOnly(date: Date | string) {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
    }

    // LOGS DETALHADOS DE DEPURAÇÃO
    const allFuelDates = transactions
      .filter(t => t.type === 'despesa' && t.category === 'Combustível' && t.pricePerLiter)
      .map(t => ({ value: t.value, date: new Date(t.date), dateStr: toBrazilDateOnly(t.date) }));
    console.log('[FUEL CARD DEBUG] Todas datas de combustível:', allFuelDates);
    console.log('[FUEL CARD DEBUG] smartChange:', smartChange);

    // Retorne smartChange no lugar de change
    return {
      value: totalExpense,
      subtitle: `Baseado em ${metrics.kmRodado}km rodados`,
      error: false,
      change: smartChange
    };
  };

  const fuelData = calculateFuelExpense();

  // LOG DE DEPURAÇÃO
  console.log('[FUEL CARD DEBUG] fuelData.change:', fuelData.change, '| isPercent:', /%/.test(fuelData.change || ''));

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
    // Só retorna o valor se for percentual
    if (/%/.test(changeValue)) return changeValue;
    return "";
  };

  // LOG FINAL DE DEPURAÇÃO ANTES DO RETURN
  console.log('[FUEL CARD FINAL DEBUG]', { period, totalExpense: fuelData.value, change: fuelData.change });
  // LOG NO JSX PARA DEPURAÇÃO DE RENDER
  console.log('[FUEL CARD JSX DEBUG]', { show: fuelData.change && fuelData.change.includes('%'), value: fuelData.change });

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
            {/* Exibe sempre a diferença percentual ou mensagem de comparação */}
            {fuelData.change && (
              <p className={cn('text-xs mt-1 font-medium', getChangeColor(fuelData.change))}>
                {fuelData.change}
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
