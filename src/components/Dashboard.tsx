
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import FloatingActionButton from "./FloatingActionButton";
import TransactionModal from "./TransactionModal";
import WorkHoursModal from "./WorkHoursModal";
import UserProfileModal from "./UserProfileModal";
import HistoryPage from "./HistoryPage";
import DashboardHeader from "./DashboardHeader";
import DashboardMetricsSection from "./DashboardMetricsSection";
import DashboardChartSection from "./DashboardChartSection";
import DashboardRecentTransactions from "./DashboardRecentTransactions";
import { useUser } from "@/contexts/UserContext";
import { DateRange } from "react-day-picker";
import { filterByPeriod } from "@/utils/dateFilters";

type TransactionType = 'receita' | 'despesa' | 'odometro' | 'horas' | null;

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("hoje");
  const [modalType, setModalType] = useState<TransactionType>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>();
  
  const { user, getMetrics, getChartData, transactions } = useUser();

  const customStartDate = dateRange?.from;
  const customEndDate = dateRange?.to;

  const metrics = getMetrics(selectedPeriod, customStartDate, customEndDate);
  const chartData = getChartData(selectedPeriod, customStartDate, customEndDate);
  
  // Apply the same date filter to recent transactions
  const filteredTransactions = filterByPeriod(transactions, selectedPeriod, customStartDate, customEndDate);

  const handleFloatingButtonClick = (type: TransactionType) => {
    setModalType(type);
  };

  const handlePeriodChange = (value: string) => {
    if (value === 'personalizado') {
      // Don't change period immediately, wait for date selection
      return;
    }
    setSelectedPeriod(value);
    setDateRange(undefined);
  };

  const handleDateRangeApply = () => {
    setSelectedPeriod('personalizado');
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'hoje':
        return 'de hoje';
      case '7dias':
        return 'dos últimos 7 dias';
      case '30dias':
        return 'dos últimos 30 dias';
      case 'personalizado':
        if (customStartDate && customEndDate) {
          return `de ${format(customStartDate, 'dd/MM', { locale: ptBR })} a ${format(customEndDate, 'dd/MM', { locale: ptBR })}`;
        }
        return 'do período personalizado';
      default:
        return 'do período selecionado';
    }
  };

  if (showHistory) {
    return <HistoryPage onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <DashboardHeader
        userName={user?.name}
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onDateRangeApply={handleDateRangeApply}
        onShowProfileModal={() => setShowProfileModal(true)}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <DashboardMetricsSection
          metrics={metrics}
          period={selectedPeriod}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />

        <DashboardChartSection chartData={chartData} />

        <DashboardRecentTransactions
          filteredTransactions={filteredTransactions}
          periodLabel={getPeriodLabel()}
          onShowHistory={() => setShowHistory(true)}
        />
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onAction={handleFloatingButtonClick} />

      {/* Modals */}
      {modalType && modalType !== 'horas' && (
        <TransactionModal
          type={modalType}
          isOpen={true}
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === 'horas' && (
        <WorkHoursModal
          isOpen={true}
          onClose={() => setModalType(null)}
        />
      )}

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default Dashboard;
