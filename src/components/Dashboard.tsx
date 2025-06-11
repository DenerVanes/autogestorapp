
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingDown, Navigation, Plus, Calendar } from "lucide-react";
import FloatingActionButton from "./FloatingActionButton";
import MetricCard from "./MetricCard";
import TransactionModal from "./TransactionModal";

type TransactionType = 'receita' | 'despesa' | 'odometro' | null;

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("hoje");
  const [modalType, setModalType] = useState<TransactionType>(null);

  // Dados mock para demonstração
  const metrics = {
    receita: 1250.80,
    despesa: 320.50,
    kmRodado: 450,
    valorPorKm: 2.78
  };

  const handleFloatingButtonClick = (type: TransactionType) => {
    setModalType(type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Drive Control</h1>
                <p className="text-sm text-muted-foreground">Dashboard</p>
              </div>
            </div>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40 bg-white/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                <SelectItem value="personalizado">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Personalizado</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Receita Total"
            value={`R$ ${metrics.receita.toFixed(2)}`}
            icon={DollarSign}
            color="green"
            change="+12.5%"
          />
          <MetricCard
            title="Despesa Total"
            value={`R$ ${metrics.despesa.toFixed(2)}`}
            icon={TrendingDown}
            color="red"
            change="+5.2%"
          />
          <MetricCard
            title="KM Rodado"
            value={`${metrics.kmRodado} km`}
            icon={Navigation}
            color="blue"
            change="+8.1%"
          />
          <MetricCard
            title="R$ por KM"
            value={`R$ ${metrics.valorPorKm.toFixed(2)}`}
            icon={DollarSign}
            color="green"
            change="+4.3%"
          />
        </div>

        {/* Chart Section */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Gráfico de barras será implementado aqui</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Últimos Lançamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Corrida Uber</p>
                      <p className="text-sm text-muted-foreground">Hoje às 14:30</p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-600">+R$ 25.50</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onAction={handleFloatingButtonClick} />

      {/* Transaction Modal */}
      {modalType && (
        <TransactionModal
          type={modalType}
          isOpen={true}
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
