
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Transaction {
  id: string;
  type: 'receita' | 'despesa';
  date: Date;
  value: number;
  category: string;
  fuelType?: string;
  pricePerLiter?: number;
  subcategory?: string;
  observation?: string;
}

export interface OdometerRecord {
  id: string;
  date: Date;
  type: 'inicial' | 'final';
  value: number;
}

export interface WorkHoursRecord {
  id: string;
  startDateTime: Date;
  endDateTime: Date;
}

export interface WorkHoursSession {
  id: string;
  startDateTime?: Date;
  endDateTime?: Date;
  isActive: boolean;
}

export interface Metrics {
  receita: number;
  despesa: number;
  saldo: number;
  kmRodado: number;
  valorPorKm: number;
  horasTrabalhadas: number;
  valorPorHora: number;
}

export interface ChartData {
  date: string;
  receita: number;
  despesa: number;
}

// Supabase database types
export interface DatabaseTransaction {
  id: string;
  user_id: string;
  type: 'receita' | 'despesa';
  date: string;
  value: number;
  category: string;
  fuel_type?: string;
  price_per_liter?: number;
  subcategory?: string;
  observation?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseOdometerRecord {
  id: string;
  user_id: string;
  date: string;
  type: 'inicial' | 'final';
  value: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseWorkHours {
  id: string;
  user_id: string;
  start_date_time: string;
  end_date_time: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}
