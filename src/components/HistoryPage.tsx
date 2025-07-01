import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import EditTransactionModal from "./EditTransactionModal";
import EditOdometerModal from "./EditOdometerModal";
import EditWorkHoursModal from "./EditWorkHoursModal";
import HistoryHeader from "./history/HistoryHeader";
import HistoryTabsContent from "./history/HistoryTabsContent";
import { Transaction, WorkHoursRecord } from "@/types";
import { Lancamento } from "@/lib/types";

interface HistoryPageProps {
  onBack: () => void;
}

const HistoryPage = ({ onBack }: HistoryPageProps) => {
  const { deleteTransaction, deleteOdometerRecord, deleteWorkHours } = useUser();
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingViagem, setEditingViagem] = useState<any | null>(null);
  const [editingWorkHours, setEditingWorkHours] = useState<WorkHoursRecord | null>(null);

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      deleteTransaction(id);
    }
  };

  const handleDeleteOdometer = (ids: string[]) => {
    if (confirm('Tem certeza que deseja excluir este registro de odômetro?')) {
      ids.forEach(id => deleteOdometerRecord(id));
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
        <HistoryTabsContent
          onEditTransaction={setEditingTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onEditOdometer={setEditingViagem}
          onDeleteOdometer={handleDeleteOdometer}
          onEditWorkHours={setEditingWorkHours}
          onDeleteWorkHours={handleDeleteWorkHours}
        />
      </div>

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          isOpen={true}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      {editingViagem && (
        <EditOdometerModal
          cicloParaEditar={editingViagem}
          isOpen={true}
          onClose={() => setEditingViagem(null)}
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
