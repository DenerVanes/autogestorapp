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

// Função utilitária para agrupar ciclos (pares inicial/final) por data
function agruparCiclos(records: OdometerRecord[], dateKey: string) {
  const doDia = records.filter(r => {
    const key = r.date.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 10);
    return key === dateKey;
  });
  doDia.sort((a, b) => a.date.getTime() - b.date.getTime());
  const ciclos: { inicial: OdometerRecord, final?: OdometerRecord, status: 'aberto' | 'fechado' }[] = [];
  let pendente: OdometerRecord | null = null;
  doDia.forEach(r => {
    if (r.type === 'inicial') {
      if (pendente) {
        ciclos.push({ inicial: pendente, status: 'aberto' });
      }
      pendente = r;
    } else if (r.type === 'final' && pendente) {
      ciclos.push({ inicial: pendente, final: r, status: 'fechado' });
      pendente = null;
    }
  });
  if (pendente) ciclos.push({ inicial: pendente, status: 'aberto' });
  return ciclos;
}

// Novo agrupamento por pair_id
function agruparPorPairId(records: OdometerRecordFull[]): {
  day: string;
  inicial?: OdometerRecordFull;
  final?: OdometerRecordFull;
  status: string;
  distancia?: number;
}[] {
  const pares: Record<string, { inicial?: OdometerRecordFull; final?: OdometerRecordFull }> = {};
  records.forEach(r => {
    const pair = r.pair_id || r.id; // fallback para id se não houver pair_id
    if (!pares[pair]) pares[pair] = {};
    if (r.type === 'inicial') pares[pair].inicial = r;
    if (r.type === 'final') pares[pair].final = r;
  });
  return Object.values(pares)
    .map(par => {
      const inicial = par.inicial;
      const final = par.final;
      const status = inicial && final ? 'fechado' : 'aberto';
      const distancia = inicial && final ? final.value - inicial.value : undefined;
      const day = inicial ? inicial.date.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 10) : (final ? final.date.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 10) : '');
      return { day, inicial, final, status, distancia };
    })
    .sort((a, b) => b.day.localeCompare(a.day));
}

// Agrupa por data Brasil e, dentro do dia, casa inicial/final por pair_id ou ordem
function agruparPorDiaECiclo(records: OdometerRecordFull[]): {
  day: string;
  inicial?: OdometerRecordFull;
  final?: OdometerRecordFull;
  status: string;
  distancia?: number;
}[] {
  // Agrupa por data Brasil
  const porDia: Record<string, OdometerRecordFull[]> = {};
  records.forEach(r => {
    const day = r.date.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 10);
    if (!porDia[day]) porDia[day] = [];
    porDia[day].push(r);
  });
  let result: any[] = [];
  Object.entries(porDia).forEach(([day, recs]) => {
    // Agrupa por pair_id se existir, senão por ordem
    const usados = new Set<string>();
    // 1. Tenta casar por pair_id
    const pares: { inicial?: OdometerRecordFull; final?: OdometerRecordFull }[] = [];
    recs.forEach(r => {
      if (r.type === 'inicial') {
        // Procura final com mesmo pair_id
        const final = recs.find(f => f.type === 'final' && f.pair_id && r.pair_id && f.pair_id === r.pair_id && !usados.has(f.id));
        if (final) {
          pares.push({ inicial: r, final });
          usados.add(r.id); usados.add(final.id);
        }
      }
    });
    // 2. Para os que não têm pair_id ou não casaram, casa por ordem
    const restantes = recs.filter(r => !usados.has(r.id)).sort((a, b) => a.date.getTime() - b.date.getTime());
    let i = 0;
    while (i < restantes.length) {
      if (restantes[i].type === 'inicial') {
        if (i + 1 < restantes.length && restantes[i + 1].type === 'final') {
          pares.push({ inicial: restantes[i], final: restantes[i + 1] });
          usados.add(restantes[i].id); usados.add(restantes[i + 1].id);
          i += 2;
        } else {
          // Só adiciona ciclo aberto se for o último registro do dia
          if (i === restantes.length - 1) {
            pares.push({ inicial: restantes[i] });
            usados.add(restantes[i].id);
          }
          i += 1;
        }
      } else if (restantes[i].type === 'final') {
        // Só adiciona final isolado se não houver inicial sobrando
        if (i === 0 || restantes[i - 1].type !== 'inicial') {
          pares.push({ final: restantes[i] });
          usados.add(restantes[i].id);
        }
        i += 1;
      } else {
        i += 1;
      }
    }
    // 3. Monta resultado: só mostra pares completos ou inicial sem final (ciclo aberto)
    pares.forEach(par => {
      const inicial = par.inicial;
      const final = par.final;
      // Só exibe linha se for par completo, ou ciclo aberto (inicial sem final e não há final isolado sobrando)
      if (inicial && final) {
        result.push({ day, inicial, final, status: 'fechado', distancia: final.value - inicial.value });
      } else if (inicial && !final) {
        result.push({ day, inicial, status: 'aberto' });
      }
      // Não exibe finais isolados
    });
  });
  // Ordena por data decrescente e, dentro do dia, por hora do inicial
  result = result.sort((a, b) => {
    if (a.day !== b.day) return b.day.localeCompare(a.day);
    if (a.inicial && b.inicial) return b.inicial.date.getTime() - a.inicial.date.getTime();
    if (a.final && b.final) return b.final.date.getTime() - a.final.date.getTime();
    return 0;
  });
  return result;
}

const OdometerHistoryTab = ({ onEdit, onDelete }: OdometerHistoryTabProps) => {
  const { odometerRecords } = useUser(); // agora OdometerRecordFull

  const viagens = agruparPorDiaECiclo(odometerRecords as OdometerRecordFull[]);

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
              <TableHead className="text-right">Distância</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {viagens.length > 0 ? viagens.filter(v => v.inicial && v.final).map((viagem, idx) => (
              <TableRow key={viagem.day + idx}>
                <TableCell>{viagem.day ? format(new Date(viagem.day + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR }) : '-'}</TableCell>
                <TableCell className="text-right">{viagem.distancia !== undefined ? `${viagem.distancia} km` : '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(viagem)} title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete([viagem.inicial?.id, viagem.final?.id].filter(Boolean))} title="Deletar">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  Nenhum ciclo completo encontrado.
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
