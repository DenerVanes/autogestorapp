import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/profileService';
import { User, Transaction, OdometerRecordFull, WorkHoursRecord, Metrics, ChartData } from '@/types';
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
  const [odometerRecords, setOdometerRecords] = useState<OdometerRecordFull[]>([]);
  const [workHours, setWorkHours] = useState<WorkHoursRecord[]>([]);
  const [lancamentos, setLancamentos] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Get operations without access control wrapper
  const transactionOps = useTransactionOperations(setTransactions, authUser?.id);
  const odometerOps = useOdometerOperations(setOdometerRecords, authUser?.id);
  const workHoursOps = useWorkHoursOperations(setWorkHours, authUser?.id);

  // Função otimizada para carregar dados apenas quando necessário
  const loadInitialData = useCallback(async () => {
    if (!authUser || dataLoaded) return;

    try {
      console.log('Loading initial data...');
      setLoading(true);
      
      // Load user profile
      const profile = await UserDataService.loadUserProfile(authUser.id);
      setUser(profile);

      // Load all user data
      const data = await UserDataService.loadAllUserData();
      setTransactions(data.transactions);
      setOdometerRecords(data.odometerRecords);
      setWorkHours(data.workHours);
      setLancamentos(data.lancamentos || []);
      
      setDataLoaded(true);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [authUser, dataLoaded]);

  // Função para atualizar apenas dados específicos
  const updateSpecificData = useCallback(async (dataType: 'transactions' | 'odometer' | 'workHours' | 'lancamentos') => {
    if (!authUser) return;

    try {
      console.log(`Updating ${dataType}...`);
      const data = await UserDataService.loadAllUserData();
      
      switch (dataType) {
        case 'transactions':
          setTransactions(data.transactions);
          break;
        case 'odometer':
          setOdometerRecords(data.odometerRecords);
          break;
        case 'workHours':
          setWorkHours(data.workHours);
          break;
        case 'lancamentos':
          setLancamentos(data.lancamentos || []);
          break;
      }
    } catch (error) {
      console.error(`Error updating ${dataType}:`, error);
    }
  }, [authUser]);

  // Wrap operations with access control that return promises
  const protectedTransactionOps = {
    addTransaction: async (transaction: any): Promise<void> => {
      console.log('UserContext - addTransaction chamada');
      
      if (isExpired || !checkAccess('adicionar transações')) {
        console.log('Acesso negado para adicionar transação');
        return;
      }
      
      await transactionOps.addTransaction(transaction);
      // Atualizar apenas transações
      await updateSpecificData('transactions');
    },
    updateTransaction: async (id: string, updates: any): Promise<void> => {
      if (isExpired || !checkAccess('editar transações')) return;
      await transactionOps.updateTransaction(id, updates);
      await updateSpecificData('transactions');
    },
    deleteTransaction: async (id: string): Promise<void> => {
      if (isExpired || !checkAccess('remover transações')) return;
      await transactionOps.deleteTransaction(id);
      await updateSpecificData('transactions');
    }
  };

  const protectedOdometerOps = {
    addOdometerRecord: async (record: any): Promise<void> => {
      if (isExpired || !checkAccess('adicionar registros de hodômetro')) return;
      await odometerOps.addOdometerRecord(record);
      await updateSpecificData('odometer');
    },
    updateOdometerRecord: async (id: string, updates: any): Promise<void> => {
      if (isExpired || !checkAccess('editar registros de hodômetro')) return;
      await odometerOps.updateOdometerRecord(id, updates);
      await updateSpecificData('odometer');
    },
    deleteOdometerRecord: async (id: string): Promise<void> => {
      if (isExpired || !checkAccess('remover registros de hodômetro')) return;
      await odometerOps.deleteOdometerRecord(id);
      await updateSpecificData('odometer');
    },
    deleteMultipleOdometerRecords: async (ids: string[]): Promise<void> => {
      if (isExpired || !checkAccess('remover registros de hodômetro')) return;
      await odometerOps.deleteMultipleOdometerRecords(ids);
      await updateSpecificData('odometer');
    }
  };

  const protectedWorkHoursOps = {
    addWorkHours: async (record: any): Promise<void> => {
      if (isExpired || !checkAccess('adicionar horas trabalhadas')) return;
      await workHoursOps.addWorkHours(record);
      await updateSpecificData('workHours');
    },
    updateWorkHours: async (id: string, updates: any): Promise<void> => {
      if (isExpired || !checkAccess('editar horas trabalhadas')) return;
      await workHoursOps.updateWorkHours(id, updates);
      await updateSpecificData('workHours');
    },
    deleteWorkHours: async (id: string): Promise<void> => {
      if (isExpired || !checkAccess('remover horas trabalhadas')) return;
      await workHoursOps.deleteWorkHours(id);
      await updateSpecificData('workHours');
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

  // Load user data when auth user changes - APENAS UMA VEZ
  useEffect(() => {
    if (!authUser) {
      setUser(null);
      setTransactions([]);
      setOdometerRecords([]);
      setWorkHours([]);
      setLancamentos([]);
      setDataLoaded(false);
      setLoading(false);
      return;
    }

    // Só carrega se ainda não carregou
    if (!dataLoaded) {
      loadInitialData();
    }
  }, [authUser, loadInitialData, dataLoaded]);

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
        refreshData: () => loadInitialData()
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
