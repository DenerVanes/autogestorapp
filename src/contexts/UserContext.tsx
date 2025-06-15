
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabaseService } from '@/services/supabaseService';
import { User, Transaction, OdometerRecord, WorkHoursRecord, Metrics, ChartData } from '@/types';
import { getMetrics, getChartData } from '@/utils/calculations';
import { UserContextType } from './types';
import { UserDataService } from './userDataService';
import { useTransactionOperations } from './useTransactionOperations';
import { useOdometerOperations } from './useOdometerOperations';
import { useWorkHoursOperations } from './useWorkHoursOperations';
import { useAccessControl } from '@/hooks/useAccessControl';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser, loading: authLoading } = useAuth();
  const { requireAccess } = useAccessControl();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [odometerRecords, setOdometerRecords] = useState<OdometerRecord[]>([]);
  const [workHours, setWorkHours] = useState<WorkHoursRecord[]>([]);

  // Wrap operations with access control
  const transactionOps = useTransactionOperations(setTransactions, authUser?.id);
  const odometerOps = useOdometerOperations(setOdometerRecords, authUser?.id);
  const workHoursOps = useWorkHoursOperations(setWorkHours, authUser?.id);

  // Wrap operations that require access control
  const protectedTransactionOps = {
    ...transactionOps,
    addTransaction: (transaction: any) => requireAccess(() => transactionOps.addTransaction(transaction)),
    updateTransaction: (id: string, updates: any) => requireAccess(() => transactionOps.updateTransaction(id, updates)),
    deleteTransaction: (id: string) => requireAccess(() => transactionOps.deleteTransaction(id))
  };

  const protectedOdometerOps = {
    ...odometerOps,
    addOdometerRecord: (record: any) => requireAccess(() => odometerOps.addOdometerRecord(record)),
    updateOdometerRecord: (id: string, updates: any) => requireAccess(() => odometerOps.updateOdometerRecord(id, updates)),
    deleteOdometerRecord: (id: string) => requireAccess(() => odometerOps.deleteOdometerRecord(id))
  };

  const protectedWorkHoursOps = {
    ...workHoursOps,
    addWorkHours: (record: any) => requireAccess(() => workHoursOps.addWorkHours(record)),
    updateWorkHours: (id: string, updates: any) => requireAccess(() => workHoursOps.updateWorkHours(id, updates)),
    deleteWorkHours: (id: string) => requireAccess(() => workHoursOps.deleteWorkHours(id))
  };

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
        
        // Load user profile
        const profile = await UserDataService.loadUserProfile(authUser.id);
        setUser(profile);

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
      const data = await UserDataService.loadAllUserData();
      setTransactions(data.transactions);
      setOdometerRecords(data.odometerRecords);
      setWorkHours(data.workHours);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
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
        ...protectedTransactionOps,
        ...protectedOdometerOps,
        ...protectedWorkHoursOps,
        updateUserProfile,
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
