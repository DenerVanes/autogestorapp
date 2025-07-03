import { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardMetricsSection from "./DashboardMetricsSection";
import DashboardChartSection from "./DashboardChartSection";
import DashboardRecentTransactions from "./DashboardRecentTransactions";
import { useUser } from "@/contexts/UserContext";
import { filterByPeriod } from "@/utils/dateFilters";
import FloatingActionButton from "./FloatingActionButton";
import EditTransactionModal from "./EditTransactionModal";
import WorkHoursModal from "./WorkHoursModal";
import OdometerRegistrationModal from "./OdometerRegistrationModal";
import { Transaction } from "@/types";
import { Lancamento } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import UserProfileModal from "./UserProfileModal";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoalsSummary } from "./GoalsSummary";

const Dashboard = () => {
  const { user, transactions, getMetrics, getChartData, loading } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState("este-mes");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [openAction, setOpenAction] = useState<null | 'receita' | 'despesa' | 'odometro' | 'horas'>(null);
  const [showProDialog, setShowProDialog] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const navigate = useNavigate();
  const { hasAccess, createCheckout } = useSubscription();

  const emptyTransaction: Transaction = {
    id: '',
    type: 'receita',
    value: 0,
    date: new Date(),
    category: '',
  };
  const emptyLancamento: Lancamento = {
    id: '',
    dataLancamento: new Date().toISOString(),
    horaInicial: new Date().toISOString().slice(11, 19),
    odometroInicial: 0,
    status: 'pendente',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  try {
    const handlePeriodChange = (value) => setSelectedPeriod(value);
    const handleDateRangeChange = (range) => setDateRange(range);
    const handleDateRangeApply = () => setSelectedPeriod('personalizado');
    const handleShowProfileModal = () => setShowProfileModal(true);

    const filteredTransactions = filterByPeriod(
      transactions,
      selectedPeriod,
      dateRange ? dateRange.from : undefined,
      dateRange ? dateRange.to : undefined
    );
    const periodLabel = selectedPeriod;
    const metrics = getMetrics(selectedPeriod, dateRange ? dateRange.from : undefined, dateRange ? dateRange.to : undefined);
    const chartData = getChartData(selectedPeriod, dateRange ? dateRange.from : undefined, dateRange ? dateRange.to : undefined);

    const handleFabAction = (type) => {
      if (!hasAccess) {
        toast.error("Sua assinatura PRO expirou. Para continuar usando os lançamentos, assine o PRO novamente.");
        return;
      }
      setOpenAction(type);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <DashboardHeader
          userName={user?.name}
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          dateRange={dateRange as any}
          onDateRangeChange={handleDateRangeChange}
          onDateRangeApply={handleDateRangeApply}
          onShowProfileModal={handleShowProfileModal}
        />
        <div className="max-w-7xl mx-auto px-4 py-6">
          {!hasAccess && (
            <Alert className="mb-8 border-red-200 bg-red-50 w-full flex items-center justify-between px-8 py-4">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-black" />
                <AlertDescription className="text-red-800 text-base font-medium">
                  Assinatura expirou. Renove o PRO para continuar.
                </AlertDescription>
              </div>
              <Button
                className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors text-base"
                onClick={() => setShowProDialog(true)}
              >
                <Crown className="h-5 w-5 mr-2" />
                Assine PRO
              </Button>
              <Dialog open={showProDialog} onOpenChange={setShowProDialog}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-600" />
                      Plano PRO
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <Card className="border-blue-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                          <CreditCard className="h-5 w-5" />
                          Plano PRO - Recorrente
                        </CardTitle>
                        <CardDescription>
                          Renovação automática mensal
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold mb-2">R$ 19,90/mês</div>
                        <ul className="text-sm space-y-1 mb-4">
                          <li>✅ Acesso completo às funcionalidades</li>
                          <li>✅ Renovação automática</li>
                          <li>✅ Sem preocupação com vencimento</li>
                          <li>✅ Pode cancelar a qualquer momento</li>
                        </ul>
                        <Button
                          onClick={async () => {
                            setLoadingCheckout(true);
                            await createCheckout('recurring');
                            setLoadingCheckout(false);
                          }}
                          disabled={loadingCheckout}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <Zap className="mr-2 h-4 w-4" />
                          {loadingCheckout ? 'Processando...' : 'Assinar Agora'}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
            </Alert>
          )}
          <DashboardMetricsSection metrics={metrics} period={selectedPeriod} customStartDate={dateRange ? dateRange.from : undefined} customEndDate={dateRange ? dateRange.to : undefined} />
          <div className="flex w-full justify-start mt-0 mb-8">
            <GoalsSummary />
          </div>
          <DashboardChartSection chartData={chartData} />
          <DashboardRecentTransactions 
            filteredTransactions={filteredTransactions} 
            periodLabel={periodLabel} 
            onShowHistory={() => navigate('/historico')} 
          />
        </div>
        <FloatingActionButton onAction={handleFabAction} />
        {hasAccess && openAction === 'receita' && (
          <EditTransactionModal
            transaction={{ ...emptyTransaction, type: 'receita' }}
            isOpen={true}
            onClose={() => setOpenAction(null)}
          />
        )}
        {hasAccess && openAction === 'despesa' && (
          <EditTransactionModal
            transaction={{ ...emptyTransaction, type: 'despesa' }}
            isOpen={true}
            onClose={() => setOpenAction(null)}
          />
        )}
        {hasAccess && openAction === 'odometro' && (
          <OdometerRegistrationModal
            isOpen={true}
            onClose={() => setOpenAction(null)}
          />
        )}
        {hasAccess && openAction === 'horas' && (
          <WorkHoursModal
            isOpen={true}
            onClose={() => setOpenAction(null)}
          />
        )}
        <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      </div>
    );
  } catch (err) {
    if (err instanceof Error) {
      return <div style={{ color: 'red', padding: 32 }}>Erro no Dashboard: {err.message}<br/>{err.stack}</div>;
    }
    return <div style={{ color: 'red', padding: 32 }}>Erro desconhecido no Dashboard.</div>;
  }
};

export default Dashboard;
