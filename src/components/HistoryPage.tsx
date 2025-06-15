
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import EditTransactionModal from "./EditTransactionModal";
import EditOdometerModal from "./EditOdometerModal";
import EditWorkHoursModal from "./EditWorkHoursModal";
import HistoryHeader from "./history/HistoryHeader";
import HistoryTabsContent from "./history/HistoryTabsContent";
import RevenueHistoryTab from "./history/RevenueHistoryTab";
import ExpenseHistoryTab from "./history/ExpenseHistoryTab";
import OdometerHistoryTab from "./history/OdometerHistoryTab";
import WorkHoursHistoryTab from "./history/WorkHoursHistoryTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Transaction, OdometerRecord, WorkHoursRecord } from "@/types";

interface HistoryPageProps {
  onBack: () => void;
}

const HistoryPage = ({ onBack }: HistoryPageProps) => {
  const { deleteTransaction, deleteOdometerRecord, deleteWorkHours } = useUser();
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingOdometerRecord, setEditingOdometerRecord] = useState<OdometerRecord | null>(null);
  const [editingWorkHours, setEditingWorkHours] = useState<WorkHoursRecord | null>(null);

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      deleteTransaction(id);
    }
  };

  const handleDeleteOdometerRecord = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro de odômetro?')) {
      deleteOdometerRecord(id);
    }
  };

  const handleDeleteWorkHours = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro de horas?')) {
      deleteWorkHours(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <HistoryHeader onBack={onBack} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="receitas" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="receitas">Receitas</TabsTrigger>
            <TabsTrigger value="despesas">Despesas</TabsTrigger>
            <TabsTrigger value="odometro">Odômetro</TabsTrigger>
            <TabsTrigger value="horas">Horas</TabsTrigger>
          </TabsList>

          <TabsContent value="receitas">
            <RevenueHistoryTab 
              onEditTransaction={setEditingTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </TabsContent>

          <TabsContent value="despesas">
            <ExpenseHistoryTab 
              onEditTransaction={setEditingTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </TabsContent>

          <TabsContent value="odometro">
            <OdometerHistoryTab 
              onEditOdometerRecord={setEditingOdometerRecord}
              onDeleteOdometerRecord={handleDeleteOdometerRecord}
            />
          </TabsContent>

          <TabsContent value="horas">
            <WorkHoursHistoryTab 
              onEditWorkHours={setEditingWorkHours}
              onDeleteWorkHours={handleDeleteWorkHours}
            />
          </TabsContent>
        </Tabs>
      </div>

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          isOpen={true}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      {editingOdometerRecord && (
        <EditOdometerModal
          record={editingOdometerRecord}
          isOpen={true}
          onClose={() => setEditingOdometerRecord(null)}
        />
      )}

      {editingWorkHours && (
        <EditWorkHoursModal
          record={editingWorkHours}
          isOpen={true}
          onClose={() => setEditingWorkHours(null)}
        />
      )}
    </div>
  );
};

export default HistoryPage;
