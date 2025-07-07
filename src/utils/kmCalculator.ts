
import type { OdometerRecord, OdometerRecordFull } from "@/types";
import { agruparCiclosPorPairId } from "./cycleGroupingUtils";
import { filterOdometerByPeriod } from "./filteringUtils";
import { getBrazilDateString } from "./timezoneUtils";

/**
 * Calculates total kilometers driven based on complete odometer cycles
 * @param odometerRecords - Array of odometer records
 * @param period - Period to filter by
 * @param customStartDate - Custom start date for 'personalizado' period
 * @param customEndDate - Custom end date for 'personalizado' period
 * @returns Total kilometers driven
 */
export const calculateKmRodado = (
  odometerRecords: OdometerRecordFull[], 
  period: string, 
  customStartDate?: Date, 
  customEndDate?: Date
): number => {
  console.log('=== INÍCIO CÁLCULO KM RODADO ===');
  console.log('Parâmetros:', { period, totalRecords: odometerRecords.length });
  
  if (!odometerRecords || odometerRecords.length === 0) {
    console.log('Nenhum registro de odômetro encontrado');
    return 0;
  }
  
  // Primeiro agrupa todos os ciclos por pair_id
  const ciclosCompletos = agruparCiclosPorPairId(odometerRecords);
  console.log('Ciclos completos encontrados:', ciclosCompletos.length);
  
  if (ciclosCompletos.length === 0) {
    console.log('Nenhum ciclo completo encontrado');
    return 0;
  }
  
  // Depois filtra os ciclos que estão no período solicitado
  // Para isso, vamos criar um array com apenas os registros iniciais dos ciclos completos
  const registrosIniciais = ciclosCompletos
    .map(ciclo => ciclo.inicial)
    .filter(inicial => inicial !== undefined) as OdometerRecordFull[];
  
  const registrosIniciaisNoPeriodo = filterOdometerByPeriod(registrosIniciais, period, customStartDate, customEndDate);
  
  // Agora pegamos apenas os ciclos cujo registro inicial está no período
  const ciclosNoPeriodo = ciclosCompletos.filter(ciclo => {
    if (!ciclo.inicial) return false;
    return registrosIniciaisNoPeriodo.some(inicial => inicial.id === ciclo.inicial?.id);
  });
  
  console.log(`Ciclos no período: ${ciclosNoPeriodo.length}`);
  
  // Calcula o total de KM
  let totalKm = 0;
  ciclosNoPeriodo.forEach((ciclo, index) => {
    if (ciclo.inicial && ciclo.final) {
      const distancia = ciclo.final.value - ciclo.inicial.value;
      if (distancia > 0) {
        totalKm += distancia;
        const dataInicial = getBrazilDateString(ciclo.inicial.date);
        console.log(`Ciclo ${index + 1} (${dataInicial}): ${ciclo.inicial.value} -> ${ciclo.final.value} = ${distancia}km`);
      } else {
        console.log(`Ciclo ${index + 1} ignorado - distância negativa ou zero: ${ciclo.inicial.value} -> ${ciclo.final.value} = ${distancia}km`);
      }
    }
  });
  
  console.log('=== RESULTADO FINAL ===');
  console.log('Total KM calculado:', totalKm);
  return totalKm;
};

/**
 * Calculates total kilometers for all complete cycles
 * @param odometerRecords - Array of odometer records
 * @returns Total kilometers driven across all cycles
 */
export const calculateKmForAllRecords = (odometerRecords: OdometerRecordFull[]): number => {
  console.log('=== CALCULANDO KM PARA TODOS OS REGISTROS ===');
  console.log('Total de registros:', odometerRecords.length);
  
  const ciclosCompletos = agruparCiclosPorPairId(odometerRecords);
  
  let totalKm = 0;
  ciclosCompletos.forEach((ciclo, index) => {
    if (ciclo.inicial && ciclo.final) {
      const distancia = ciclo.final.value - ciclo.inicial.value;
      if (distancia > 0) {
        totalKm += distancia;
        const dataInicial = getBrazilDateString(ciclo.inicial.date);
        console.log(`Ciclo ${index + 1} (${dataInicial}): ${ciclo.inicial.value} -> ${ciclo.final.value} = ${distancia}km`);
      }
    }
  });
  
  console.log('Total KM para todos os registros:', totalKm);
  return totalKm;
};
