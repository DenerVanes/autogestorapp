
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
