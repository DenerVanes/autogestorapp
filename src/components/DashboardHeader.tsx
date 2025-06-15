
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import DateRangePicker from "./DateRangePicker";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Settings } from "lucide-react";

interface DashboardHeaderProps {
  userName?: string;
  selectedPeriod: string;
  onPeriodChange: (value: string) => void;
  dateRange?: DateRange;
  onDateRangeChange: (date: DateRange | undefined) => void;
  onDateRangeApply: () => void;
  onShowProfileModal: () => void;
}

const DashboardHeader = ({
  userName,
  selectedPeriod,
  onPeriodChange,
  dateRange,
  onDateRangeChange,
  onDateRangeApply,
  onShowProfileModal
}: DashboardHeaderProps) => {
  const { isAdmin, loading: adminLoading, adminData } = useAdminAuth();

  console.log('🎯 DASHBOARD HEADER RENDER');
  console.log('📊 Estado admin completo:', { 
    isAdmin, 
    adminLoading, 
    adminEmail: adminData?.email,
    shouldShow: isAdmin && !adminLoading 
  });

  const handleAdminClick = () => {
    console.log('🖱️ Clique no botão admin - redirecionando para /admin');
    window.location.href = '/admin';
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Olá, {userName || 'Motorista'}! 👋
              </h1>
              <p className="text-gray-600">
                {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Botão Admin - mostrar se é admin e não está carregando */}
              {isAdmin && !adminLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAdminClick}
                  className="gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 font-medium"
                  title="Painel Administrativo"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onShowProfileModal}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Perfil</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => onPeriodChange(e.target.value)}
                className="border rounded px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hoje">Hoje</option>
                <option value="ontem">Ontem</option>
                <option value="esta-semana">Esta Semana</option>
                <option value="semana-passada">Semana Passada</option>
                <option value="este-mes">Este Mês</option>
                <option value="mes-passado">Mês Passado</option>
                <option value="personalizado">Personalizado</option>
              </select>

              {selectedPeriod === 'personalizado' && (
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={onDateRangeChange}
                  onApply={onDateRangeApply}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
