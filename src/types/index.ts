
export interface User {
  id: string;
  name: string;
  email: string;
  registrationDate: Date;
}

export interface Transaction {
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
