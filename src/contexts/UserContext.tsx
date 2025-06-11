
import { createContext, useContext, useState, ReactNode } from "react";
import { format, subDays, startOfDay, endOfDay, parseISO } from "date-fns";

interface User {
  id: string;
  name: string;
  email: string;
  registrationDate: Date;
}

interface Transaction {
  id: string;
  type: 'receita' | 'despesa';
  date: Date;
  value: number;
  category: string;
  subcategory?: string;
  observation?: string;
  fuelType?: string;
  pricePerLiter?: number;
}

interface OdometerRecord {
  id: string;
  date: Date;
  type: 'inicial' | 'final';
  value: number;
}

interface WorkHoursRecord {
  id: string;
  startDateTime: Date;
  endDateTime: Date;
}

interface UserContextType {
  user: User | null;
  transactions: Transaction[];
  odometerRecords: OdometerRecord[];
  workHours: WorkHoursRecord[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addOdometerRecord: (record: Omit<OdometerRecord, 'id'>) => void;
  addWorkHours: (record: Omit<WorkHoursRecord, 'id'>) => void;
  getMetrics: (period: string, customStartDate?: Date, customEndDate?: Date) => {
    receita: number;
    despesa: number;
    saldo: number;
    kmRodado: number;
    valorPorKm: number;
    horasTrabalhadas: number;
    valorPorHora: number;
  };
  getChartData: (period: string, customStartDate?: Date, customEndDate?: Date) => Array<{
    date: string;
    receita: number;
    despesa: number;
  }>;
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

  const filterByPeriod = (items: Array<{ date: Date }>, period: string, customStartDate?: Date, customEndDate?: Date) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    if (period === 'personalizado' && customStartDate && customEndDate) {
      startDate = startOfDay(customStartDate);
      endDate = endOfDay(customEndDate);
    } else {
      switch (period) {
        case 'hoje':
          startDate = startOfDay(now);
          break;
        case '7dias':
          startDate = startOfDay(subDays(now, 6));
          break;
        case '30dias':
          startDate = startOfDay(subDays(now, 29));
          break;
        default:
          startDate = startOfDay(now);
      }
    }

    return items.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const calculateWorkHours = (period: string, customStartDate?: Date, customEndDate?: Date): number => {
    const filteredWorkHours = filterByPeriod(workHours, period, customStartDate, customEndDate);
    
    return filteredWorkHours.reduce((total, record) => {
      const diff = record.endDateTime.getTime() - record.startDateTime.getTime();
      return total + (diff / (1000 * 60 * 60)); // Convert to hours
    }, 0);
  };

  const getMetrics = (period: string, customStartDate?: Date, customEndDate?: Date) => {
    const filteredTransactions = filterByPeriod(transactions, period, customStartDate, customEndDate);
    
    const receita = filteredTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.value, 0);
    
    const despesa = filteredTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.value, 0);

    const saldo = receita - despesa;

    // Calculate KM rodado based on odometer records for the same period
    const filteredOdometer = filterByPeriod(odometerRecords, period, customStartDate, customEndDate);
    const kmRodado = 450; // Mock for now - would need proper calculation

    const valorPorKm = kmRodado > 0 ? receita / kmRodado : 0;

    const horasTrabalhadas = calculateWorkHours(period, customStartDate, customEndDate);
    const valorPorHora = horasTrabalhadas > 0 ? receita / horasTrabalhadas : 0;

    return { receita, despesa, saldo, kmRodado, valorPorKm, horasTrabalhadas, valorPorHora };
  };

  const getChartData = (period: string, customStartDate?: Date, customEndDate?: Date) => {
    const filteredTransactions = filterByPeriod(transactions, period, customStartDate, customEndDate);
    
    // Group transactions by date
    const dataMap = new Map<string, { receita: number; despesa: number }>();
    
    filteredTransactions.forEach(transaction => {
      const dateKey = format(transaction.date, 'yyyy-MM-dd');
      const existing = dataMap.get(dateKey) || { receita: 0, despesa: 0 };
      
      if (transaction.type === 'receita') {
        existing.receita += transaction.value;
      } else {
        existing.despesa += transaction.value;
      }
      
      dataMap.set(dateKey, existing);
    });

    // Convert to array and sort by date
    return Array.from(dataMap.entries())
      .map(([date, values]) => ({
        date,
        ...values
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
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
      getMetrics,
      getChartData
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
