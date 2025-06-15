
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import DashboardHeader from './DashboardHeader';
import DashboardMetricsSection from './DashboardMetricsSection';
import DashboardChartSection from './DashboardChartSection';
import DashboardRecentTransactions from './DashboardRecentTransactions';
import FloatingActionButton from './FloatingActionButton';
import TransactionModal from './TransactionModal';
import OdometerModal from './OdometerModal';
import WorkHoursModal from './WorkHoursModal';
import ProfileModal from './ProfileModal';
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus';
import SubscriptionGuard from '@/components/subscription/SubscriptionGuard';
import HistoryPage from './HistoryPage';
import { useUser } from '@/contexts/UserContext';
import { filterByPeriod } from '@/utils/dateFilters';
import { comparisonCalculator } from '@/utils/comparisonCalculator';

type ActionType = 'receita' | 'despesa' | 'odometro' | 'horas';

const Dashboard = () => {
  const { user, transactions, getMetrics, getChartData } = useUser();
  
  // Modal states
  const [transactionModal, setTransactionModal] = useState<{ isOpen: boolean; type: 'receita' | 'despesa' | 'odometro' }>({
    isOpen: false,
    type: 'receita'
  });
  const [isOdometerModalOpen, setIsOdometerModalOpen] = useState(false);
  const [isWorkHoursModalOpen, setIsWorkHoursModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Period and date filter states
  const [selectedPeriod, setSelectedPeriod] = useState('este-mes');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    if (value !== 'personalizado') {
      setDateRange(undefined);
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
    }
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleDateRangeApply = () => {
    if (dateRange?.from && dateRange?.to) {
      setCustomStartDate(dateRange.from);
      setCustomEndDate(dateRange.to);
      setSelectedPeriod('personalizado');
    }
  };

  const handleFloatingAction = (type: ActionType) => {
    if (type === 'odometro') {
      setIsOdometerModalOpen(true);
    } else if (type === 'horas') {
      setIsWorkHoursModalOpen(true);
    } else {
      setTransactionModal({
        isOpen: true,
        type: type as 'receita' | 'despesa'
      });
    }
  };

  const handleShowHistory = () => {
    setShowHistory(true);
  };

  // Calculate metrics and chart data
  const metrics = getMetrics(selectedPeriod, customStartDate, customEndDate);
  const chartData = getChartData(selectedPeriod, customStartDate, customEndDate);
  
  // Calculate comparison data
  const changes = comparisonCalculator.calculateChanges(
    transactions, 
    selectedPeriod, 
    customStartDate, 
    customEndDate
  );

  // Get filtered transactions for recent transactions section
  const filteredTransactions = filterByPeriod(transactions, selectedPeriod, customStartDate, customEndDate);
  
  // Get period label
  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'hoje': return 'de hoje';
      case 'ontem': return 'de ontem';
      case 'esta-semana': return 'desta semana';
      case 'semana-passada': return 'da semana passada';
      case 'este-mes': return 'deste mês';
      case 'mes-passado': return 'do mês passado';
      case 'personalizado': return 'do período selecionado';
      default: return 'do período';
    }
  };

  if (showHistory) {
    return <HistoryPage onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <DashboardHeader 
          userName={user?.name}
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          onDateRangeApply={handleDateRangeApply}
          onShowProfileModal={() => setIsProfileModalOpen(true)}
        />
        
        {/* Status da Assinatura */}
        <div className="mb-6">
          <SubscriptionStatus />
        </div>

        {/* Métricas - sempre visíveis */}
        <DashboardMetricsSection 
          metrics={{ ...metrics, changes }}
          period={selectedPeriod}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />

        {/* Seção de Gráficos - sempre visível */}
        <DashboardChartSection chartData={chartData} />

        {/* Transações Recentes - protegida para edição */}
        <SubscriptionGuard feature="edição de transações" showUpgrade={false}>
          <DashboardRecentTransactions 
            filteredTransactions={filteredTransactions}
            periodLabel={getPeriodLabel()}
            onShowHistory={handleShowHistory}
          />
        </SubscriptionGuard>

        {/* Botão flutuante - protegido */}
        <SubscriptionGuard feature="criação de novos registros" showUpgrade={false}>
          <FloatingActionButton onAction={handleFloatingAction} />
        </SubscriptionGuard>

        {/* Modais */}
        <TransactionModal 
          type={transactionModal.type}
          isOpen={transactionModal.isOpen}
          onClose={() => setTransactionModal({ isOpen: false, type: 'receita' })}
        />
        <OdometerModal 
          isOpen={isOdometerModalOpen}
          onClose={() => setIsOdometerModalOpen(false)}
        />
        <WorkHoursModal 
          isOpen={isWorkHoursModalOpen}
          onClose={() => setIsWorkHoursModalOpen(false)}
        />
        <ProfileModal 
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default Dashboard;
