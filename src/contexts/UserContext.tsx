import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/profileService';
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
  const { checkAccess, isExpired } = useAccessControl();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [odometerRecords, setOdometerRecords] = useState<OdometerRecord[]>([]);
  const [workHours, setWorkHours] = useState<WorkHoursRecord[]>([]);

  // Get operations without access control wrapper
  const transactionOps = useTransactionOperations(setTransactions, authUser?.id);
  const odometerOps = useOdometerOperations(setOdometerRecords, authUser?.id);
  const workHoursOps = useWorkHoursOperations(setWorkHours, authUser?.id);

  // Wrap operations with access control that return promises
  const protectedTransactionOps = {
    addTransaction: async (transaction: any): Promise<void> => {
      if (isExpired || !checkAccess('adicionar transações')) return;
      return transactionOps.addTransaction(transaction);
    },
    updateTransaction: async (id: string, updates: any): Promise<void> => {
      if (isExpired || !checkAccess('editar transações')) return;
      return transactionOps.updateTransaction(id, updates);
    },
    deleteTransaction: async (id: string): Promise<void> => {
      if (isExpired || !checkAccess('remover transações')) return;
      return transactionOps.deleteTransaction(id);
    }
  };

  const protectedOdometerOps = {
    addOdometerRecord: async (record: any): Promise<void> => {
      if (isExpired || !checkAccess('adicionar registros de hodômetro')) return;
      return odometerOps.addOdometerRecord(record);
    },
    updateOdometerRecord: async (id: string, updates: any): Promise<void> => {
      if (isExpired || !checkAccess('editar registros de hodômetro')) return;
      return odometerOps.updateOdometerRecord(id, updates);
    },
    deleteOdometerRecord: async (id: string): Promise<void> => {
      if (isExpired || !checkAccess('remover registros de hodômetro')) return;
      return odometerOps.deleteOdometerRecord(id);
    }
  };

  const protectedWorkHoursOps = {
    addWorkHours: async (record: any): Promise<void> => {
      if (isExpired || !checkAccess('adicionar horas trabalhadas')) return;
      return workHoursOps.addWorkHours(record);
    },
    updateWorkHours: async (id: string, updates: any): Promise<void> => {
      if (isExpired || !checkAccess('editar horas trabalhadas')) return;
      return workHoursOps.updateWorkHours(id, updates);
    },
    deleteWorkHours: async (id: string): Promise<void> => {
      if (isExpired || !checkAccess('remover horas trabalhadas')) return;
      return workHoursOps.deleteWorkHours(id);
    }
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

    const emailToUse = user.email || authUser.email;
    if (!emailToUse) {
      console.error("Cannot update profile without an email address.");
      return;
    }

    const updatedProfile = await profileService.updateUserProfile(authUser.id, {
      name: updates.name,
      vehicle_type: updates.vehicleType,
      vehicle_model: updates.vehicleModel,
      fuel_consumption: updates.fuelConsumption,
      email: emailToUse
    });

    if (updatedProfile) {
        setUser({
          id: updatedProfile.id,
          name: updatedProfile.name,
          email: updatedProfile.email,
          vehicleType: updatedProfile.vehicle_type,
          vehicleModel: updatedProfile.vehicle_model,
          fuelConsumption: updatedProfile.fuel_consumption
        });
    } else {
        console.error("Failed to update profile. The returned profile data was null.");
    }
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
