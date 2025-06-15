
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RevenueHistoryTab from "./RevenueHistoryTab";
import ExpenseHistoryTab from "./ExpenseHistoryTab";
import OdometerHistoryTab from "./OdometerHistoryTab";
import WorkHoursHistoryTab from "./WorkHoursHistoryTab";
import type { Transaction, OdometerRecord, WorkHoursRecord } from "@/types";

interface HistoryTabsContentProps {
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onEditOdometerRecord: (record: OdometerRecord) => void;
  onDeleteOdometerRecord: (id: string) => void;
  onEditWorkHours: (record: WorkHoursRecord) => void;
  onDeleteWorkHours: (id: string) => void;
}

const HistoryTabsContent = ({
  onEditTransaction,
  onDeleteTransaction,
  onEditOdometerRecord,
  onDeleteOdometerRecord,
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
          onEditOdometerRecord={onEditOdometerRecord}
          onDeleteOdometerRecord={onDeleteOdometerRecord}
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
