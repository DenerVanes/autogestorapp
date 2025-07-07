
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { OdometerRecord } from "@/types";
import { convertToBrazilTime, getBrazilDateString } from "./timezoneUtils";

export interface CompleteCycle {
  inicial?: OdometerRecord;
  final?: OdometerRecord;
}

/**
 * Groups odometer records by pair_id to form complete cycles
 * @param records - Array of odometer records
 * @returns Array of complete cycles (with both inicial and final records)
 */
export function agruparCiclosPorPairId(records: OdometerRecord[]): CompleteCycle[] {
  console.log('=== AGRUPANDO CICLOS POR PAIR_ID ===');
  console.log('Total de registros recebidos:', records.length);
  
  // Log detalhado dos registros
  records.forEach((record, index) => {
    const brazilDate = convertToBrazilTime(record.date);
    console.log(`Registro ${index + 1}:`, {
      id: record.id,
      type: record.type,
      value: record.value,
      pair_id: record.pair_id,
      date_utc: record.date,
      date_brazil: format(brazilDate, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })
    });
  });
  
  const pares: Record<string, CompleteCycle> = {};
  
  records.forEach(record => {
    // Usa pair_id se existir, senão usa o próprio id como fallback
    const pairId = record.pair_id || record.id;
    console.log(`Processando registro ${record.id}, type: ${record.type}, pair_id: ${pairId}, value: ${record.value}`);
    
    if (!pares[pairId]) {
      pares[pairId] = {};
    }
    
    if (record.type === 'inicial') {
      pares[pairId].inicial = record;
      console.log(`Registro inicial adicionado para pair_id ${pairId}:`, record.value);
    } else if (record.type === 'final') {
      pares[pairId].final = record;
      console.log(`Registro final adicionado para pair_id ${pairId}:`, record.value);
    }
  });
  
  // Filtra apenas os pares que têm tanto inicial quanto final
  const ciclosCompletos = Object.entries(pares)
    .filter(([pairId, par]) => {
      const hasInitial = !!par.inicial;
      const hasFinal = !!par.final;
      const isComplete = hasInitial && hasFinal;
      
      console.log(`Pair ID ${pairId}: inicial=${hasInitial}, final=${hasFinal}, completo=${isComplete}`);
      
      if (isComplete && par.inicial && par.final) {
        const distancia = par.final.value - par.inicial.value;
        const dataInicial = getBrazilDateString(par.inicial.date);
        console.log(`Ciclo completo - Data: ${dataInicial}, Distância: ${distancia}km (${par.inicial.value} -> ${par.final.value})`);
      }
      
      return isComplete;
    })
    .map(([pairId, par]) => par);
  
  console.log(`=== RESULTADO DO AGRUPAMENTO ===`);
  console.log(`Total de pares criados: ${Object.keys(pares).length}`);
  console.log(`Ciclos completos encontrados: ${ciclosCompletos.length}`);
  
  return ciclosCompletos;
}
