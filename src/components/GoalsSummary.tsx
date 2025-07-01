import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { ProgressBar } from "./ProgressBar";
import { GoalModal } from "./GoalModal";
import { GoalService, Goals } from "@/services/GoalService";
import { getCurrentWeekEarnings, getCurrentMonthEarnings, getGoalColor } from "@/utils/goalUtils";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const GoalsSummary: React.FC = () => {
  const { transactions, user } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [goals, setGoals] = useState<Goals>(user ? GoalService.getGoals(user.id) : { weeklyGoal: 1000, monthlyGoal: 4000 });

  const weekEarnings = getCurrentWeekEarnings(transactions);
  const monthEarnings = getCurrentMonthEarnings(transactions);

  const weekPercent = Math.round((weekEarnings / goals.weeklyGoal) * 100);
  const monthPercent = Math.round((monthEarnings / goals.monthlyGoal) * 100);

  const handleSave = (g: Goals) => {
    if (user) {
      GoalService.setGoals(user.id, g);
      setGoals(g);
    }
  };

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