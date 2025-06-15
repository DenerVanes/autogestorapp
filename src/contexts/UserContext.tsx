import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabaseService } from '@/services/supabaseService';
import { UserDataService } from '@/contexts/userDataService';
import { UserContextType } from '@/contexts/types';
import { User, Transaction, OdometerRecord, WorkHoursRecord } from '@/types';
import { getMetrics, getChartData } from '@/utils/calculations';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser } = useAuth();
  const { can_edit, status } = useSubscription();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [odometerRecords, setOdometerRecords] = useState<OdometerRecord[]>([]);
  const [workHours, setWorkHours] = useState<WorkHoursRecord[]>([]);

  const loadUserData = async () => {
    if (!authUser) {
      setUser(null);
      setTransactions([]);
      setOdometerRecords([]);
      setWorkHours([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Loading user data for:', authUser.id);

      // Load user profile
      const userProfile = await UserDataService.loadUserProfile(authUser.id);
      setUser(userProfile);

      // Load all user data
      const { transactions: userTransactions, odometerRecords: userOdometerRecords, workHours: userWorkHours } = 
        await UserDataService.loadAllUserData();

      setTransactions(userTransactions);
      setOdometerRecords(userOdometerRecords);
      setWorkHours(userWorkHours);

      console.log('User data loaded successfully');
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se pode editar
  const checkCanEdit = (action: string) => {
    if (!can_edit) {
      const message = status === 'trial' 
        ? 'Seu período gratuito expirou. Faça uma assinatura para continuar editando dados.'
        : 'Assinatura necessária para editar dados.';
      
      toast.error(message);
      return false;
    }
    return true;
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!checkCanEdit('adicionar transação')) return;

    try {
      const dbTransaction = await supabaseService.createTransaction({
        type: transaction.type,
        date: transaction.date.toISOString().split('T')[0],
        value: transaction.value,
        category: transaction.category,
        fuel_type: transaction.fuelType,
        price_per_liter: transaction.pricePerLiter,
        subcategory: transaction.subcategory,
        observation: transaction.observation
      });

      const newTransaction: Transaction = {
        id: dbTransaction.id,
        type: dbTransaction.type as 'receita' | 'despesa',
        date: new Date(dbTransaction.date),
        value: Number(dbTransaction.value),
        category: dbTransaction.category,
        fuelType: dbTransaction.fuelType,
        pricePerLiter: dbTransaction.pricePerLiter ? Number(dbTransaction.pricePerLiter) : undefined,
        subcategory: dbTransaction.subcategory,
        observation: dbTransaction.observation
      };

      setTransactions(prev => [newTransaction, ...prev]);
      console.log('Transaction added:', newTransaction);
      toast.success('Transação adicionada com sucesso!');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Erro ao adicionar transação');
      throw error;
    }
  };

  const addOdometerRecord = async (record: Omit<OdometerRecord, 'id'>) => {
    if (!checkCanEdit('adicionar registro de quilometragem')) return;

    try {
      const dbRecord = await supabaseService.createOdometerRecord({
        date: record.date.toISOString().split('T')[0],
        type: record.type,
        value: record.value
      });

      const newRecord: OdometerRecord = {
        id: dbRecord.id,
        date: new Date(dbRecord.date),
        type: dbRecord.type as 'inicial' | 'final',
        value: dbRecord.value
      };

      setOdometerRecords(prev => [newRecord, ...prev]);
      console.log('Odometer record added:', newRecord);
      toast.success('Registro de quilometragem adicionado!');
    } catch (error) {
      console.error('Error adding odometer record:', error);
      toast.error('Erro ao adicionar registro de quilometragem');
      throw error;
    }
  };

  const addWorkHours = async (record: Omit<WorkHoursRecord, 'id'>) => {
    if (!checkCanEdit('adicionar registro de horas trabalhadas')) return;

    try {
      const dbRecord = await supabaseService.createWorkHours({
        start_date_time: record.startDateTime.toISOString(),
        end_date_time: record.endDateTime.toISOString()
      });

      const newRecord: WorkHoursRecord = {
        id: dbRecord.id,
        startDateTime: new Date(dbRecord.start_date_time),
        endDateTime: new Date(dbRecord.end_date_time)
      };

      setWorkHours(prev => [newRecord, ...prev]);
      console.log('Work hours added:', newRecord);
      toast.success('Horas de trabalho registradas!');
    } catch (error) {
      console.error('Error adding work hours:', error);
      toast.error('Erro ao registrar horas de trabalho');
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!authUser || !user) return;

    try {
      await supabaseService.updateUserProfile(authUser.id, {
        name: updates.name,
        email: updates.email,
        vehicle_type: updates.vehicleType,
        vehicle_model: updates.vehicleModel,
        fuel_consumption: updates.fuelConsumption
      });

      setUser(prev => prev ? { ...prev, ...updates } : null);
      console.log('User profile updated:', updates);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('Erro ao atualizar perfil');
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!checkCanEdit('atualizar transação')) return;

    try {
      await supabaseService.updateTransaction(id, {
        type: updates.type,
        date: updates.date?.toISOString().split('T')[0],
        value: updates.value,
        category: updates.category,
        fuel_type: updates.fuelType,
        price_per_liter: updates.pricePerLiter,
        subcategory: updates.subcategory,
        observation: updates.observation
      });

      setTransactions(prev => prev.map(t => 
        t.id === id ? { ...t, ...updates } : t
      ));
      
      console.log('Transaction updated:', id);
      toast.success('Transação atualizada!');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Erro ao atualizar transação');
      throw error;
    }
  };

  const updateOdometerRecord = async (id: string, updates: Partial<OdometerRecord>) => {
    if (!checkCanEdit('atualizar quilometragem')) return;

    try {
      await supabaseService.updateOdometerRecord(id, {
        date: updates.date?.toISOString().split('T')[0],
        type: updates.type,
        value: updates.value
      });

      setOdometerRecords(prev => prev.map(r => 
        r.id === id ? { ...r, ...updates } : r
      ));
      
      console.log('Odometer record updated:', id);
      toast.success('Registro de quilometragem atualizado!');
    } catch (error) {
      console.error('Error updating odometer record:', error);
      toast.error('Erro ao atualizar registro');
      throw error;
    }
  };

  const updateWorkHours = async (id: string, updates: Partial<WorkHoursRecord>) => {
    if (!checkCanEdit('atualizar horas trabalhadas')) return;

    try {
      await supabaseService.updateWorkHours(id, {
        start_date_time: updates.startDateTime?.toISOString(),
        end_date_time: updates.endDateTime?.toISOString()
      });

      setWorkHours(prev => prev.map(w => 
        w.id === id ? { ...w, ...updates } : w
      ));
      
      console.log('Work hours updated:', id);
      toast.success('Horas de trabalho atualizadas!');
    } catch (error) {
      console.error('Error updating work hours:', error);
      toast.error('Erro ao atualizar horas');
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!checkCanEdit('excluir transação')) return;

    try {
      await supabaseService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      console.log('Transaction deleted:', id);
      toast.success('Transação excluída!');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Erro ao excluir transação');
      throw error;
    }
  };

  const deleteOdometerRecord = async (id: string) => {
    if (!checkCanEdit('excluir registro de quilometragem')) return;

    try {
      await supabaseService.deleteOdometerRecord(id);
      setOdometerRecords(prev => prev.filter(r => r.id !== id));
      console.log('Odometer record deleted:', id);
      toast.success('Registro de quilometragem excluído!');
    } catch (error) {
      console.error('Error deleting odometer record:', error);
      toast.error('Erro ao excluir registro');
      throw error;
    }
  };

  const deleteWorkHours = async (id: string) => {
    if (!checkCanEdit('excluir horas trabalhadas')) return;

    try {
      await supabaseService.deleteWorkHours(id);
      setWorkHours(prev => prev.filter(w => w.id !== id));
      console.log('Work hours deleted:', id);
      toast.success('Horas de trabalho excluídas!');
    } catch (error) {
      console.error('Error deleting work hours:', error);
      toast.error('Erro ao excluir horas');
      throw error;
    }
  };

  const getUserMetrics = (period: string, customStartDate?: Date, customEndDate?: Date) => {
    return getMetrics(transactions, odometerRecords, workHours, period, customStartDate, customEndDate);
  };

  const getUserChartData = (period: string, customStartDate?: Date, customEndDate?: Date) => {
    return getChartData(transactions, period, customStartDate, customEndDate);
  };

  const refreshData = async () => {
    await loadUserData();
  };

  useEffect(() => {
    loadUserData();
  }, [authUser]);

  return (
    <UserContext.Provider value={{
      user,
      loading,
      transactions,
      odometerRecords,
      workHours,
      addTransaction,
      addOdometerRecord,
      addWorkHours,
      updateUserProfile,
      updateTransaction,
      updateOdometerRecord,
      updateWorkHours,
      deleteTransaction,
      deleteOdometerRecord,
      deleteWorkHours,
      getMetrics: getUserMetrics,
      getChartData: getUserChartData,
      refreshData
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
