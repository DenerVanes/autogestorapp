import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoalService, Goals } from "@/services/GoalService";
import { Transaction } from "@/types";

interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  transactions: Transaction[];
  userId: string;
  onSave: (goals: Goals) => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({ open, onClose, transactions, userId, onSave }) => {
  const [weeklyGoal, setWeeklyGoal] = useState<string>("");
  const [monthlyGoal, setMonthlyGoal] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const suggested = GoalService.suggestGoals(transactions);

  useEffect(() => {
    if (open) {
      const goals = GoalService.getGoals(userId);
      setWeeklyGoal(goals.weeklyGoal > 0 ? String(goals.weeklyGoal) : "");
      setMonthlyGoal(goals.monthlyGoal > 0 ? String(goals.monthlyGoal) : "");
    }
  }, [open, userId]);

  const handleSave = () => {
    const weekly = Number(weeklyGoal);
    const monthly = Number(monthlyGoal);
    if (weekly <= 0 || monthly <= 0 || isNaN(weekly) || isNaN(monthly)) {
      setError("As metas devem ser valores positivos.");
      return;
    }
    GoalService.setGoals(userId, { weeklyGoal: weekly, monthlyGoal: monthly });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onSave({ weeklyGoal: weekly, monthlyGoal: monthly });
      onClose();
    }, 800);
  };

  const handleSuggest = () => {
    setWeeklyGoal(suggested.weeklyGoal > 0 ? String(suggested.weeklyGoal) : "");
    setMonthlyGoal(suggested.monthlyGoal > 0 ? String(suggested.monthlyGoal) : "");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar Metas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1">Meta Semanal (R$)</label>
            <Input
              type="number"
              min={1}
              value={weeklyGoal}
              onChange={e => setWeeklyGoal(e.target.value)}
              className="w-full"
              placeholder="Digite o valor"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meta Mensal (R$)</label>
            <Input
              type="number"
              min={1}
              value={monthlyGoal}
              onChange={e => setMonthlyGoal(e.target.value)}
              className="w-full"
              placeholder="Digite o valor"
            />
          </div>
          <Button variant="outline" onClick={handleSuggest} className="w-full">Sugestão baseada no histórico</Button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">Metas salvas!</div>}
          <div className="flex gap-2 mt-2">
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Salvar</Button>
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 