
import { createContext, useContext, useState, ReactNode } from "react";
import { subDays } from "date-fns";
import type { User, Transaction, OdometerRecord, WorkHoursRecord, Metrics, ChartData } from "@/types";
import { getMetrics, getChartData } from "@/utils/calculations";

interface UserContextType {
  user: User | null;
  transactions: Transaction[];
  odometerRecords: OdometerRecord[];
  workHours: WorkHoursRecord[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addOdometerRecord: (record: Omit<OdometerRecord, 'id'>) => void;
  addWorkHours: (record: Omit<WorkHoursRecord, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  updateOdometerRecord: (id: string, record: Partial<OdometerRecord>) => void;
  deleteOdometerRecord: (id: string) => void;
  updateWorkHours: (id: string, record: Partial<WorkHoursRecord>) => void;
  deleteWorkHours: (id: string) => void;
  getMetrics: (period: string, customStartDate?: Date, customEndDate?: Date) => Metrics;
  getChartData: (period: string, customStartDate?: Date, customEndDate?: Date) => ChartData[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([
    // Mock data for demonstration
    {
      id: '1',
      type: 'receita',
      date: new Date(),
      value: 150.80,
      category: 'Uber'
    },
    {
      id: '2',
      type: 'despesa',
      date: new Date(),
      value: 85.50,
      category: 'Combustível'
    },
    {
      id: '3',
      type: 'receita',
      date: subDays(new Date(), 1),
      value: 220.30,
      category: '99'
    },
    {
      id: '4',
      type: 'despesa',
      date: subDays(new Date(), 1),
      value: 45.00,
      category: 'Alimentação'
    }
  ]);
  const [odometerRecords, setOdometerRecords] = useState<OdometerRecord[]>([
    {
      id: '1',
      date: new Date(),
      type: 'inicial',
      value: 50000
    },
    {
      id: '2',
      date: new Date(),
      type: 'final',
      value: 50450
    }
  ]);
  const [workHours, setWorkHours] = useState<WorkHoursRecord[]>([
    {
      id: '1',
      startDateTime: new Date(2024, 5, 10, 9, 0),
      endDateTime: new Date(2024, 5, 10, 17, 0)
    }
  ]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const addOdometerRecord = (record: Omit<OdometerRecord, 'id'>) => {
    const newRecord = {
      ...record,
      id: Date.now().toString()
    };
    setOdometerRecords(prev => [...prev, newRecord]);
  };

  const addWorkHours = (record: Omit<WorkHoursRecord, 'id'>) => {
    const newRecord = {
      ...record,
      id: Date.now().toString()
    };
    setWorkHours(prev => [...prev, newRecord]);
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions(prev => prev.map(transaction => 
      transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction
    ));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  const updateOdometerRecord = (id: string, updatedRecord: Partial<OdometerRecord>) => {
    setOdometerRecords(prev => prev.map(record => 
      record.id === id ? { ...record, ...updatedRecord } : record
    ));
  };

  const deleteOdometerRecord = (id: string) => {
    setOdometerRecords(prev => prev.filter(record => record.id !== id));
  };

  const updateWorkHours = (id: string, updatedRecord: Partial<WorkHoursRecord>) => {
    setWorkHours(prev => prev.map(record => 
      record.id === id ? { ...record, ...updatedRecord } : record
    ));
  };

  const deleteWorkHours = (id: string) => {
    setWorkHours(prev => prev.filter(record => record.id !== id));
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
      getMetrics: handleGetMetrics,
      getChartData: handleGetChartData
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
