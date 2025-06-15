
import { User, Transaction, OdometerRecord, WorkHoursRecord, Metrics, ChartData } from '@/types';

export interface UserContextType {
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
  updateWorkHours: (id: string, updates: Partial<WorkHoursRecord>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteOdometerRecord: (id: string) => Promise<void>;
  deleteWorkHours: (id: string) => Promise<void>;
  getMetrics: (period: string, customStartDate?: Date, customEndDate?: Date) => Metrics & { changes: Record<string, string> };
  getChartData: (period: string, customStartDate?: Date, customEndDate?: Date) => ChartData[];
  refreshData: () => Promise<void>;
}
