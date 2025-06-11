
import { createContext, useContext, useState, ReactNode } from "react";

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

interface UserContextType {
  user: User | null;
  transactions: Transaction[];
  odometerRecords: OdometerRecord[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addOdometerRecord: (record: Omit<OdometerRecord, 'id'>) => void;
  getMetrics: (period: string) => {
    receita: number;
    despesa: number;
    kmRodado: number;
    valorPorKm: number;
  };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [odometerRecords, setOdometerRecords] = useState<OdometerRecord[]>([]);

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

  const getMetrics = (period: string) => {
    // Lógica para calcular métricas baseada no período
    const receita = transactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.value, 0);
    
    const despesa = transactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.value, 0);

    // Calcular KM rodado baseado nos registros de odômetro
    const kmRodado = 450; // Mock
    const valorPorKm = kmRodado > 0 ? receita / kmRodado : 0;

    return { receita, despesa, kmRodado, valorPorKm };
  };

  return (
    <UserContext.Provider value={{
      user,
      transactions,
      odometerRecords,
      addTransaction,
      addOdometerRecord,
      getMetrics
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
