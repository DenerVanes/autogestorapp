
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation, Edit2, Trash2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OdometerRecord, OdometerRecordFull } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Tipo para viagem agrupada
interface Viagem {
  day: string;
  inicial?: OdometerRecordFull;
  final?: OdometerRecordFull;
  status: string;
  distancia?: number;
}

interface OdometerHistoryTabProps {
  onEdit: (viagem: Viagem) => void;
  onDelete: (ids: string[]) => void;
}

// Função para converter data UTC para horário do Brasil
function convertToBrazilTime(date: Date | string): Date {
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  // Adiciona 3 horas para converter de UTC para horário do Brasil
  const brazilTime = new Date(utcDate.getTime() + (3 * 60 * 60 * 1000));
  return brazilTime;
}

// Função para agrupar por pair_id com tratamento de fuso horário
function agruparPorPairId(records: OdometerRecordFull[]): Viagem[] {
  console.log('=== AGRUPANDO HISTÓRICO POR PAIR_ID ===');
  console.log('Total de registros recebidos:', records.length);
  
  // Log detalhado dos registros
  records.forEach((record, index) => {
    const brazilDate = convertToBrazilTime(record.date);
    console.log(`Registro histórico ${index + 1}:`, {
      id: record.id,
      type: record.type,
      value: record.value,
      pair_id: record.pair_id,
      date_utc: record.date,
      date_brazil: format(brazilDate, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })
    });
  });
  
  const pares: Record<string, { inicial?: OdometerRecordFull; final?: OdometerRecordFull }> = {};
  
  records.forEach(r => {
    const pair = r.pair_id || r.id; // fallback para id se não houver pair_id
    console.log(`Processando registro histórico ${r.id}, type: ${r.type}, pair_id: ${pair}`);
    
    if (!pares[pair]) pares[pair] = {};
    if (r.type === 'inicial') pares[pair].inicial = r;
    if (r.type === 'final') pares[pair].final = r;
  });
  
  const viagens = Object.entries(pares)
    .map(([pairId, par]) => {
      const inicial = par.inicial;
      const final = par.final;
      const status = inicial && final ? 'fechado' : 'aberto';
      const distancia = inicial && final ? final.value - inicial.value : undefined;
      
      // Usa a data do registro inicial convertida para horário do Brasil
      let day = '';
      if (inicial) {
        const brazilDate = convertToBrazilTime(inicial.date);
        day = format(brazilDate, 'yyyy-MM-dd');
      } else if (final) {
        const brazilDate = convertToBrazilTime(final.date);
        day = format(brazilDate, 'yyyy-MM-dd');
      }
      
      const viagem = { day, inicial, final, status, distancia };
      
      if (inicial && final) {
        console.log(`Viagem completa criada - Pair ID: ${pairId}, Data: ${day}, Distância: ${distancia}km (${inicial.value} -> ${final.value})`);
      } else {
        console.log(`Viagem incompleta - Pair ID: ${pairId}, Status: ${status}`);
      }
      
      return viagem;
    })
    .filter(v => v.inicial && v.final) // Só mostra ciclos completos no histórico
    .sort((a, b) => b.day.localeCompare(a.day)); // Ordena por data mais recente primeiro
  
  console.log('=== RESULTADO DO AGRUPAMENTO HISTÓRICO ===');
  console.log(`Total de viagens completas: ${viagens.length}`);
  
  viagens.forEach((v, index) => {
    console.log(`Viagem ${index + 1}: ${v.day} - ${v.inicial?.value} -> ${v.final?.value} = ${v.distancia}km`);
  });
  
  return viagens;
}

const OdometerHistoryTab = ({ onEdit, onDelete }: OdometerHistoryTabProps) => {
  const { odometerRecords } = useUser();

  console.log('=== RENDERIZANDO HISTÓRICO DE ODÔMETRO ===');
  console.log('Total de registros disponíveis:', odometerRecords.length);

  const viagens = agruparPorPairId(odometerRecords as OdometerRecordFull[]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          <span>Histórico de Viagens</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Inicial</TableHead>
              <TableHead>Final</TableHead>
              <TableHead className="text-right">Distância</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {viagens.length > 0 ? viagens.map((viagem, idx) => (
              <TableRow key={viagem.day + idx}>
                <TableCell>
                  {viagem.day ? format(new Date(viagem.day + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                </TableCell>
                <TableCell>
                  {viagem.inicial ? `${viagem.inicial.value.toLocaleString()} km` : '-'}
                </TableCell>
                <TableCell>
                  {viagem.final ? `${viagem.final.value.toLocaleString()} km` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {viagem.distancia !== undefined ? `${viagem.distancia} km` : '-'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(viagem)} title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => onDelete([viagem.inicial?.id, viagem.final?.id].filter(Boolean))} 
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum ciclo completo encontrado.
                  <br />
                  <span className="text-xs">
                    Total de registros: {odometerRecords.length}
                  </span>
                  <br />
                  <span className="text-xs text-gray-500">
                    Verifique se há registros iniciais e finais com o mesmo pair_id
                  </span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default OdometerHistoryTab;
