import React from 'react';
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

const Dashboard = () => {
  // TODO: Implement state and handlers

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <DashboardHeader />
        
        {/* Status da Assinatura */}
        <div className="mb-6">
          <SubscriptionStatus />
        </div>

        {/* Métricas - sempre visíveis */}
        <DashboardMetricsSection />

        {/* Seção de Gráficos - sempre visível */}
        <DashboardChartSection />

        {/* Transações Recentes - protegida para edição */}
        <SubscriptionGuard feature="edição de transações" showUpgrade={false}>
          <DashboardRecentTransactions />
        </SubscriptionGuard>

        {/* Botão flutuante - protegido */}
        <SubscriptionGuard feature="criação de novos registros" showUpgrade={false}>
          <FloatingActionButton />
        </SubscriptionGuard>

        {/* Modais - já protegidos pelo UserContext */}
        <TransactionModal />
        <OdometerModal />
        <WorkHoursModal />
        <ProfileModal />
      </div>
    </div>
  );
};

export default Dashboard;
