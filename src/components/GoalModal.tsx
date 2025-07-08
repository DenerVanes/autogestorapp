
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { goalService, Goals } from "@/services/goalService";
import { Transaction } from "@/types";
import { toast } from "sonner";

interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  transactions: Transaction[];
  userId: string;
  onSave: (goals: Goals) => Promise<void>;
}

export const GoalModal: React.FC<GoalModalProps> = ({ open, onClose, transactions, userId, onSave }) => {
  const [weeklyGoal, setWeeklyGoal] = useState<string>("");
  const [monthlyGoal, setMonthlyGoal] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [suggested, setSuggested] = useState<Goals>({ weeklyGoal: 1000, monthlyGoal: 4000 });

  useEffect(() => {
    const loadData = async () => {
      if (open && userId) {
        try {
          // Carregar metas atuais do banco
          const goals = await goalService.getGoals(userId);
          setWeeklyGoal(goals.weeklyGoal > 0 ? String(goals.weeklyGoal) : "");
          setMonthlyGoal(goals.monthlyGoal > 0 ? String(goals.monthlyGoal) : "");

          // Calcular sugestões
          const suggestedGoals = await goalService.suggestGoals(transactions);
          setSuggested(suggestedGoals);
        } catch (error) {
          console.error('Error loading modal data:', error);
          toast.error("Erro ao carregar dados das metas.");
        }
      }
    };

    loadData();
  }, [open, userId, transactions]);

  const handleSave = async () => {
    const weekly = parseFloat(weeklyGoal);
    const monthly = parseFloat(monthlyGoal);
    
    // Validações melhoradas
    if (!weeklyGoal || !monthlyGoal) {
      toast.error("Por favor, preencha ambas as metas.");
      return;
    }
    
    if (isNaN(weekly) || isNaN(monthly) || weekly <= 0 || monthly <= 0) {
      toast.error("As metas devem ser valores numéricos positivos.");
      return;
    }

    if (!userId) {
      toast.error("Usuário não autenticado.");
      return;
    }

    try {
      setLoading(true);
      
      const goals = { weeklyGoal: weekly, monthlyGoal: monthly };
      
      // Salvar no banco de dados primeiro
      await goalService.setGoals(userId, goals);
      
      // Depois chamar o callback do componente pai
      await onSave(goals);
      
      toast.success("Metas salvas com sucesso!");
      onClose();
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error("Erro ao salvar metas. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = () => {
    if (suggested.weeklyGoal > 0 && suggested.monthlyGoal > 0) {
      setWeeklyGoal(String(suggested.weeklyGoal));
      setMonthlyGoal(String(suggested.monthlyGoal));
    }
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
              min="1"
              step="0.01"
              value={weeklyGoal}
              onChange={e => setWeeklyGoal(e.target.value)}
              className="w-full"
              placeholder="Digite o valor"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meta Mensal (R$)</label>
            <Input
              type="number"
              min="1"
              step="0.01"
              value={monthlyGoal}
              onChange={e => setMonthlyGoal(e.target.value)}
              className="w-full"
              placeholder="Digite o valor"
              disabled={loading}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={handleSuggest} 
            className="w-full"
            disabled={loading}
          >
            Sugestão baseada no histórico
          </Button>
          <div className="flex gap-2 mt-2">
            <Button 
              onClick={handleSave} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
