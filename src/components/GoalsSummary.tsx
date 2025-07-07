
import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { ProgressBar } from "./ProgressBar";
import { GoalModal } from "./GoalModal";
import { goalService, Goals } from "@/services/goalService";
import { getCurrentWeekEarnings, getCurrentMonthEarnings, getGoalColor } from "@/utils/goalUtils";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const GoalsSummary: React.FC = () => {
  const { transactions, user } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [goals, setGoals] = useState<Goals>({ weeklyGoal: 1000, monthlyGoal: 4000 });
  const [loading, setLoading] = useState(true);

  // Carregar metas do banco de dados
  useEffect(() => {
    const loadGoals = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userGoals = await goalService.getGoals(user.id);
        setGoals(userGoals);
      } catch (error) {
        console.error('Error loading goals:', error);
        // Usar valores padrão em caso de erro
        setGoals({ weeklyGoal: 1000, monthlyGoal: 4000 });
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, [user]);

  const weekEarnings = getCurrentWeekEarnings(transactions);
  const monthEarnings = getCurrentMonthEarnings(transactions);

  const weekPercent = Math.round((weekEarnings / goals.weeklyGoal) * 100);
  const monthPercent = Math.round((monthEarnings / goals.monthlyGoal) * 100);

  const handleSave = async (newGoals: Goals) => {
    if (!user) return;
    
    try {
      await goalService.setGoals(user.id, newGoals);
      setGoals(newGoals);
    } catch (error) {
      console.error('Error saving goals:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border border-gray-200 p-5 w-full max-w-[340px] min-h-[220px] flex flex-col items-center justify-center mx-auto">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="mt-2 text-sm text-gray-600">Carregando metas...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-5 w-full max-w-[340px] min-h-[220px] flex flex-col items-stretch justify-center mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📊</span>
        <span className="font-bold text-base">Metas de Ganhos</span>
      </div>
      <ProgressBar
        label="Meta Semanal"
        current={weekEarnings}
        target={goals.weeklyGoal}
        color={getGoalColor(weekPercent)}
        icon="🗓️"
      />
      <ProgressBar
        label="Meta Mensal"
        current={monthEarnings}
        target={goals.monthlyGoal}
        color={getGoalColor(monthPercent)}
        icon="📅"
      />
      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2 mt-2"
        onClick={() => setModalOpen(true)}
      >
        <Settings className="w-4 h-4" /> Personalizar Metas
      </Button>
      {user && (
        <GoalModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          transactions={transactions}
          userId={user.id}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
