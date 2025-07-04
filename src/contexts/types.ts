
import { User, Transaction, WorkHoursRecord, Metrics, ChartData } from '@/types';
import { OdometerRecord } from '@/types';
import { Lancamento } from '@/lib/types';

export interface UserContextType {
  user: User | null;
  loading: boolean;
  transactions: Transaction[];
  lancamentos: Lancamento[];
  workHours: WorkHoursRecord[];
  odometerRecords: OdometerRecord[];
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  addLancamento: (lancamento: Omit<Lancamento, 'id' | 'status' | 'quilometragemPercorrida' | 'horaFinal' | 'odometroFinal' | 'observacoes'>) => Promise<Lancamento>;
  updateLancamento: (id: string, updates: Partial<Lancamento>) => Promise<Lancamento>;
  deleteLancamento: (id: string) => Promise<void>;

  addWorkHours: (record: Omit<WorkHoursRecord, 'id'>) => Promise<void>;
  updateWorkHours: (id: string, updates: Partial<WorkHoursRecord>) => Promise<void>;
  deleteWorkHours: (id: string) => Promise<void>;
  
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  getMetrics: (period: string, customStartDate?: Date, customEndDate?: Date) => Metrics;
  getChartData: (period: string, customStartDate?: Date, customEndDate?: Date) => ChartData[];
  refreshData: () => Promise<void>;

  addOdometerRecord: (record: Omit<OdometerRecord, 'id'>) => Promise<void>;
  updateOdometerRecord: (id: string, updates: Partial<OdometerRecord>) => Promise<void>;
  deleteOdometerRecord: (id: string) => Promise<void>;
  deleteMultipleOdometerRecords: (ids: string[]) => Promise<void>;
}
