
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RevenueHistoryTab from "./RevenueHistoryTab";
import ExpenseHistoryTab from "./ExpenseHistoryTab";
import OdometerHistoryTab from "./OdometerHistoryTab";
import WorkHoursHistoryTab from "./WorkHoursHistoryTab";

const HistoryTabsContent = () => {
  return (
    <Tabs defaultValue="receitas" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="receitas">Receitas</TabsTrigger>
        <TabsTrigger value="despesas">Despesas</TabsTrigger>
        <TabsTrigger value="odometro">Odômetro</TabsTrigger>
        <TabsTrigger value="horas">Horas</TabsTrigger>
      </TabsList>

      <TabsContent value="receitas">
        <RevenueHistoryTab />
      </TabsContent>

      <TabsContent value="despesas">
        <ExpenseHistoryTab />
      </TabsContent>

      <TabsContent value="odometro">
        <OdometerHistoryTab />
      </TabsContent>

      <TabsContent value="horas">
        <WorkHoursHistoryTab />
      </TabsContent>
    </Tabs>
  );
};

export default HistoryTabsContent;
