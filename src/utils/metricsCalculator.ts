
import type { Transaction, WorkHoursRecord, Metrics, OdometerRecordFull } from "@/types";
import { Lancamento } from "@/lib/types";
import { calculateKmRodado } from "@/utils/kmCalculator";

/**
 * Calcula o total de horas trabalhadas a partir de um array de registros de horas.
 * @param workHours Array de registros de horas trabalhadas
 * @returns Total de horas em formato decimal (ex: 7.5 para 7h30min)
 */
export function calculateWorkHours(workHours: WorkHoursRecord[]): number {
  let totalMs = 0;
  workHours.forEach(record => {
    if (record.startDateTime && record.endDateTime) {
      const start = record.startDateTime instanceof Date ? record.startDateTime : new Date(record.startDateTime);
      const end = record.endDateTime instanceof Date ? record.endDateTime : new Date(record.endDateTime);
      totalMs += end.getTime() - start.getTime();
    }
  });
  // converter ms para horas decimais
  return +(totalMs / (1000 * 60 * 60)).toFixed(2);
}

/**
 * Calcula métricas financeiras a partir de transações, registros de odômetro e horas trabalhadas.
 */
export function calculateMetrics(
  transactions: Transaction[],
  odometerRecords: OdometerRecordFull[],
  workHours: WorkHoursRecord[],
  period?: string,
  customStartDate?: Date,
  customEndDate?: Date
): Metrics {
  const receita = transactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.value, 0);
  const despesa = transactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.value, 0);
  const saldo = receita - despesa;

  // Novo cálculo de KM rodado usando odometerRecords
  const kmRodado = calculateKmRodado(odometerRecords, period || 'este-mes', customStartDate, customEndDate);
  const valorPorKm = kmRodado > 0 ? receita / kmRodado : 0;

  let totalMs = 0;
  workHours.forEach(record => {
    if (record.startDateTime && record.endDateTime) {
      const start = record.startDateTime instanceof Date ? record.startDateTime : new Date(record.startDateTime);
      const end = record.endDateTime instanceof Date ? record.endDateTime : new Date(record.endDateTime);
      totalMs += end.getTime() - start.getTime();
    }
  });
  const horasTrabalhadas = +(totalMs / (1000 * 60 * 60)).toFixed(2);
  const valorPorHora = horasTrabalhadas > 0 ? receita / horasTrabalhadas : 0;

  return { receita, despesa, saldo, kmRodado, valorPorKm, horasTrabalhadas, valorPorHora };
}

export const getMetrics = calculateMetrics;
