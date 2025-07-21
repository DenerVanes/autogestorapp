import { DollarSign, TrendingDown, Car, Clock } from "lucide-react";
import MetricCard from "./MetricCard";
import FuelExpenseCard from "./FuelExpenseCard";
import ProfitCard from "./ProfitCard";
import BestDayCard from "./BestDayCard";
import type { Metrics } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { filterByPeriod } from "@/utils/dateFilters";
import React from "react";
import { calculatePreviousMetrics, calcularVariacaoFaturamento } from "@/utils/comparisonCalculator";
import { startOfDay, endOfDay } from 'date-fns';
import { agruparCiclosPorPairId } from "@/utils/cycleGroupingUtils";
import { convertToBrazilTime } from "@/utils/timezoneUtils";

interface DashboardMetricsSectionProps {
  metrics: Metrics;
  period: string;
  customStartDate?: Date;
  customEndDate?: Date;
  children?: React.ReactNode;
}

function getPreviousPeriod(period: string) {
  switch (period) {
    case "este-mes": return "mes-passado";
    case "esta-semana": return "semana-passada";
    case "hoje": return "ontem";
    default: return "mes-passado";
  }
}

// Função utilitária para arredondar valores para 2 casas decimais
function round2(val: number) {
  return Math.round(val * 100) / 100;
}

function getSimpleChange(current: number, previous: number) {
  // Arredonda antes de calcular
  current = round2(current);
  previous = round2(previous);

  if (Math.abs(previous) < 0.01) previous = 0;
  if (Math.abs(current) < 0.01) current = 0;

  if (current === 0 && previous === 0) {
    return "0% vs mês anterior";
  }
  if (previous === 0) {
    return current > 0 ? "+100% vs mês anterior" : "0% vs mês anterior";
  }
  const percent = ((current - previous) / previous) * 100;
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent.toFixed(1)}% vs mês anterior`;
}

// Função utilitária para variação percentual com denominador absoluto (usada para comparação diária)
function getDailyAbsChange(current: number, previous: number) {
  current = round2(current);
  previous = round2(previous);
  if (Math.abs(previous) < 0.01) previous = 0;
  if (Math.abs(current) < 0.01) current = 0;
  if (current === 0 && previous === 0) {
    return "0% vs mês anterior";
  }
  if (previous === 0) {
    return current > 0 ? "+100% vs mês anterior" : "0% vs mês anterior";
  }
  const percent = ((current - previous) / Math.abs(previous)) * 100;
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent.toFixed(2)}% vs mês anterior`;
}

// Função específica para saldo, usando valor absoluto no denominador
function calcularVariacaoSaldo(dados: { data: string, valor: number }[], dataReferencia?: Date): string {
  const ref = dataReferencia ? new Date(dataReferencia) : new Date();
  const anoAtual = ref.getFullYear();
  const mesAtual = ref.getMonth();
  const diaAtual = ref.getDate();
  const dataAnterior = new Date(anoAtual, mesAtual - 1, diaAtual);
  if (dataAnterior.getMonth() !== ((mesAtual + 11) % 12)) {
    return "Não há dados para o dia correspondente do mês anterior. Comparação indisponível.";
  }
  const formatar = (d: Date) => d.toISOString().slice(0, 10);
  const dataRefStr = formatar(ref);
  const dataAnteriorStr = formatar(dataAnterior);
  const valorAtualObj = dados.find(d => d.data === dataRefStr);
  const valorAnteriorObj = dados.find(d => d.data === dataAnteriorStr);
  const valorAtual = valorAtualObj ? round2(valorAtualObj.valor) : undefined;
  const valorAnterior = valorAnteriorObj ? round2(valorAnteriorObj.valor) : undefined;
  if (valorAtual === undefined || valorAnterior === undefined) {
    return "Faltam dados para realizar a comparação entre os dois meses.";
  }
  const variacao = ((valorAtual - valorAnterior) / Math.abs(valorAnterior)) * 100;
  const formatador = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const variacaoFormatada = `${variacao >= 0 ? '+' : ''}${formatador.format(variacao)}% vs mês anterior`;
  return variacaoFormatada;
}

// Função específica para lucro, usando valor absoluto no denominador
function calcularVariacaoLucro(dados: { data: string, valor: number }[], dataReferencia?: Date): string {
  const ref = dataReferencia ? new Date(dataReferencia) : new Date();
  const anoAtual = ref.getFullYear();
  const mesAtual = ref.getMonth();
  const diaAtual = ref.getDate();
  const dataAnterior = new Date(anoAtual, mesAtual - 1, diaAtual);
  if (dataAnterior.getMonth() !== ((mesAtual + 11) % 12)) {
    return "Não há dados para o dia correspondente do mês anterior. Comparação indisponível.";
  }
  const formatar = (d: Date) => d.toISOString().slice(0, 10);
  const dataRefStr = formatar(ref);
  const dataAnteriorStr = formatar(dataAnterior);
  const valorAtualObj = dados.find(d => d.data === dataRefStr);
  const valorAnteriorObj = dados.find(d => d.data === dataAnteriorStr);
  const valorAtual = valorAtualObj ? round2(valorAtualObj.valor) : undefined;
  const valorAnterior = valorAnteriorObj ? round2(valorAnteriorObj.valor) : undefined;
  if (valorAtual === undefined || valorAnterior === undefined) {
    return "Faltam dados para realizar a comparação entre os dois meses.";
  }
  // Usar valor absoluto só se o denominador for negativo
  const denominador = valorAnterior < 0 ? Math.abs(valorAnterior) : valorAnterior;
  const variacao = ((valorAtual - valorAnterior) / denominador) * 100;
  const formatador = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const variacaoFormatada = `${variacao >= 0 ? '+' : ''}${formatador.format(variacao)}% vs mês anterior`;
  return variacaoFormatada;
}

