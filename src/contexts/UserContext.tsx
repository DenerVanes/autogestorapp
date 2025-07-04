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
import { lancamentoService } from '@/services/lancamentoService';
import { filterByPeriod } from '@/utils/dateFilters';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser, loading: authLoading } = useAuth();
  const { checkAccess, isExpired } = useAccessControl();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [odometerRecords, setOdometerRecords] = useState<OdometerRecord[]>([]);
  const [workHours, setWorkHours] = useState<WorkHoursRecord[]>([]);
  const [lancamentos, setLancamentos] = useState([]);

  // Get operations without access control wrapper
  const transactionOps = useTransactionOperations(setTransactions, authUser?.id);
  const odometerOps = useOdometerOperations(setOdometerRecords, authUser?.id);
  const workHoursOps = useWorkHoursOperations(setWorkHours, authUser?.id);

  // Wrap operations with access control that return promises
  const protectedTransactionOps = {
    addTransaction: async (transaction: any): Promise<void> => {
      console.log('UserContext - addTransaction chamada');
      console.log('Transaction data:', transaction);
      console.log('isExpired:', isExpired);
      console.log('checkAccess result:', checkAccess('adicionar transações'));
      
      if (isExpired || !checkAccess('adicionar transações')) {
        console.log('Acesso negado para adicionar transação');
        return;
      }
      
      console.log('Chamando transactionOps.addTransaction...');
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
    },
    deleteMultipleOdometerRecords: async (ids: string[]): Promise<void> => {
      if (isExpired || !checkAccess('remover registros de hodômetro')) return;
      return odometerOps.deleteMultipleOdometerRecords(ids);
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

  // Operações de Lançamento
  const addLancamento = async (lancamento) => {
    if (isExpired || !checkAccess('adicionar lançamentos')) {
      throw new Error('Acesso bloqueado: Assine o PRO para continuar.');
    }
    if (!authUser) throw new Error('User not authenticated');
    const novoLancamento = await lancamentoService.createLancamento(lancamento, authUser.id);
    setLancamentos((prev) => [novoLancamento, ...prev]);
    return novoLancamento;
  };
  const updateLancamento = async (id, updates) => {
    if (isExpired || !checkAccess('editar lançamentos')) {
      throw new Error('Acesso bloqueado: Assine o PRO para continuar.');
    }
    const atualizado = await lancamentoService.updateLancamento(id, updates);
    setLancamentos((prev) => prev.map(l => l.id === id ? atualizado : l));
    return atualizado;
  };
  const deleteLancamento = async (id) => {
    if (isExpired || !checkAccess('remover lançamentos')) {
      throw new Error('Acesso bloqueado: Assine o PRO para continuar.');
    }
    await lancamentoService.deleteLancamento(id);
    setLancamentos((prev) => prev.filter(l => l.id !== id));
  };

  // Load user data when auth user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (!authUser) {
        setUser(null);
        setTransactions([]);
        setOdometerRecords([]);
        setWorkHours([]);
        setLancamentos([]);
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
      setLancamentos(data.lancamentos || []);
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

  function filterLancamentosByPeriod(lancamentos, period, customStartDate, customEndDate) {
    const lancs = Array.isArray(lancamentos) ? lancamentos : [];
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    switch (period) {
      case "hoje":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case "ontem":
        const ontem = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        startDate = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 0, 0, 0, 0);
        endDate = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 23, 59, 59, 999);
        break;
      case "esta-semana": {
        const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      }
      case "semana-passada": {
        const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
        const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek - 6, 0, 0, 0, 0);
        const lastWeekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek, 23, 59, 59, 999);
        startDate = lastWeekStart;
        endDate = lastWeekEnd;
        break;
      }
      case "este-mes":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case "mes-passado": {
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        startDate = firstDayLastMonth;
        endDate = lastDayLastMonth;
        break;
      }
      case "personalizado":
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate.getFullYear(), customStartDate.getMonth(), customStartDate.getDate(), 0, 0, 0, 0);
          endDate = new Date(customEndDate.getFullYear(), customEndDate.getMonth(), customEndDate.getDate(), 23, 59, 59, 999);
          break;
        }
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }
    return lancs.filter(l => {
      if (!l.dataLancamento) return false;
      const lDate = l.dataLancamento instanceof Date ? l.dataLancamento : new Date(l.dataLancamento);
      return lDate >= startDate && lDate <= endDate;
    });
  }

  function filterWorkHoursByPeriod(workHours, period, customStartDate, customEndDate) {
    const whs = Array.isArray(workHours) ? workHours : [];
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    switch (period) {
      case "hoje":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case "ontem":
        const ontem = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        startDate = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 0, 0, 0, 0);
        endDate = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 23, 59, 59, 999);
        break;
      case "esta-semana": {
        const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      }
      case "semana-passada": {
        const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
        const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek - 6, 0, 0, 0, 0);
        const lastWeekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek, 23, 59, 59, 999);
        startDate = lastWeekStart;
        endDate = lastWeekEnd;
        break;
      }
      case "este-mes":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case "mes-passado": {
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        startDate = firstDayLastMonth;
        endDate = lastDayLastMonth;
        break;
      }
      case "personalizado":
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate.getFullYear(), customStartDate.getMonth(), customStartDate.getDate(), 0, 0, 0, 0);
          endDate = new Date(customEndDate.getFullYear(), customEndDate.getMonth(), customEndDate.getDate(), 23, 59, 59, 999);
          break;
        }
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }
    return whs.filter(w => {
      if (!w.startDateTime) return false;
      const wDate = w.startDateTime instanceof Date ? w.startDateTime : new Date(w.startDateTime);
      return wDate >= startDate && wDate <= endDate;
    });
  }

  const getMetricsWithChanges = (period: string, customStartDate?: Date, customEndDate?: Date): Metrics => {
    const filteredTransactions = filterByPeriod(Array.isArray(transactions) ? transactions : [], period, customStartDate, customEndDate);
    const filteredWorkHours = filterWorkHoursByPeriod(workHours, period, customStartDate, customEndDate);
    return getMetrics(filteredTransactions, odometerRecords, filteredWorkHours, period, customStartDate, customEndDate);
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
        lancamentos,
        ...protectedTransactionOps,
        ...protectedOdometerOps,
        ...protectedWorkHoursOps,
        addLancamento,
        updateLancamento,
        deleteLancamento,
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
