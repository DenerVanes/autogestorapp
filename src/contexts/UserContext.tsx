import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User, Transaction, OdometerRecord, WorkHoursRecord, Metrics, ChartData } from "@/types";
import { getMetrics, getChartData } from "@/utils/calculations";
import { useAuth } from "@/hooks/useAuth";
import { supabaseService } from "@/services/supabaseService";
import { toast } from "sonner";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  transactions: Transaction[];
  odometerRecords: OdometerRecord[];
  workHours: WorkHoursRecord[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  addOdometerRecord: (record: Omit<OdometerRecord, 'id'>) => Promise<void>;
  addWorkHours: (record: Omit<WorkHoursRecord, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateOdometerRecord: (id: string, record: Partial<OdometerRecord>) => Promise<void>;
  deleteOdometerRecord: (id: string) => Promise<void>;
  updateWorkHours: (id: string, record: Partial<WorkHoursRecord>) => Promise<void>;
  deleteWorkHours: (id: string) => Promise<void>;
  updateUserProfile: (updates: Partial<Pick<User, 'name' | 'vehicleType' | 'vehicleModel' | 'fuelConsumption'>>) => Promise<void>;
  getMetrics: (period: string, customStartDate?: Date, customEndDate?: Date) => Metrics & { changes: Record<string, string> };
  getChartData: (period: string, customStartDate?: Date, customEndDate?: Date) => ChartData[];
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [odometerRecords, setOdometerRecords] = useState<OdometerRecord[]>([]);
  const [workHours, setWorkHours] = useState<WorkHoursRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load user profile and data when auth user changes
  useEffect(() => {
    if (authUser) {
      loadUserData();
    } else {
      // Clear data when user logs out
      setUser(null);
      setTransactions([]);
      setOdometerRecords([]);
      setWorkHours([]);
    }
  }, [authUser]);

  const loadUserData = async () => {
    if (!authUser) return;
    
    setIsLoading(true);
    try {
      // Load user profile
      const profile = await supabaseService.getUserProfile(authUser.id);
      if (profile) {
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          vehicleType: profile.vehicle_type,
          vehicleModel: profile.vehicle_model,
          fuelConsumption: profile.fuel_consumption
        });
      }

      // Load all user data
      const [transactionsData, odometerData, workHoursData] = await Promise.all([
        supabaseService.getTransactions(),
        supabaseService.getOdometerRecords(),
        supabaseService.getWorkHours()
      ]);

      // Convert and type-cast transactions data properly
      setTransactions(transactionsData.map(t => ({
        id: t.id,
        type: t.type as 'receita' | 'despesa',
        date: new Date(t.date),
        value: t.value,
        category: t.category,
        fuelType: t.fuel_type || undefined,
        pricePerLiter: t.price_per_liter || undefined,
        subcategory: t.subcategory || undefined,
        observation: t.observation || undefined
      })));

      // Convert and type-cast odometer data properly
      setOdometerRecords(odometerData.map(o => ({
        id: o.id,
        type: o.type as 'inicial' | 'final',
        date: new Date(o.date),
        value: o.value
      })));

      // Convert work hours data properly
      setWorkHours(workHoursData.map(w => ({
        id: w.id,
        startDateTime: new Date(w.start_date_time),
        endDateTime: new Date(w.end_date_time)
      })));

    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Erro ao carregar dados do usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const newTransaction = await supabaseService.createTransaction({
        type: transaction.type,
        date: transaction.date.toISOString(),
        value: transaction.value,
        category: transaction.category,
        fuel_type: transaction.fuelType,
        price_per_liter: transaction.pricePerLiter,
        subcategory: transaction.subcategory,
        observation: transaction.observation
      });

      const convertedTransaction: Transaction = {
        id: newTransaction.id,
        type: newTransaction.type as 'receita' | 'despesa',
        date: new Date(newTransaction.date),
        value: newTransaction.value,
        category: newTransaction.category,
        fuelType: newTransaction.fuelType,
        pricePerLiter: newTransaction.pricePerLiter,
        subcategory: newTransaction.subcategory,
        observation: newTransaction.observation
      };

      setTransactions(prev => [...prev, convertedTransaction]);
      toast.success('Transação salva com sucesso!');
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Erro ao salvar transação');
      throw error;
    }
  };

  const addOdometerRecord = async (record: Omit<OdometerRecord, 'id'>) => {
    try {
      const newRecord = await supabaseService.createOdometerRecord({
        date: record.date.toISOString(),
        type: record.type,
        value: record.value
      });

      const convertedRecord: OdometerRecord = {
        id: newRecord.id,
        type: newRecord.type as 'inicial' | 'final',
        date: new Date(newRecord.date),
        value: newRecord.value
      };

      setOdometerRecords(prev => [...prev, convertedRecord]);
      toast.success('Registro de odômetro salvo com sucesso!');
    } catch (error) {
      console.error('Error creating odometer record:', error);
      toast.error('Erro ao salvar registro de odômetro');
      throw error;
    }
  };

  const addWorkHours = async (record: Omit<WorkHoursRecord, 'id'>) => {
    try {
      const newRecord = await supabaseService.createWorkHours({
        start_date_time: record.startDateTime.toISOString(),
        end_date_time: record.endDateTime.toISOString()
      });

      setWorkHours(prev => [...prev, {
        ...newRecord,
        startDateTime: new Date(newRecord.start_date_time),
        endDateTime: new Date(newRecord.end_date_time)
      }]);

      toast.success('Horas de trabalho salvas com sucesso!');
    } catch (error) {
      console.error('Error creating work hours:', error);
      toast.error('Erro ao salvar horas de trabalho');
      throw error;
    }
  };

  const updateTransaction = async (id: string, updatedTransaction: Partial<Transaction>) => {
    try {
      const updateData: any = {};
      
      if (updatedTransaction.date) updateData.date = updatedTransaction.date.toISOString();
      if (updatedTransaction.value !== undefined) updateData.value = updatedTransaction.value;
      if (updatedTransaction.category) updateData.category = updatedTransaction.category;
      if (updatedTransaction.fuelType) updateData.fuel_type = updatedTransaction.fuelType;
      if (updatedTransaction.pricePerLiter !== undefined) updateData.price_per_liter = updatedTransaction.pricePerLiter;
      if (updatedTransaction.subcategory) updateData.subcategory = updatedTransaction.subcategory;
      if (updatedTransaction.observation) updateData.observation = updatedTransaction.observation;

      await supabaseService.updateTransaction(id, updateData);

      setTransactions(prev => prev.map(transaction => 
        transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction
      ));

      toast.success('Transação atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Erro ao atualizar transação');
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await supabaseService.deleteTransaction(id);
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      toast.success('Transação excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Erro ao excluir transação');
      throw error;
    }
  };

  const updateOdometerRecord = async (id: string, updatedRecord: Partial<OdometerRecord>) => {
    try {
      const updateData: any = {};
      
      if (updatedRecord.date) updateData.date = updatedRecord.date.toISOString();
      if (updatedRecord.type) updateData.type = updatedRecord.type;
      if (updatedRecord.value !== undefined) updateData.value = updatedRecord.value;

      await supabaseService.updateOdometerRecord(id, updateData);

      setOdometerRecords(prev => prev.map(record => 
        record.id === id ? { ...record, ...updatedRecord } : record
      ));

      toast.success('Registro de odômetro atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating odometer record:', error);
      toast.error('Erro ao atualizar registro de odômetro');
      throw error;
    }
  };

  const deleteOdometerRecord = async (id: string) => {
    try {
      await supabaseService.deleteOdometerRecord(id);
      setOdometerRecords(prev => prev.filter(record => record.id !== id));
      toast.success('Registro de odômetro excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting odometer record:', error);
      toast.error('Erro ao excluir registro de odômetro');
      throw error;
    }
  };

  const updateWorkHours = async (id: string, updatedRecord: Partial<WorkHoursRecord>) => {
    try {
      const updateData: any = {};
      
      if (updatedRecord.startDateTime) updateData.start_date_time = updatedRecord.startDateTime.toISOString();
      if (updatedRecord.endDateTime) updateData.end_date_time = updatedRecord.endDateTime.toISOString();

      await supabaseService.updateWorkHours(id, updateData);

      setWorkHours(prev => prev.map(record => 
        record.id === id ? { ...record, ...updatedRecord } : record
      ));

      toast.success('Horas de trabalho atualizadas com sucesso!');
    } catch (error) {
      console.error('Error updating work hours:', error);
      toast.error('Erro ao atualizar horas de trabalho');
      throw error;
    }
  };

  const deleteWorkHours = async (id: string) => {
    try {
      await supabaseService.deleteWorkHours(id);
      setWorkHours(prev => prev.filter(record => record.id !== id));
      toast.success('Horas de trabalho excluídas com sucesso!');
    } catch (error) {
      console.error('Error deleting work hours:', error);
      toast.error('Erro ao excluir horas de trabalho');
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<Pick<User, 'name' | 'vehicleType' | 'vehicleModel' | 'fuelConsumption'>>) => {
    if (!authUser) throw new Error('User not authenticated');

    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.vehicleType) updateData.vehicle_type = updates.vehicleType;
      if (updates.vehicleModel) updateData.vehicle_model = updates.vehicleModel;
      if (updates.fuelConsumption !== undefined) updateData.fuel_consumption = updates.fuelConsumption;

      await supabaseService.updateUserProfile(authUser.id, updateData);

      setUser(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('Erro ao atualizar perfil');
      throw error;
    }
  };

  const handleGetMetrics = (period: string, customStartDate?: Date, customEndDate?: Date) => {
    return getMetrics(transactions, odometerRecords, workHours, period, customStartDate, customEndDate);
  };

  const handleGetChartData = (period: string, customStartDate?: Date, customEndDate?: Date) => {
    return getChartData(transactions, period, customStartDate, customEndDate);
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      transactions,
      odometerRecords,
      workHours,
      addTransaction,
      addOdometerRecord,
      addWorkHours,
      updateTransaction,
      deleteTransaction,
      updateOdometerRecord,
      deleteOdometerRecord,
      updateWorkHours,
      deleteWorkHours,
      updateUserProfile,
      getMetrics: handleGetMetrics,
      getChartData: handleGetChartData,
      isLoading
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