function calcularVariacaoValorPorKm(valorAtual: number, valorAnterior: number): string {
  valorAtual = round2(valorAtual);
  valorAnterior = round2(valorAnterior);
  if (valorAnterior === 0) {
    return valorAtual > 0 ? '+100% vs mês anterior' : '0% vs mês anterior';
  }
  const variacao = ((valorAtual - valorAnterior) / Math.abs(valorAnterior)) * 100;
  const formatador = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${variacao >= 0 ? '+' : ''}${formatador.format(variacao)}% vs mês anterior`;
}

const DashboardMetricsSection = ({ 
  metrics, 
  period, 
  customStartDate, 
  customEndDate,
  children
}: DashboardMetricsSectionProps) => {
  const { transactions, lancamentos, workHours, odometerRecords, user } = useUser();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Cálculo dos valores do período anterior usando a lógica correta de intervalo
  const prevMetrics = calculatePreviousMetrics(
    transactions,
    lancamentos,
    workHours,
    period,
    customStartDate,
    customEndDate
  );
  const prevReceita = prevMetrics.receita;
  const prevDespesa = prevMetrics.despesa;
  const prevSaldo = prevMetrics.saldo;
  const prevKmRodado = prevMetrics.kmRodado;
  const prevValorPorKm = prevMetrics.valorPorKm;
  const prevValorPorHora = prevMetrics.valorPorHora;

  // Variável global para o lucro mensal
  let lucroMesAtual: number | undefined = undefined;

  // Calculate revenue breakdown by category
  const getRevenueBreakdown = () => {
    const filteredTransactions = filterByPeriod(transactions, period, customStartDate, customEndDate);
    const revenueTransactions = filteredTransactions.filter(t => t.type === 'receita');
    
    const breakdown = revenueTransactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Outros';
      acc[category] = (acc[category] || 0) + transaction.value;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(breakdown)
      .map(([label, amount]) => ({
        label,
        value: formatCurrency(amount),
        amount
      }))
      .filter(item => item.amount > 0);
  };

  // Calculate expense breakdown by category and description
  const getExpenseBreakdown = () => {
    const filteredTransactions = filterByPeriod(transactions, period, customStartDate, customEndDate);
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'despesa');
    
    return expenseTransactions
      .map(transaction => {
        const category = transaction.category || 'Outros';
        const description = transaction.observation || transaction.subcategory || '';
        const label = description ? `${category} - ${description}` : category;
        
        return {
          label,
          value: formatCurrency(transaction.value),
          amount: transaction.value
        };
      })
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  };

  // Função para obter os valores de um dia específico e do mesmo dia do mês anterior, igual ao filtro personalizado
  function getValoresDiaPersonalizado(transactions: any[], tipo: 'receita' | 'despesa', dataReferencia: Date) {
    const anoAtual = dataReferencia.getFullYear();
    const mesAtual = dataReferencia.getMonth();
    const diaAtual = dataReferencia.getDate();
    const dataAnterior = new Date(anoAtual, mesAtual - 1, diaAtual);
    if (dataAnterior.getMonth() !== ((mesAtual + 11) % 12)) {
      return [];
    }
    const refStart = startOfDay(dataReferencia);
    const refEnd = endOfDay(dataReferencia);
    const antStart = startOfDay(dataAnterior);
    const antEnd = endOfDay(dataAnterior);
    const dados = transactions.filter(t => t.type === tipo).map(t => ({ data: t.date, valor: t.value }));
    const doDiaRefArr = dados.filter(item => {
      const dataObj = item.data instanceof Date ? item.data : new Date(item.data);
      return dataObj >= refStart && dataObj <= refEnd;
    });
    const doDiaAntArr = dados.filter(item => {
      const dataObj = item.data instanceof Date ? item.data : new Date(item.data);
      return dataObj >= antStart && dataObj <= antEnd;
    });
    const somaRef = doDiaRefArr.reduce((acc, cur) => acc + cur.valor, 0);
    const somaAnt = doDiaAntArr.reduce((acc, cur) => acc + cur.valor, 0);
    return [
      ...(doDiaRefArr.length ? [{ data: refStart.toISOString().slice(0,10), valor: somaRef }] : []),
      ...(doDiaAntArr.length ? [{ data: antStart.toISOString().slice(0,10), valor: somaAnt }] : [])
    ];
  }

  // Determina se deve usar a lógica customizada (hoje ou ontem)
  const isDiaUnico = period === 'hoje' || period === 'ontem';
  let receitaDiaVsMesAnterior, despesaDiaVsMesAnterior, saldoDiaVsMesAnterior;
  if (period === 'hoje') {
    const hoje = new Date();
    receitaDiaVsMesAnterior = calcularVariacaoFaturamento(getValoresDiaPersonalizado(transactions, 'receita', hoje), hoje);
    despesaDiaVsMesAnterior = calcularVariacaoFaturamento(getValoresDiaPersonalizado(transactions, 'despesa', hoje), hoje);
    // Calcular saldo do dia e do mês anterior corretamente
    const receitasHoje = getValoresDiaPersonalizado(transactions, 'receita', hoje).at(0)?.valor || 0;
    const despesasHoje = getValoresDiaPersonalizado(transactions, 'despesa', hoje).at(0)?.valor || 0;
    const saldoHoje = round2(receitasHoje - despesasHoje);
    const dataAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());
    const receitasAnt = getValoresDiaPersonalizado(transactions, 'receita', dataAnterior).at(0)?.valor || 0;
    const despesasAnt = getValoresDiaPersonalizado(transactions, 'despesa', dataAnterior).at(0)?.valor || 0;
    const saldoAnt = round2(Number(receitasAnt) - Number(despesasAnt));
    saldoDiaVsMesAnterior = getDailyAbsChange(saldoHoje, saldoAnt);
  } else if (period === 'ontem') {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    receitaDiaVsMesAnterior = calcularVariacaoFaturamento(getValoresDiaPersonalizado(transactions, 'receita', ontem), ontem);
    despesaDiaVsMesAnterior = calcularVariacaoFaturamento(getValoresDiaPersonalizado(transactions, 'despesa', ontem), ontem);
    // Calcular saldo do dia e do mês anterior corretamente
    const receitasOntem = getValoresDiaPersonalizado(transactions, 'receita', ontem).at(0)?.valor || 0;
    const despesasOntem = getValoresDiaPersonalizado(transactions, 'despesa', ontem).at(0)?.valor || 0;
    const saldoOntem = round2(receitasOntem - despesasOntem);
    const dataAnterior = new Date(ontem.getFullYear(), ontem.getMonth() - 1, ontem.getDate());
    const receitasAnt = getValoresDiaPersonalizado(transactions, 'receita', dataAnterior).at(0)?.valor || 0;
    const despesasAnt = getValoresDiaPersonalizado(transactions, 'despesa', dataAnterior).at(0)?.valor || 0;
    const saldoAnt = round2(Number(receitasAnt) - Number(despesasAnt));
    saldoDiaVsMesAnterior = getDailyAbsChange(saldoOntem, saldoAnt);
  } else {
    receitaDiaVsMesAnterior = getSimpleChange(metrics.receita, prevReceita);
    despesaDiaVsMesAnterior = getSimpleChange(metrics.despesa, prevDespesa);
    saldoDiaVsMesAnterior = getSimpleChange(metrics.saldo, prevSaldo);
  }

  // Função para buscar o último preço do litro de combustível antes ou no dia de referência
  function getLastFuelPrice(transactions, dataReferencia) {
    const abastecimentos = transactions
      .filter(t => t.type === 'despesa' && t.category === 'Combustível' && t.pricePerLiter)
      .filter(t => new Date(t.date) <= dataReferencia)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return abastecimentos[0]?.pricePerLiter || 0;
  }

  // Função para calcular o gasto de combustível
  function calcularGastoCombustivel(kmRodado: number, consumoMedio: number, valorLitro: number): number {
    const km = Number(kmRodado) || 0;
    const consumo = Number(consumoMedio) || 0;
    const valor = Number(valorLitro) || 0;
    if (consumo === 0 || valor === 0) return 0;
    const litros = km / consumo;
    return litros * valor;
  }

  // Função para calcular o lucro do dia
  function calcularLucroDia(dataReferencia: Date) {
    // Receita do dia
    const receitasDia = getValoresDiaPersonalizado(transactions, 'receita', dataReferencia).at(0)?.valor || 0;
    // KM rodado do dia
    const refStart = startOfDay(convertToBrazilTime(dataReferencia));
    const refEnd = endOfDay(convertToBrazilTime(dataReferencia));
    const kmRodadoDia = (() => {
      if (!odometerRecords) return 0;
      // Filtra ciclos completos do odômetro que começam e terminam no dia
      const ciclos = agruparCiclosPorPairId(odometerRecords);
      let totalKm = 0;
      ciclos.forEach(ciclo => {
        if (ciclo.inicial && ciclo.final) {
          const dataInicial = convertToBrazilTime(ciclo.inicial.date);
          if (dataInicial >= refStart && dataInicial <= refEnd) {
            const valorInicial = Number(ciclo.inicial.value ?? 0);
            const valorFinal = Number(ciclo.final.value ?? 0);
            if (!isNaN(valorInicial) && !isNaN(valorFinal)) {
              const distancia = Number(valorFinal) - Number(valorInicial);
              if (distancia > 0) totalKm += distancia;
            }
          }
        }
      });
      return totalKm;
    })();
    // Consumo médio do usuário
    const consumoMedio = user?.fuelConsumption || 0;
    // Valor do litro do último abastecimento
    const valorLitro = getLastFuelPrice(transactions, dataReferencia);
    // Gasto de combustível
    const gastoCombustivel = calcularGastoCombustivel(kmRodadoDia, consumoMedio, valorLitro);
    // Lucro
    return Number(receitasDia) - Number(gastoCombustivel);
  }

  let lucroDiaVsMesAnterior;
  if (period === 'hoje' || period === 'ontem' || period === 'personalizado') {
    let dataRef;
    if (period === 'hoje') {
      dataRef = new Date();
    } else if (period === 'ontem') {
      dataRef = new Date();
      dataRef.setDate(dataRef.getDate() - 1);
    } else if (period === 'personalizado' && customStartDate) {
      dataRef = customStartDate;
    }
    // Lucro do dia de referência
    const lucroHoje = calcularLucroDia(dataRef);
    // Lucro do mesmo dia do mês anterior
    const dataAnterior = new Date(dataRef.getFullYear(), dataRef.getMonth() - 1, dataRef.getDate());
    const antStart = startOfDay(convertToBrazilTime(dataAnterior));
    const antEnd = endOfDay(convertToBrazilTime(dataAnterior));
    const lucroAnt = calcularLucroDia(dataAnterior);
    // Percentual
    const denominador = Math.abs(lucroAnt);
    let variacaoLucro;
    if (denominador === 0) {
      variacaoLucro = lucroHoje > 0 ? '+100% vs mês anterior' : '0% vs mês anterior';
    } else {
      const variacao = ((lucroHoje - lucroAnt) / denominador) * 100;
      const formatador = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      variacaoLucro = `${variacao >= 0 ? '+' : ''}${formatador.format(variacao)}% vs mês anterior`;
    }
    lucroDiaVsMesAnterior = variacaoLucro;
  } else if (period === 'este-mes') {
    let lucroMesAtual: number | undefined = undefined;
    // Lucro do mês atual: soma do lucro de cada dia do mês atual
    const now = convertToBrazilTime(new Date());
    const anoAtual = now.getFullYear();
    const mesAtual = now.getMonth();
    const mesAtualStart = startOfDay(new Date(anoAtual, mesAtual, 1));
    const mesAtualEnd = endOfDay(new Date(anoAtual, mesAtual + 1, 0));
    const diasNoMesAtual = mesAtualEnd.getDate();
    for (let dia = 1; dia <= diasNoMesAtual; dia++) {
      const data = new Date(anoAtual, mesAtual, dia);
      if (data > now) break;
      // Logs detalhados do cálculo de lucro do dia
      const receitasDia = getValoresDiaPersonalizado(transactions, 'receita', data).at(0)?.valor || 0;
      const refStart = startOfDay(convertToBrazilTime(data));
      const refEnd = endOfDay(convertToBrazilTime(data));
      const kmRodadoDia = (() => {
        if (!odometerRecords) return 0;
        const ciclos = agruparCiclosPorPairId(odometerRecords);
        let totalKm = 0;
        ciclos.forEach(ciclo => {
          if (ciclo.inicial && ciclo.final) {
            const dataInicial = convertToBrazilTime(ciclo.inicial.date);
            if (dataInicial >= refStart && dataInicial <= refEnd) {
              const valorInicial = Number(ciclo.inicial.value ?? 0);
              const valorFinal = Number(ciclo.final.value ?? 0);
              if (!isNaN(valorInicial) && !isNaN(valorFinal)) {
                const distancia = Number(valorFinal) - Number(valorInicial);
                if (distancia > 0) totalKm += distancia;
              }
            }
          }
        });
        return totalKm;
      })();
      const consumoMedio = user?.fuelConsumption || 0;
      const valorLitro = getLastFuelPrice(transactions, data);
      const gastoCombustivel = calcularGastoCombustivel(kmRodadoDia, consumoMedio, valorLitro);
      const lucroDia = Number(receitasDia) - Number(gastoCombustivel);
      if (isNaN(lucroDia)) {
        console.warn(`[LUCRO MENSAL DEBUG] Dia com NaN: ${dia}/${mesAtual+1}/${anoAtual}, receitasDia=${receitasDia}, kmRodadoDia=${kmRodadoDia}, consumoMedio=${consumoMedio}, valorLitro=${valorLitro}, gastoCombustivel=${gastoCombustivel}`);
        continue; // ignora este dia na soma
      }
      if (typeof lucroMesAtual !== 'number' || isNaN(lucroMesAtual)) lucroMesAtual = 0;
      lucroMesAtual += Number(lucroDia);
    }

    // Lucro do mês anterior: soma do lucro de cada dia do mês anterior (mês fechado)
    const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
    const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
    const mesAnteriorStart = startOfDay(new Date(anoAnterior, mesAnterior, 1));
    const mesAnteriorEnd = endOfDay(new Date(anoAnterior, mesAnterior + 1, 0));
    const diasNoMesAnterior = mesAnteriorEnd.getDate();
    let lucroMesAnterior = 0;
    const diasConsideradosAnterior: number[] = [];
    for (let dia = 1; dia <= diasNoMesAnterior; dia++) {
      const data = new Date(anoAnterior, mesAnterior, dia);
      const lucroDia = calcularLucroDia(data);
      lucroMesAnterior += Number(lucroDia);
      diasConsideradosAnterior.push(dia);
    }

    console.log('DEBUG LUCRO MENSAL:', {
      lucroMesAtual,
      lucroMesAnterior,
      percentDebug: getDailyAbsChange(lucroMesAtual, lucroMesAnterior)
    });
    lucroDiaVsMesAnterior = getDailyAbsChange(lucroMesAtual, lucroMesAnterior);
  } else {
    lucroDiaVsMesAnterior = undefined;
  }

  // Função para calcular o KM rodado de um dia específico (já ajustada para horário de Brasília)
  function calcularKmRodadoDia(dataReferencia: Date) {
    if (!odometerRecords) return 0;
    // Corrigido: calcula início/fim do dia em UTC, depois converte para Brasília
    const refStart = convertToBrazilTime(startOfDay(dataReferencia));
    const refEnd = convertToBrazilTime(endOfDay(dataReferencia));
    const ciclos = agruparCiclosPorPairId(odometerRecords);
    let totalKm = 0;
    ciclos.forEach(ciclo => {
      if (ciclo.inicial && ciclo.final) {
        const dataInicial = convertToBrazilTime(ciclo.inicial.date);
        const valorInicial = Number(ciclo.inicial.value ?? 0);
        const valorFinal = Number(ciclo.final.value ?? 0);
        if (!isNaN(valorInicial) && !isNaN(valorFinal) && dataInicial >= refStart && dataInicial <= refEnd) {
          const distancia = Number(valorFinal) - Number(valorInicial);
          if (distancia > 0) totalKm += distancia;
        }
      }
    });
    return round2(Number(totalKm));
  }

  // Função para calcular o gasto de combustível do dia
  function calcularGastoCombustivelDia(dataReferencia: Date) {
    const km = calcularKmRodadoDia(dataReferencia);
    const consumoMedio = user?.fuelConsumption || 0;
    const valorLitro = getLastFuelPrice(transactions, dataReferencia);
    return round2(calcularGastoCombustivel(km, consumoMedio, valorLitro));
  }

  // Função para calcular a variação percentual do KM rodado
  function calcularVariacaoKmRodado(kmAtual: number, kmAnterior: number): string {
    kmAtual = round2(kmAtual);
    kmAnterior = round2(kmAnterior);
    if (kmAnterior === 0) {
      return kmAtual > 0 ? '+100% vs mês anterior' : '0% vs mês anterior';
    }
    const variacao = ((kmAtual - kmAnterior) / Math.abs(kmAnterior)) * 100;
    const formatador = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${variacao >= 0 ? '+' : ''}${formatador.format(variacao)}% vs mês anterior`;
  }

  // --- KM Rodado ---
  let kmRodadoMesVsMesAnterior = undefined;
  if (period === 'hoje' || period === 'ontem' || (period === 'personalizado' && customStartDate && customEndDate && customStartDate.toDateString() === customEndDate.toDateString())) {
    // Filtro de um único dia
    let dataRef;
    if (period === 'hoje') {
      dataRef = new Date();
    } else if (period === 'ontem') {
      dataRef = new Date();
      dataRef.setDate(dataRef.getDate() - 1);
    } else if (period === 'personalizado' && customStartDate) {
      dataRef = customStartDate;
    }
    // Garantir timezone de Brasília
    const refBrazil = convertToBrazilTime(dataRef);
    const refStart = startOfDay(refBrazil);
    const refEnd = endOfDay(refBrazil);

    const dataAnterior = new Date(refBrazil);
    dataAnterior.setMonth(dataAnterior.getMonth() - 1);
    const antStart = startOfDay(dataAnterior);
    const antEnd = endOfDay(dataAnterior);
    // Agrupar ciclos completos
    const ciclosCompletos = agruparCiclosPorPairId(odometerRecords);
    // Filtrar ciclos cujo registro inicial está no dia de referência (Brasília)
    const kmHoje = ciclosCompletos.filter(ciclo => {
      if (!ciclo.inicial) return false;
      const dataInicial = convertToBrazilTime(ciclo.inicial.date);
      return dataInicial >= refStart && dataInicial <= refEnd;
    }).reduce((acc, ciclo) => {
      if (ciclo.inicial && ciclo.final) {
        const valorFinal = Number(ciclo.final?.value ?? 0);
        const valorInicial = Number(ciclo.inicial?.value ?? 0);
        const distancia = valorFinal - valorInicial;
        return distancia > 0 ? acc + distancia : acc;
      }
      return acc;
    }, 0);
    // Filtrar ciclos cujo registro inicial está no mesmo dia do mês anterior (Brasília)
    const ciclosAnt = ciclosCompletos.filter(ciclo => {
      if (!ciclo.inicial) return false;
      const dataInicial = convertToBrazilTime(ciclo.inicial.date);
      return dataInicial >= antStart && dataInicial <= antEnd;
    });
    // LOG: todos os ciclos completos
    console.log('[VALOR POR KM DEBUG] TODOS CICLOS COMPLETOS:', ciclosCompletos.map(ciclo => ({
      inicial: ciclo.inicial?.value,
      final: ciclo.final?.value,
      dataInicial: ciclo.inicial?.date,
      dataFinal: ciclo.final?.date
    })));
    // LOG: datas do período anterior
    console.log('[VALOR POR KM DEBUG] antStart:', antStart, '| antEnd:', antEnd);
    // LOG: ciclos considerados para kmAnt
    console.log('[VALOR POR KM DEBUG] CICLOS CONSIDERADOS PARA KM ANT:', ciclosAnt.map(ciclo => ({
      inicial: ciclo.inicial?.value,
      final: ciclo.final?.value,
      dataInicial: ciclo.inicial?.date,
      dataFinal: ciclo.final?.date
    })));
    const kmAnt = ciclosAnt.reduce((acc, ciclo) => {
      if (ciclo.inicial && ciclo.final) {
        const valorFinal = Number(ciclo.final?.value ?? 0);
        const valorInicial = Number(ciclo.inicial?.value ?? 0);
        const distancia = valorFinal - valorInicial;
        return distancia > 0 ? acc + distancia : acc;
      }
      return acc;
    }, 0);
    // Logs de depuração
    console.log('--- KM Rodado Debug (ciclos completos) ---');
    console.log('refStart:', refStart, 'refEnd:', refEnd, 'antStart:', antStart, 'antEnd:', antEnd);
    console.log('kmHoje:', kmHoje, 'kmAnt:', kmAnt);
    // Log extra para depuração do cálculo percentual
    const percentDebug = ((kmHoje - kmAnt) / kmAnt) * 100;
    console.log('DEBUG PERCENTUAL KM RODADO:', { kmHoje, kmAnt, percentDebug });
    kmRodadoMesVsMesAnterior = getDailyAbsChange(kmHoje, kmAnt);
  } else if (period === 'este-mes') {
    // Soma todos os ciclos completos do mês atual (do dia 1 ao último dia do mês atual)
    const now = convertToBrazilTime(new Date());
    const anoAtual = now.getFullYear();
    const mesAtual = now.getMonth();
    const mesAtualStart = startOfDay(new Date(anoAtual, mesAtual, 1));
    const mesAtualEnd = endOfDay(new Date(anoAtual, mesAtual + 1, 0)); // último dia do mês atual

    const ciclosCompletosAtual = agruparCiclosPorPairId(odometerRecords)
      .filter(ciclo => {
        if (!ciclo.inicial) return false;
        const dataBrasil = convertToBrazilTime(ciclo.inicial.date);
        return dataBrasil >= mesAtualStart && dataBrasil <= mesAtualEnd;
      });
    const kmRodadoMesAtualFinal = ciclosCompletosAtual.reduce((acc, ciclo) => {
      if (ciclo.inicial && ciclo.final) {
        const valorFinal = Number(ciclo.final?.value ?? 0);
        const valorInicial = Number(ciclo.inicial?.value ?? 0);
        const distancia = valorFinal - valorInicial;
        return distancia > 0 ? acc + distancia : acc;
      }
      return acc;
    }, 0);

    // Soma todos os ciclos completos do mês anterior (mês fechado)
    const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
    const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
    const mesAnteriorStart = startOfDay(new Date(anoAnterior, mesAnterior, 1));
    const mesAnteriorEnd = endOfDay(new Date(anoAnterior, mesAnterior + 1, 0)); // último dia do mês anterior
    const ciclosCompletosAnterior = agruparCiclosPorPairId(odometerRecords)
      .filter(ciclo => {
        if (!ciclo.inicial) return false;
        const dataBrasil = convertToBrazilTime(ciclo.inicial.date);
        return dataBrasil >= mesAnteriorStart && dataBrasil <= mesAnteriorEnd;
      });
    const kmRodadoMesAnteriorFinal = ciclosCompletosAnterior.reduce((acc, ciclo) => {
      if (ciclo.inicial && ciclo.final) {
        const valorFinal = Number(ciclo.final?.value ?? 0);
        const valorInicial = Number(ciclo.inicial?.value ?? 0);
        const distancia = valorFinal - valorInicial;
        return distancia > 0 ? acc + distancia : acc;
      }
      return acc;
    }, 0);

    kmRodadoMesVsMesAnterior = getDailyAbsChange(kmRodadoMesAtualFinal, kmRodadoMesAnteriorFinal);
  } else if (period === 'personalizado' && customStartDate && customEndDate) {
    // Filtro de intervalo personalizado
    const refStart = convertToBrazilTime(startOfDay(convertToBrazilTime(customStartDate)));
    const refEnd = convertToBrazilTime(endOfDay(convertToBrazilTime(customEndDate)));
    const kmAtual = lancamentos.filter(l => l.status === 'completo' && l.dataLancamento &&
      convertToBrazilTime(new Date(l.dataLancamento)) >= refStart &&
      convertToBrazilTime(new Date(l.dataLancamento)) <= refEnd
    ).reduce((acc, l) => acc + Number(l.quilometragemPercorrida || 0), 0);
    // Mesmo intervalo do mês anterior
    const dataAnteriorStart = new Date(refStart);
    dataAnteriorStart.setMonth(dataAnteriorStart.getMonth() - 1);
    const dataAnteriorEnd = new Date(refEnd);
    dataAnteriorEnd.setMonth(dataAnteriorEnd.getMonth() - 1);
    const antStart = convertToBrazilTime(dataAnteriorStart);
    const antEnd = convertToBrazilTime(dataAnteriorEnd);
    const ciclosAnt = lancamentos.filter(l => l.status === 'completo' && l.dataLancamento &&
      convertToBrazilTime(new Date(l.dataLancamento)) >= antStart &&
      convertToBrazilTime(new Date(l.dataLancamento)) <= antEnd
    ).reduce((acc, l) => acc + Number(l.quilometragemPercorrida || 0), 0);
    kmRodadoMesVsMesAnterior = getDailyAbsChange(kmAtual, ciclosAnt);
  } else {
    kmRodadoMesVsMesAnterior = getSimpleChange(metrics.kmRodado, prevKmRodado);
  }

  // --- Gasto de Combustível Mensal (soma dos dias) ---
  let gastoCombustivelMensal = 0;
  if (period === 'este-mes') {
    const now = convertToBrazilTime(new Date());
    const anoAtual = now.getFullYear();
    const mesAtual = now.getMonth();
    const mesAtualEnd = endOfDay(new Date(anoAtual, mesAtual + 1, 0));
    const diasNoMesAtual = mesAtualEnd.getDate();
    for (let dia = 1; dia <= diasNoMesAtual; dia++) {
      const data = new Date(anoAtual, mesAtual, dia);
      if (data > now) break;
      // KM rodado do dia
      const refStart = startOfDay(convertToBrazilTime(data));
      const refEnd = endOfDay(convertToBrazilTime(data));
      const kmRodadoDia = (() => {
        if (!odometerRecords) return 0;
        const ciclos = agruparCiclosPorPairId(odometerRecords);
        let totalKm = 0;
        ciclos.forEach(ciclo => {
          if (ciclo.inicial && ciclo.final) {
            const dataInicial = convertToBrazilTime(ciclo.inicial.date);
            if (dataInicial >= refStart && dataInicial <= refEnd) {
              const valorInicial = Number(ciclo.inicial.value ?? 0);
              const valorFinal = Number(ciclo.final.value ?? 0);
              if (!isNaN(valorInicial) && !isNaN(valorFinal)) {
                const distancia = Number(valorFinal) - Number(valorInicial);
                if (distancia > 0) totalKm += distancia;
              }
            }
          }
        });
        return totalKm;
      })();
      // Consumo médio
      const consumoMedio = user?.fuelConsumption || 0;
      // Valor do litro do último abastecimento até o dia
      const abastecimentos = transactions
        .filter(t => t.type === 'despesa' && t.fuelType && t.pricePerLiter && new Date(t.date) <= data)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const valorLitro = abastecimentos[0]?.pricePerLiter || 0;
      // Gasto do dia
      const gastoDia = consumoMedio > 0 ? (kmRodadoDia / consumoMedio) * valorLitro : 0;
      gastoCombustivelMensal += gastoDia;
    }
  }

  // --- Gasto de Combustível ---
  let gastoCombustivelDiaVsMesAnterior;
  if (period === 'este-mes') {
    gastoCombustivelDiaVsMesAnterior = formatCurrency(gastoCombustivelMensal);
  } else if (period === 'hoje' || period === 'ontem' || period === 'personalizado') {
    let dataRef;
    if (period === 'hoje') {
      dataRef = new Date();
    } else if (period === 'ontem') {
      dataRef = new Date();
      dataRef.setDate(dataRef.getDate() - 1);
    } else if (period === 'personalizado' && customStartDate) {
      dataRef = customStartDate;
    }
    const gastoHoje = round2(calcularGastoCombustivelDia(dataRef));
    const dataAnterior = new Date(dataRef.getFullYear(), dataRef.getMonth() - 1, dataRef.getDate());
    const gastoAnt = round2(calcularGastoCombustivelDia(dataAnterior));
    gastoCombustivelDiaVsMesAnterior = getDailyAbsChange(gastoHoje, gastoAnt);
  } else {
    gastoCombustivelDiaVsMesAnterior = undefined;
  }

  // --- R$ por KM ---
  function calcularValorPorKmDia(receita: number, km: number): number {
    if (!km || km === 0) return 0;
    return round2(receita / km);
  }
  let valorPorKmDiaVsMesAnterior;
  let receitaHoje = 0, kmHoje = 0, valorPorKmHoje = 0, receitaAnt = 0, kmAnt = 0, valorPorKmAnt = 0;
  if (period === 'hoje' || period === 'ontem' || (period === 'personalizado' && customStartDate && customEndDate && customStartDate.toDateString() === customEndDate.toDateString())) {
    let dataRef;
    if (period === 'hoje') {
      dataRef = new Date();
    } else if (period === 'ontem') {
      dataRef = new Date();
      dataRef.setDate(dataRef.getDate() - 1);
    } else if (period === 'personalizado' && customStartDate) {
      dataRef = customStartDate;
    }
    receitaHoje = getValoresDiaPersonalizado(transactions, 'receita', dataRef).at(0)?.valor || 0;
    kmHoje = calcularKmRodadoDia(dataRef);
    valorPorKmHoje = calcularValorPorKmDia(receitaHoje, kmHoje);
    const dataAnterior = new Date(dataRef.getFullYear(), dataRef.getMonth() - 1, dataRef.getDate());
    receitaAnt = getValoresDiaPersonalizado(transactions, 'receita', dataAnterior).at(0)?.valor || 0;
    kmAnt = calcularKmRodadoDia(dataAnterior);
    valorPorKmAnt = calcularValorPorKmDia(receitaAnt, kmAnt);
    valorPorKmDiaVsMesAnterior = getDailyAbsChange(valorPorKmHoje, valorPorKmAnt);
    // LOGS
    console.log('[VALOR POR KM DEBUG] receitaHoje:', receitaHoje, '| kmHoje:', kmHoje, '| valorPorKmHoje:', valorPorKmHoje);
    console.log('[VALOR POR KM DEBUG] receitaAnt:', receitaAnt, '| kmAnt:', kmAnt, '| valorPorKmAnt:', valorPorKmAnt);
    console.log('[VALOR POR KM DEBUG] valorPorKmDiaVsMesAnterior:', valorPorKmDiaVsMesAnterior);
  } else {
    // Lógica de mês para 'este-mes' e 'mes-passado'
    let anoAtual, mesAtual;
    if (period === 'mes-passado') {
      const now = new Date();
      anoAtual = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      mesAtual = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    } else {
      const now = new Date();
      anoAtual = now.getFullYear();
      mesAtual = now.getMonth();
    }
    // Soma receita e km do mês atual (ou mês passado)
    receitaHoje = transactions.filter(t => t.type === 'receita' && new Date(t.date).getFullYear() === anoAtual && new Date(t.date).getMonth() === mesAtual).reduce((acc, t) => acc + t.value, 0);
    // KM rodado do mês
    const mesStart = startOfDay(new Date(anoAtual, mesAtual, 1));
    const mesEnd = endOfDay(new Date(anoAtual, mesAtual + 1, 0));
    const ciclosCompletos = agruparCiclosPorPairId(odometerRecords);
    kmHoje = ciclosCompletos.filter(ciclo => {
      if (!ciclo.inicial) return false;
      const dataBrasil = convertToBrazilTime(ciclo.inicial.date);
      return dataBrasil >= mesStart && dataBrasil <= mesEnd;
    }).reduce((acc, ciclo) => {
      if (ciclo.inicial && ciclo.final) {
        const valorFinal = Number(ciclo.final?.value ?? 0);
        const valorInicial = Number(ciclo.inicial?.value ?? 0);
        const distancia = valorFinal - valorInicial;
        return distancia > 0 ? acc + distancia : acc;
      }
      return acc;
    }, 0);
    valorPorKmHoje = calcularValorPorKmDia(receitaHoje, kmHoje);
    // Mês anterior ao atual (ou mês retrasado se for 'mes-passado')
    let anoAnt, mesAnt;
    if (period === 'mes-passado') {
      mesAnt = mesAtual === 0 ? 11 : mesAtual - 1;
      anoAnt = mesAtual === 0 ? anoAtual - 1 : anoAtual;
    } else {
      mesAnt = mesAtual === 0 ? 11 : mesAtual - 1;
      anoAnt = mesAtual === 0 ? anoAtual - 1 : anoAtual;
    }
    receitaAnt = transactions.filter(t => t.type === 'receita' && new Date(t.date).getFullYear() === anoAnt && new Date(t.date).getMonth() === mesAnt).reduce((acc, t) => acc + t.value, 0);
    const mesAntStart = startOfDay(new Date(anoAnt, mesAnt, 1));
    const mesAntEnd = endOfDay(new Date(anoAnt, mesAnt + 1, 0));
    kmAnt = ciclosCompletos.filter(ciclo => {
      if (!ciclo.inicial) return false;
      const dataBrasil = convertToBrazilTime(ciclo.inicial.date);
      return dataBrasil >= mesAntStart && dataBrasil <= mesAntEnd;
    }).reduce((acc, ciclo) => {
      if (ciclo.inicial && ciclo.final) {
        const valorFinal = Number(ciclo.final?.value ?? 0);
        const valorInicial = Number(ciclo.inicial?.value ?? 0);
        const distancia = valorFinal - valorInicial;
        return distancia > 0 ? acc + distancia : acc;
      }
      return acc;
    }, 0);
    valorPorKmAnt = calcularValorPorKmDia(receitaAnt, kmAnt);
    valorPorKmDiaVsMesAnterior = getDailyAbsChange(valorPorKmHoje, valorPorKmAnt);
    // LOGS
    console.log('[VALOR POR KM DEBUG] receitaHoje:', receitaHoje, '| kmHoje:', kmHoje, '| valorPorKmHoje:', valorPorKmHoje);
    console.log('[VALOR POR KM DEBUG] receitaAnt:', receitaAnt, '| kmAnt:', kmAnt, '| valorPorKmAnt:', valorPorKmAnt);
    console.log('[VALOR POR KM DEBUG] valorPorKmDiaVsMesAnterior:', valorPorKmDiaVsMesAnterior);
  }

  // --- Lucro ---
  if (period === 'este-mes') {
    // Lucro do mês atual: receita total - gasto de combustível mensal (soma dos dias)
    const receitaMesAtual = metrics.receita;
    lucroMesAtual = receitaMesAtual - gastoCombustivelMensal;
    // O comparativo percentual pode ser mantido como estava, se desejar
  } else if (period === 'hoje' || period === 'ontem' || period === 'personalizado') {
    let dataRef;
    if (period === 'hoje') {
      dataRef = new Date();
    } else if (period === 'ontem') {
      dataRef = new Date();
      dataRef.setDate(dataRef.getDate() - 1);
    } else if (period === 'personalizado' && customStartDate) {
      dataRef = customStartDate;
    }
    const lucroHoje = round2(calcularLucroDia(dataRef));
    const dataAnterior = new Date(dataRef.getFullYear(), dataRef.getMonth() - 1, dataRef.getDate());
    const lucroAnt = round2(calcularLucroDia(dataAnterior));
    const denominador = Math.abs(lucroAnt);
    let variacaoLucro;
    if (denominador === 0) {
      variacaoLucro = lucroHoje > 0 ? '+100% vs mês anterior' : '0% vs mês anterior';
    } else {
      const variacao = ((lucroHoje - lucroAnt) / denominador) * 100;
      const formatador = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      variacaoLucro = `${variacao >= 0 ? '+' : ''}${formatador.format(variacao)}% vs mês anterior`;
    }
    lucroDiaVsMesAnterior = variacaoLucro;
  } else {
    lucroDiaVsMesAnterior = undefined;
  }

  // --- Receita Total ---
  let receitaMesVsMesAnterior = undefined;
  if (period === 'hoje' || period === 'ontem' || (period === 'personalizado' && customStartDate && customEndDate && customStartDate.toDateString() === customEndDate.toDateString())) {
    // Filtro de um único dia
    let dataRef;
    if (period === 'hoje') {
      dataRef = new Date();
    } else if (period === 'ontem') {
      dataRef = new Date();
      dataRef.setDate(dataRef.getDate() - 1);
    } else if (period === 'personalizado' && customStartDate) {
      dataRef = customStartDate;
    }
    // Receita do dia de referência
    const refStart = startOfDay(dataRef);
    const refEnd = endOfDay(dataRef);
    const receitaHoje = transactions.filter(t => t.type === 'receita' && new Date(t.date) >= refStart && new Date(t.date) <= refEnd).reduce((acc, t) => acc + t.value, 0);
    // Receita do mesmo dia do mês anterior
    const dataAnterior = new Date(dataRef.getFullYear(), dataRef.getMonth() - 1, dataRef.getDate());
    const antStart = startOfDay(dataAnterior);
    const antEnd = endOfDay(dataAnterior);
    const receitaAnt = transactions.filter(t => t.type === 'receita' && new Date(t.date) >= antStart && new Date(t.date) <= antEnd).reduce((acc, t) => acc + t.value, 0);
    receitaMesVsMesAnterior = getDailyAbsChange(receitaHoje, receitaAnt);
  } else if (period === 'este-mes') {
    // Soma todas as receitas do mês atual (até hoje)
    const now = new Date();
    const anoAtual = now.getFullYear();
    const mesAtual = now.getMonth();
    const receitasMesAtual = transactions.filter(t => t.type === 'receita' &&
      new Date(t.date).getFullYear() === anoAtual &&
      new Date(t.date).getMonth() === mesAtual
    ).reduce((acc, t) => acc + Number(t.value), 0);

    // Soma todas as receitas do mês anterior (mês fechado)
    const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
    const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
    const receitasMesAnterior = transactions.filter(t => t.type === 'receita' &&
      new Date(t.date).getFullYear() === anoAnterior &&
      new Date(t.date).getMonth() === mesAnterior
    ).reduce((acc, t) => acc + Number(t.value), 0);

    receitaMesVsMesAnterior = getDailyAbsChange(receitasMesAtual, receitasMesAnterior);
  } else if (period === 'personalizado' && customStartDate && customEndDate) {
    // Filtro de intervalo personalizado
    const refStart = startOfDay(customStartDate);
    const refEnd = endOfDay(customEndDate);
    const receitaAtual = transactions.filter(t => t.type === 'receita' && new Date(t.date) >= refStart && new Date(t.date) <= refEnd).reduce((acc, t) => acc + Number(t.value), 0);
    // Mesmo intervalo do mês anterior
    const dataAnteriorStart = new Date(refStart);
    dataAnteriorStart.setMonth(dataAnteriorStart.getMonth() - 1);
    const dataAnteriorEnd = new Date(refEnd);
    dataAnteriorEnd.setMonth(dataAnteriorEnd.getMonth() - 1);
    const receitaAnt = transactions.filter(t => t.type === 'receita' && new Date(t.date) >= dataAnteriorStart && new Date(t.date) <= dataAnteriorEnd).reduce((acc, t) => acc + Number(t.value), 0);
    receitaMesVsMesAnterior = getDailyAbsChange(receitaAtual, receitaAnt);
  } else {
    receitaMesVsMesAnterior = getSimpleChange(metrics.receita, prevReceita);
  }

  // --- Despesa Total ---
  let despesaMesVsMesAnterior = undefined;
  if (period === 'hoje' || period === 'ontem' || (period === 'personalizado' && customStartDate && customEndDate && customStartDate.toDateString() === customEndDate.toDateString())) {
    // Filtro de um único dia
    let dataRef;
    if (period === 'hoje') {
      dataRef = new Date();
    } else if (period === 'ontem') {
      dataRef = new Date();
      dataRef.setDate(dataRef.getDate() - 1);
    } else if (period === 'personalizado' && customStartDate) {
      dataRef = customStartDate;
    }
    // Despesa do dia de referência
    const refStart = startOfDay(dataRef);
    const refEnd = endOfDay(dataRef);
    const despesaHoje = transactions.filter(t => t.type === 'despesa' && new Date(t.date) >= refStart && new Date(t.date) <= refEnd).reduce((acc, t) => acc + t.value, 0);
    // Despesa do mesmo dia do mês anterior
    const dataAnterior = new Date(dataRef.getFullYear(), dataRef.getMonth() - 1, dataRef.getDate());
    const antStart = startOfDay(dataAnterior);
    const antEnd = endOfDay(dataAnterior);
    const despesaAnt = transactions.filter(t => t.type === 'despesa' && new Date(t.date) >= antStart && new Date(t.date) <= antEnd).reduce((acc, t) => acc + t.value, 0);
    despesaMesVsMesAnterior = getDailyAbsChange(despesaHoje, despesaAnt);
  } else if (period === 'este-mes') {
    // Soma todas as despesas do mês atual (até hoje)
    const now = new Date();
    const anoAtual = now.getFullYear();
    const mesAtual = now.getMonth();
    const despesasMesAtual = transactions.filter(t => t.type === 'despesa' &&
      new Date(t.date).getFullYear() === anoAtual &&
      new Date(t.date).getMonth() === mesAtual
    ).reduce((acc, t) => acc + Number(t.value), 0);

    // Soma todas as despesas do mês anterior (mês fechado)
    const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
    const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
    const despesasMesAnterior = transactions.filter(t => t.type === 'despesa' &&
      new Date(t.date).getFullYear() === anoAnterior &&
      new Date(t.date).getMonth() === mesAnterior
    ).reduce((acc, t) => acc + Number(t.value), 0);

    despesaMesVsMesAnterior = getDailyAbsChange(despesasMesAtual, despesasMesAnterior);
  } else if (period === 'personalizado' && customStartDate && customEndDate) {
    // Filtro de intervalo personalizado
    const refStart = startOfDay(customStartDate);
    const refEnd = endOfDay(customEndDate);
    const despesaAtual = transactions.filter(t => t.type === 'despesa' && new Date(t.date) >= refStart && new Date(t.date) <= refEnd).reduce((acc, t) => acc + Number(t.value), 0);
    // Mesmo intervalo do mês anterior
    const dataAnteriorStart = new Date(refStart);
    dataAnteriorStart.setMonth(dataAnteriorStart.getMonth() - 1);
    const dataAnteriorEnd = new Date(refEnd);
    dataAnteriorEnd.setMonth(dataAnteriorEnd.getMonth() - 1);
    const despesaAnt = transactions.filter(t => t.type === 'despesa' && new Date(t.date) >= dataAnteriorStart && new Date(t.date) <= dataAnteriorEnd).reduce((acc, t) => acc + Number(t.value), 0);
    despesaMesVsMesAnterior = getDailyAbsChange(despesaAtual, despesaAnt);
  } else {
    despesaMesVsMesAnterior = getSimpleChange(metrics.despesa, prevDespesa);
  }

  // --- Saldo Total ---
  let saldoMesVsMesAnterior = undefined;
  if (period === 'hoje' || period === 'ontem' || (period === 'personalizado' && customStartDate && customEndDate && customStartDate.toDateString() === customEndDate.toDateString())) {
    // Filtro de um único dia
    let dataRef;
    if (period === 'hoje') {
      dataRef = new Date();
    } else if (period === 'ontem') {
      dataRef = new Date();
      dataRef.setDate(dataRef.getDate() - 1);
    } else if (period === 'personalizado' && customStartDate) {
      dataRef = customStartDate;
    }
    // Receita e despesa do dia de referência
    const refStart = startOfDay(dataRef);
    const refEnd = endOfDay(dataRef);
    const receitaHoje = transactions.filter(t => t.type === 'receita' && new Date(t.date) >= refStart && new Date(t.date) <= refEnd).reduce((acc, t) => acc + Number(t.value), 0);
    const despesaHoje = transactions.filter(t => t.type === 'despesa' && new Date(t.date) >= refStart && new Date(t.date) <= refEnd).reduce((acc, t) => acc + Number(t.value), 0);
    const saldoHoje = receitaHoje - despesaHoje;
    // Receita e despesa do mesmo dia do mês anterior
    const dataAnterior = new Date(dataRef.getFullYear(), dataRef.getMonth() - 1, dataRef.getDate());
    const antStart = startOfDay(dataAnterior);
    const antEnd = endOfDay(dataAnterior);
    const receitaAnt = transactions.filter(t => t.type === 'receita' && new Date(t.date) >= antStart && new Date(t.date) <= antEnd).reduce((acc, t) => acc + Number(t.value), 0);
    const despesaAnt = transactions.filter(t => t.type === 'despesa' && new Date(t.date) >= antStart && new Date(t.date) <= antEnd).reduce((acc, t) => acc + Number(t.value), 0);
    const saldoAnt = round2((Number(receitaAnt) || 0) - (Number(despesaAnt) || 0));
    saldoMesVsMesAnterior = getDailyAbsChange(saldoHoje, saldoAnt);
  } else if (period === 'este-mes') {
    // Soma todas as receitas e despesas do mês atual (até hoje)
    const now = new Date();
    const anoAtual = now.getFullYear();
    const mesAtual = now.getMonth();
    const receitasMesAtual = transactions.filter(t => t.type === 'receita' &&
      new Date(t.date).getFullYear() === anoAtual &&
      new Date(t.date).getMonth() === mesAtual
    ).reduce((acc, t) => acc + Number(t.value), 0);
    const despesasMesAtual = transactions.filter(t => t.type === 'despesa' &&
      new Date(t.date).getFullYear() === anoAtual &&
      new Date(t.date).getMonth() === mesAtual
    ).reduce((acc, t) => acc + Number(t.value), 0);
    const saldoMesAtual = receitasMesAtual - despesasMesAtual;

    // Soma todas as receitas e despesas do mês anterior (mês fechado)
    const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
    const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
    const receitasMesAnterior = transactions.filter(t => t.type === 'receita' &&
      new Date(t.date).getFullYear() === anoAnterior &&
      new Date(t.date).getMonth() === mesAnterior
    ).reduce((acc, t) => acc + Number(t.value), 0);
    const despesasMesAnterior = transactions.filter(t => t.type === 'despesa' &&
      new Date(t.date).getFullYear() === anoAnterior &&
      new Date(t.date).getMonth() === mesAnterior
    ).reduce((acc, t) => acc + Number(t.value), 0);
    const saldoMesAnterior = receitasMesAnterior - despesasMesAnterior;

    saldoMesVsMesAnterior = getDailyAbsChange(saldoMesAtual, saldoMesAnterior);
  } else if (period === 'personalizado' && customStartDate && customEndDate) {
    // Filtro de intervalo personalizado
    const refStart = startOfDay(customStartDate);
    const refEnd = endOfDay(customEndDate);
    const receitaAtual = transactions.filter(t => t.type === 'receita' && new Date(t.date) >= refStart && new Date(t.date) <= refEnd).reduce((acc, t) => acc + Number(t.value), 0);
    const despesaAtual = transactions.filter(t => t.type === 'despesa' && new Date(t.date) >= refStart && new Date(t.date) <= refEnd).reduce((acc, t) => acc + Number(t.value), 0);
    const saldoAtual = receitaAtual - despesaAtual;
    // Mesmo intervalo do mês anterior
    const dataAnteriorStart = new Date(refStart);
    dataAnteriorStart.setMonth(dataAnteriorStart.getMonth() - 1);
    const dataAnteriorEnd = new Date(refEnd);
    dataAnteriorEnd.setMonth(dataAnteriorEnd.getMonth() - 1);
    const receitaAnt = transactions.filter(t => t.type === 'receita' && new Date(t.date) >= dataAnteriorStart && new Date(t.date) <= dataAnteriorEnd).reduce((acc, t) => acc + Number(t.value), 0);
    const despesaAnt = transactions.filter(t => t.type === 'despesa' && new Date(t.date) >= dataAnteriorStart && new Date(t.date) <= dataAnteriorEnd).reduce((acc, t) => acc + Number(t.value), 0);
    const saldoAnt = round2((Number(receitaAnt) || 0) - (Number(despesaAnt) || 0));
    saldoMesVsMesAnterior = getDailyAbsChange(saldoAtual, saldoAnt);
  } else {
    saldoMesVsMesAnterior = getSimpleChange(metrics.saldo, prevSaldo);
  }

  // Função para calcular o R$ por Hora de um dia específico
  function calcularValorPorHoraDia(receita: number, horas: number): number {
    if (!horas || horas === 0) return 0;
    return round2(receita / horas);
  }

  let valorPorHoraDiaVsMesAnterior;
  if (period === 'hoje' || period === 'ontem' || period === 'personalizado') {
    let dataRef;
    if (period === 'hoje') {
      dataRef = new Date();
    } else if (period === 'ontem') {
      dataRef = new Date();
      dataRef.setDate(dataRef.getDate() - 1);
    } else if (period === 'personalizado' && customStartDate) {
      dataRef = customStartDate;
    }
    const receitaHoje = getValoresDiaPersonalizado(transactions, 'receita', dataRef).at(0)?.valor || 0;
    // Calcular horas trabalhadas do dia
    const refStart = startOfDay(dataRef);
    const refEnd = endOfDay(dataRef);
    const horasHoje = workHours
      ? workHours.filter(w => {
          const start = w.startDateTime instanceof Date ? w.startDateTime : new Date(w.startDateTime);
          return start >= refStart && start <= refEnd;
        })
        .reduce((acc, w) => {
          const start = w.startDateTime instanceof Date ? w.startDateTime : new Date(w.startDateTime);
          const end = w.endDateTime instanceof Date ? w.endDateTime : new Date(w.endDateTime);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) return acc; // ignora se inválido
          return acc + diffHoursSafe(start, end);
        }, 0)
      : 0;
    const valorPorHoraHoje = round2(calcularValorPorHoraDia(receitaHoje, horasHoje));
    const dataAnterior = new Date(dataRef.getFullYear(), dataRef.getMonth() - 1, dataRef.getDate());
    const receitaAnt = getValoresDiaPersonalizado(transactions, 'receita', dataAnterior).at(0)?.valor || 0;
    const antStart = startOfDay(dataAnterior);
    const antEnd = endOfDay(dataAnterior);
    const horasAnt = workHours
      ? workHours.filter(w => {
          const start = w.startDateTime instanceof Date ? w.startDateTime : new Date(w.startDateTime);
          return start >= antStart && start <= antEnd;
        })
        .reduce((acc, w) => {
          const start = w.startDateTime instanceof Date ? w.startDateTime : new Date(w.startDateTime);
          const end = w.endDateTime instanceof Date ? w.endDateTime : new Date(w.endDateTime);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) return acc; // ignora se inválido
          return acc + diffHoursSafe(start, end);
        }, 0)
      : 0;
    const valorPorHoraAnt = round2(calcularValorPorHoraDia(receitaAnt, horasAnt));
    valorPorHoraDiaVsMesAnterior = getDailyAbsChange(valorPorHoraHoje, valorPorHoraAnt);
  } else if (period === 'este-mes') {
    // Soma todas as receitas e horas do mês atual
    const now = new Date();
    const anoAtual = now.getFullYear();
    const mesAtual = now.getMonth();
    const receitasMesAtual = transactions.filter(t => t.type === 'receita' &&
      new Date(t.date).getFullYear() === anoAtual &&
      new Date(t.date).getMonth() === mesAtual
    ).reduce((acc, t) => acc + Number(t.value), 0);
    const horasMesAtual = workHours
      ? workHours.filter(w => {
          const start = w.startDateTime instanceof Date ? w.startDateTime : new Date(w.startDateTime);
          return start.getFullYear() === anoAtual && start.getMonth() === mesAtual;
        })
        .reduce((acc, w) => {
          const start = w.startDateTime instanceof Date ? w.startDateTime : new Date(w.startDateTime);
          const end = w.endDateTime instanceof Date ? w.endDateTime : new Date(w.endDateTime);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) return acc; // ignora se inválido
          return acc + diffHoursSafe(start, end);
        }, 0)
      : 0;
    const valorPorHoraMesAtual = horasMesAtual > 0 ? round2(Number(receitasMesAtual) / Number(horasMesAtual)) : 0;

    // Soma todas as receitas e horas do mês anterior (mês fechado)
    const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
    const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
    const receitasMesAnterior = transactions.filter(t => t.type === 'receita' &&
      new Date(t.date).getFullYear() === anoAnterior &&
      new Date(t.date).getMonth() === mesAnterior
    ).reduce((acc, t) => acc + Number(t.value), 0);
    const horasMesAnterior = workHours
      ? workHours.filter(w => {
          const start = w.startDateTime instanceof Date ? w.startDateTime : new Date(w.startDateTime);
          return start.getFullYear() === anoAnterior && start.getMonth() === mesAnterior;
        })
        .reduce((acc, w) => {
          const start = w.startDateTime instanceof Date ? w.startDateTime : new Date(w.startDateTime);
          const end = w.endDateTime instanceof Date ? w.endDateTime : new Date(w.endDateTime);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) return acc; // ignora se inválido
          return acc + diffHoursSafe(start, end);
        }, 0)
      : 0;
    const valorPorHoraMesAnterior = horasMesAnterior > 0 ? round2(Number(receitasMesAnterior) / Number(horasMesAnterior)) : 0;

    // Cálculo percentual arredondando antes, padrão dos outros cards
    valorPorHoraDiaVsMesAnterior = getSimpleChange(valorPorHoraMesAtual, valorPorHoraMesAnterior);
  } else {
    valorPorHoraDiaVsMesAnterior = getSimpleChange(metrics.valorPorHora, prevValorPorHora);
  }

  const revenueBreakdown = getRevenueBreakdown();
  const expenseBreakdown = getExpenseBreakdown();

  // Função utilitária para diferença de horas segura
  function diffHoursSafe(start: Date, end: Date): number {
    if (!(start instanceof Date) || !(end instanceof Date)) return 0;
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  return (
    <div className="mb-8">
      {/* Primeira fileira - 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Receita Total"
          value={formatCurrency(metrics.receita)}
          icon={DollarSign}
          color="green"
          breakdown={revenueBreakdown}
          showInfoIcon={true}
          change={receitaMesVsMesAnterior}
        />
        <MetricCard
          title="Despesa Total"
          value={formatCurrency(metrics.despesa)}
          icon={TrendingDown}
          color="red"
          breakdown={expenseBreakdown}
          showInfoIcon={true}
          change={despesaMesVsMesAnterior}
        />
        <MetricCard
          title="Saldo Total"
          value={formatCurrency(metrics.saldo)}
          icon={DollarSign}
          color={metrics.saldo >= 0 ? "green" : "red"}
          change={saldoMesVsMesAnterior}
        />
        <MetricCard
          title="KM Rodado"
          value={`${metrics.kmRodado} km`}
          icon={Car}
          color="blue"
          change={kmRodadoMesVsMesAnterior}
        />
      </div>
      {/* Segunda fileira - Lucro e outros cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <ProfitCard
          metrics={metrics}
          period={period}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          change={lucroDiaVsMesAnterior}
          lucroMensal={lucroMesAtual}
        />
        <MetricCard
          title="R$ por KM"
          value={formatCurrency(metrics.valorPorKm)}
          icon={DollarSign}
          color="green"
          change={valorPorKmDiaVsMesAnterior}
        />
        <MetricCard
          title="R$ por Hora"
          value={formatCurrency(metrics.valorPorHora)}
          icon={Clock}
          color="green"
          change={valorPorHoraDiaVsMesAnterior}
        />
        <FuelExpenseCard
          metrics={metrics}
          period={period}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          change={gastoCombustivelDiaVsMesAnterior}
        />
      </div>
      {/* Terceira fileira - Card de Metas e Melhor Dia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <BestDayCard />
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardMetricsSection;
