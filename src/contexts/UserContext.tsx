
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabaseService } from '@/services/supabaseService';
import { User, Transaction, OdometerRecord, WorkHoursRecord, Metrics, ChartData } from '@/types';
import { filterByPeriod, filterWorkHoursByPeriod } from '@/utils/dateFilters';
import { getMetrics, getChartData } from '@/utils/calculations';

interface UserContextType {
  user: User | null;
  loading: boolean;
  transactions: Transaction[];
  odometerRecords: OdometerRecord[];
  workHours: WorkHoursRecord[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  addOdometerRecord: (record: Omit<OdometerRecord, 'id'>) => Promise<void>;
  addWorkHours: (record: Omit<WorkHoursRecord, 'id'>) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  updateOdometerRecord: (id: string, updates: Partial<OdometerRecord>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteOdometerRecord: (id: string) => Promise<void>;
  deleteWorkHours: (id: string) => Promise<void>;
  getMetrics: (period: string, customStartDate?: Date, customEndDate?: Date) => Metrics & { changes: Record<string, string> };
  getChartData: (period: string, customStartDate?: Date, customEndDate?: Date) => ChartData[];
  refreshData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [odometerRecords, setOdometerRecords] = useState<OdometerRecord[]>([]);
  const [workHours, setWorkHours] = useState<WorkHoursRecord[]>([]);

  // Load user data when auth user changes
  useEffect(() => {
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
        
        // Try to get user profile, create if doesn't exist
        let profile;
        try {
          profile = await supabaseService.getUserProfile(authUser.id);
        } catch (error: any) {
          console.log('Profile not found, creating new profile');
          // Create profile if it doesn't exist
          profile = await supabaseService.updateUserProfile(authUser.id, {
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
            email: authUser.email || ''
          });
        }

        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          vehicleType: profile.vehicle_type,
          vehicleModel: profile.vehicle_model,
          fuelConsumption: profile.fuel_consumption
        });

        // Load all user data
        await refreshData();
      } catch (error) {
        console.error('Error loading user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [authUser]);

  const refreshData = async () => {
    if (!authUser) return;

    try {
      const [transactionsData, odometerData, workHoursData] = await Promise.all([
        supabaseService.getTransactions(),
        supabaseService.getOdometerRecords(),
        supabaseService.getWorkHours()
      ]);

      // Transform database data to application format
      setTransactions(transactionsData.map(t => ({
        id: t.id,
        type: t.type as 'receita' | 'despesa',
        date: new Date(t.date),
        value: Number(t.value),
        category: t.category,
        fuelType: t.fuel_type,
        pricePerLiter: t.price_per_liter ? Number(t.price_per_liter) : undefined,
        subcategory: t.subcategory,
        observation: t.observation
      })));

      setOdometerRecords(odometerData.map(o => ({
        id: o.id,
        date: new Date(o.date),
        type: o.type as 'inicial' | 'final',
        value: o.value
      })));

      setWorkHours(workHoursData.map(w => ({
        id: w.id,
        startDateTime: new Date(w.start_date_time),
        endDateTime: new Date(w.end_date_time)
      })));
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!authUser) throw new Error('User not authenticated');

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

    const transformedTransaction: Transaction = {
      id: newTransaction.id,
      type: newTransaction.type as 'receita' | 'despesa',
      date: new Date(newTransaction.date),
      value: Number(newTransaction.value),
      category: newTransaction.category,
      fuelType: newTransaction.fuelType,
      pricePerLiter: newTransaction.pricePerLiter ? Number(newTransaction.pricePerLiter) : undefined,
      subcategory: newTransaction.subcategory,
      observation: newTransaction.observation
    };

    setTransactions(prev => [transformedTransaction, ...prev]);
  };

  const addOdometerRecord = async (record: Omit<OdometerRecord, 'id'>) => {
    if (!authUser) throw new Error('User not authenticated');

    const newRecord = await supabaseService.createOdometerRecord({
      date: record.date.toISOString(),
      type: record.type,
      value: record.value
    });

    const transformedRecord = {
      id: newRecord.id,
      date: new Date(newRecord.date),
      type: newRecord.type as 'inicial' | 'final',
      value: newRecord.value
    };

    setOdometerRecords(prev => [transformedRecord, ...prev]);
  };

  const addWorkHours = async (record: Omit<WorkHoursRecord, 'id'>) => {
    if (!authUser) throw new Error('User not authenticated');

    const newRecord = await supabaseService.createWorkHours({
      start_date_time: record.startDateTime.toISOString(),
      end_date_time: record.endDateTime.toISOString()
    });

    const transformedRecord = {
      id: newRecord.id,
      startDateTime: new Date(newRecord.start_date_time),
      endDateTime: new Date(newRecord.end_date_time)
    };

    setWorkHours(prev => [transformedRecord, ...prev]);
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!authUser || !user) throw new Error('User not authenticated');

    const updatedProfile = await supabaseService.updateUserProfile(authUser.id, {
      name: updates.name,
      vehicle_type: updates.vehicleType,
      vehicle_model: updates.vehicleModel,
      fuel_consumption: updates.fuelConsumption
    });

    setUser({
      id: updatedProfile.id,
      name: updatedProfile.name,
      email: updatedProfile.email,
      vehicleType: updatedProfile.vehicle_type,
      vehicleModel: updatedProfile.vehicle_model,
      fuelConsumption: updatedProfile.fuel_consumption
    });
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!authUser) throw new Error('User not authenticated');

    const updatedTransaction = await supabaseService.updateTransaction(id, {
      type: updates.type,
      date: updates.date?.toISOString(),
      value: updates.value,
      category: updates.category,
      fuel_type: updates.fuelType,
      price_per_liter: updates.pricePerLiter,
      subcategory: updates.subcategory,
      observation: updates.observation
    });

    setTransactions(prev => prev.map(t => 
      t.id === id 
        ? {
            id: updatedTransaction.id,
            type: updatedTransaction.type as 'receita' | 'despesa',
            date: new Date(updatedTransaction.date),
            value: Number(updatedTransaction.value),
            category: updatedTransaction.category,
            fuelType: updatedTransaction.fuel_type,
            pricePerLiter: updatedTransaction.price_per_liter ? Number(updatedTransaction.price_per_liter) : undefined,
            subcategory: updatedTransaction.subcategory,
            observation: updatedTransaction.observation
          }
        : t
    ));
  };

  const updateOdometerRecord = async (id: string, updates: Partial<OdometerRecord>) => {
    if (!authUser) throw new Error('User not authenticated');

    const updatedRecord = await supabaseService.updateOdometerRecord(id, {
      date: updates.date?.toISOString(),
      type: updates.type,
      value: updates.value
    });

    setOdometerRecords(prev => prev.map(o => 
      o.id === id 
        ? {
            id: updatedRecord.id,
            date: new Date(updatedRecord.date),
            type: updatedRecord.type as 'inicial' | 'final',
            value: updatedRecord.value
          }
        : o
    ));
  };

  const deleteTransaction = async (id: string) => {
    if (!authUser) throw new Error('User not authenticated');

    await supabaseService.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const deleteOdometerRecord = async (id: string) => {
    if (!authUser) throw new Error('User not authenticated');

    await supabaseService.deleteOdometerRecord(id);
    setOdometerRecords(prev => prev.filter(o => o.id !== id));
  };

  const deleteWorkHours = async (id: string) => {
    if (!authUser) throw new Error('User not authenticated');

    await supabaseService.deleteWorkHours(id);
    setWorkHours(prev => prev.filter(w => w.id !== id));
  };

  const getMetricsWithChanges = (period: string, customStartDate?: Date, customEndDate?: Date): Metrics & { changes: Record<string, string> } => {
    return getMetrics(transactions, odometerRecords, workHours, period, customStartDate, customEndDate);
  };

  const getChartDataFiltered = (period: string, customStartDate?: Date, customEndDate?: Date): ChartData[] => {
    return getChartData(transactions, period, customStartDate, customEndDate);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading: loading || authLoading,
        transactions,
        odometerRecords,
        workHours,
        addTransaction,
        addOdometerRecord,
        addWorkHours,
        updateUserProfile,
        updateTransaction,
        updateOdometerRecord,
        deleteTransaction,
        deleteOdometerRecord,
        deleteWorkHours,
        getMetrics: getMetricsWithChanges,
        getChartData: getChartDataFiltered,
        refreshData
      }}
    >
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
