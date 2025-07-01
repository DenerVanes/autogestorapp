import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, User, LogOut, Settings, Crown } from "lucide-react";
import DateRangePicker from "./DateRangePicker";
import { DateRange } from "react-day-picker";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { AdminGrantProModal } from "./AdminGrantProModal";
import AdminGrantProModal from "./AdminGrantProModal";
import { useSubscription } from "@/hooks/useSubscription";

interface DashboardHeaderProps {
  userName?: string;
  selectedPeriod: string;
  onPeriodChange: (value: string) => void;
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
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
  const { user, signOut, session } = useAuth();
  const { isAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const { hasAccess, loading: subLoading, createCheckout } = useSubscription();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/landing');
      toast.success("Logout realizado com sucesso!");
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error("Erro ao sair. Tente novamente.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleProManagementClick = () => {
    setShowProModal(true);
  };

  const handleCancelSubscription = async () => {
    console.log("session:", session);
    if (!window.confirm("Tem certeza que deseja cancelar seu plano PRO?")) return;
    const accessToken = session?.access_token;
    if (!accessToken) {
      toast.error("Usuário não autenticado.");
      return;
    }
    try {
      const res = await fetch(
        "https://ymytximfmqcubhdvkruu.supabase.co/functions/v1/cancel-subscription",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Plano PRO cancelado com sucesso!");
        // Aqui você pode atualizar o estado do usuário/localStorage/contexto
      } else {
        toast.error("Erro ao cancelar plano: " + (data.error || "Tente novamente."));
      }
    } catch (err: any) {
      toast.error("Erro ao cancelar plano: " + err.message);
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      window._supabaseToken = session.access_token;
      console.log("Token de acesso disponível em window._supabaseToken");
    }
  }, [session]);

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {getGreeting()}, {userName || 'Usuário'}!
                </h1>
                <p className="text-sm text-muted-foreground">Auto Gestor APP - Dashboard atualizado</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {user?.email === 'dennervanes@hotmail.com' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleProManagementClick}
                    className="bg-white/80 text-purple-600 hover:text-purple-700"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Gerenciar PRO
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAdminClick}
                    className="bg-white/80 text-blue-600 hover:text-blue-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={onShowProfileModal}
                className="bg-white/80"
              >
                <User className="w-4 h-4 mr-2" />
                Perfil
              </Button>
              
              <Select value={selectedPeriod} onValueChange={onPeriodChange}>
                <SelectTrigger className="w-40 bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="ontem">Ontem</SelectItem>
                  <SelectItem value="esta-semana">Esta semana</SelectItem>
                  <SelectItem value="semana-passada">Semana passada</SelectItem>
                  <SelectItem value="este-mes">Este mês</SelectItem>
                  <SelectItem value="mes-passado">Mês passado</SelectItem>
                  <SelectItem value="custom">Filtro personalizado</SelectItem>
                </SelectContent>
              </Select>
              {selectedPeriod === 'custom' && (
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={onDateRangeChange}
                  onApply={onDateRangeApply}
                />
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-white/80 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? "Saindo..." : "Sair"}
              </Button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden space-y-3">
            {/* First line - User greeting */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-foreground truncate">
                  {getGreeting()}, {userName || 'Usuário'}!
                </h1>
                <p className="text-sm text-muted-foreground">Auto Gestor APP</p>
              </div>
            </div>
            
            {/* Second line - Action buttons */}
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                {user?.email === 'dennervanes@hotmail.com' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleProManagementClick}
                      className="bg-white/80 text-purple-600 hover:text-purple-700 min-h-[44px]"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      PRO
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAdminClick}
                      className="bg-white/80 text-blue-600 hover:text-blue-700 min-h-[44px]"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShowProfileModal}
                  className="bg-white/80 min-h-[44px]"
                >
                  <User className="w-4 h-4 mr-2" />
                  Perfil
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="bg-white/80 text-muted-foreground hover:text-foreground min-h-[44px]"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {isLoggingOut ? "Saindo..." : "Sair"}
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Select value={selectedPeriod} onValueChange={onPeriodChange}>
                  <SelectTrigger className="w-32 bg-white/80 min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoje">Hoje</SelectItem>
                    <SelectItem value="ontem">Ontem</SelectItem>
                    <SelectItem value="esta-semana">Esta semana</SelectItem>
                    <SelectItem value="semana-passada">Semana passada</SelectItem>
                    <SelectItem value="este-mes">Este mês</SelectItem>
                    <SelectItem value="mes-passado">Mês passado</SelectItem>
                    <SelectItem value="custom">Filtro personalizado</SelectItem>
                  </SelectContent>
                </Select>
                {selectedPeriod === 'custom' && (
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

      {/* Modal de Gerenciamento PRO */}
      <AdminGrantProModal 
        isOpen={showProModal} 
        onClose={() => setShowProModal(false)} 
      />
    </>
  );
};

export default DashboardHeader;
