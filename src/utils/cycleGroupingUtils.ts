
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { OdometerRecord, OdometerRecordFull } from "@/types";
import { convertToBrazilTime, getBrazilDateString } from "./timezoneUtils";

export interface CompleteCycle {
  inicial?: OdometerRecordFull;
  final?: OdometerRecordFull;
}

/**
 * Groups odometer records by pair_id to form complete cycles
 * @param records - Array of odometer records
 * @returns Array of complete cycles (with both inicial and final records)
 */
export function agruparCiclosPorPairId(records: OdometerRecordFull[]): CompleteCycle[] {
  
  const pares: Record<string, CompleteCycle> = {};
  
  records.forEach(record => {
    // Usa pair_id se existir, senão usa o próprio id como fallback
    const pairId = record.pair_id || record.id;
    
    if (!pares[pairId]) {
      pares[pairId] = {};
    }
    
    if (record.type === 'inicial') {
      pares[pairId].inicial = record;
    } else if (record.type === 'final') {
      pares[pairId].final = record;
    }
  });
  
  // Filtra apenas os pares que têm tanto inicial quanto final
  const ciclosCompletos = Object.entries(pares)
    .filter(([pairId, par]) => {
      const hasInitial = !!par.inicial;
      const hasFinal = !!par.final;
      const isComplete = hasInitial && hasFinal;
      
      if (isComplete && par.inicial && par.final) {
        const distancia = par.final.value - par.inicial.value;
        const dataInicial = getBrazilDateString(par.inicial.date);
      }
      
      return isComplete;
    })
    .map(([pairId, par]) => par);
  
  return ciclosCompletos;
}
