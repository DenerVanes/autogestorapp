import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RevenueHistoryTab from "./RevenueHistoryTab";
import ExpenseHistoryTab from "./ExpenseHistoryTab";
import OdometerHistoryTab from "./OdometerHistoryTab";
import WorkHoursHistoryTab from "./WorkHoursHistoryTab";
import type { Transaction, WorkHoursRecord } from "@/types";
import { Lancamento } from "@/lib/types";

interface Viagem {
  day: string;
  inicial?: any;
  final?: any;
  status: string;
  distancia?: number;
}

interface HistoryTabsContentProps {
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onEditOdometer: (viagem: Viagem) => void;
  onDeleteOdometer: (ids: string[]) => void;
  onEditWorkHours: (record: WorkHoursRecord) => void;
  onDeleteWorkHours: (id: string) => void;
}

const HistoryTabsContent = ({
  onEditTransaction,
  onDeleteTransaction,
  onEditOdometer,
  onDeleteOdometer,
  onEditWorkHours,
  onDeleteWorkHours
}: HistoryTabsContentProps) => {
  return (
    <Tabs defaultValue="receitas" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="receitas">Receitas</TabsTrigger>
        <TabsTrigger value="despesas">Despesas</TabsTrigger>
        <TabsTrigger value="odometro">Odômetro</TabsTrigger>
        <TabsTrigger value="horas">Horas</TabsTrigger>
      </TabsList>

      <TabsContent value="receitas">
        <RevenueHistoryTab 
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={onDeleteTransaction}
        />
      </TabsContent>

      <TabsContent value="despesas">
        <ExpenseHistoryTab 
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={onDeleteTransaction}
        />
      </TabsContent>

      <TabsContent value="odometro">
        <OdometerHistoryTab 
          onEdit={onEditOdometer}
          onDelete={onDeleteOdometer}
        />
      </TabsContent>

      <TabsContent value="horas">
        <WorkHoursHistoryTab 
          onEditWorkHours={onEditWorkHours}
          onDeleteWorkHours={onDeleteWorkHours}
        />
      </TabsContent>
    </Tabs>
  );
};

export default HistoryTabsContent;
