import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Navigation, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { OdometerRecord } from "@/types";

interface EditOdometerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cicloParaEditar?: {
    inicial: OdometerRecord;
    final: OdometerRecord;
  };
}

// Função utilitária para agrupar ciclos (pares inicial/final) por data
function agruparCiclos(records: OdometerRecord[], dateKey: string) {
  // Filtra só do dia
  const doDia = records.filter(r => {
    const key = r.date.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 10);
    return key === dateKey;
  });
  // Ordena por data/hora
  doDia.sort((a, b) => a.date.getTime() - b.date.getTime());
  // Agrupa pares
  const ciclos: { inicial: OdometerRecord, final?: OdometerRecord, status: 'aberto' | 'fechado' }[] = [];
  let pendente: OdometerRecord | null = null;
  doDia.forEach(r => {
    if (r.type === 'inicial') {
      if (pendente) {
        // Se ficou um inicial sem final, considera ciclo aberto
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

const EditOdometerModal = ({ isOpen, onClose, cicloParaEditar }: EditOdometerModalProps) => {
  const { odometerRecords, addOdometerRecord, updateOdometerRecord } = useUser();
  const [data, setData] = useState<Date>(
    cicloParaEditar && cicloParaEditar.inicial.date
      ? (cicloParaEditar.inicial.date instanceof Date
          ? cicloParaEditar.inicial.date
          : new Date(cicloParaEditar.inicial.date))
      : new Date()
  );
  const [odometroInicial, setOdometroInicial] = useState("");
  const [odometroFinal, setOdometroFinal] = useState("");
  const [editingInicial, setEditingInicial] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showConfirmDate, setShowConfirmDate] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [cicloEditando, setCicloEditando] = useState<{ inicial: OdometerRecord; final: OdometerRecord } | null>(null);

  const getBRDateKey = (date: Date) => date.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 10);
  const todayKey = getBRDateKey(data);
  const ciclosDoDia = agruparCiclos(odometerRecords, todayKey);
  const cicloAberto = ciclosDoDia.find(c => c.status === 'aberto');

  useEffect(() => {
    setSuccessMsg("");
    setEditingInicial(false);
    setOdometroFinal("");
    setOdometroInicial("");
    setEditMode(!!cicloParaEditar);
    if (cicloParaEditar) {
      const inicialDate = cicloParaEditar.inicial.date instanceof Date ? cicloParaEditar.inicial.date : new Date(cicloParaEditar.inicial.date);
      setData(inicialDate);
      setOdometroInicial(cicloParaEditar.inicial.value.toString());
      setOdometroFinal(cicloParaEditar.final.value.toString());
    }
    if (cicloEditando) {
      const inicialDate = cicloEditando.inicial.date instanceof Date ? cicloEditando.inicial.date : new Date(cicloEditando.inicial.date);
      setData(inicialDate);
      setOdometroInicial(cicloEditando.inicial.value.toString());
      setOdometroFinal(cicloEditando.final.value.toString());
      setEditMode(true);
    }
  }, [isOpen, data, cicloParaEditar, cicloEditando]);

  // Validação para datas anteriores
  const isDataAnterior = () => {
    const hoje = new Date(new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 10));
    return data < hoje;
  };

  // Salvar inicial
  const handleSaveInicial = async () => {
    if (!odometroInicial) return;
    if (isDataAnterior() && !showConfirmDate) {
      setShowConfirmDate(true);
      return;
    }
    await addOdometerRecord({
      date: new Date(data.toISOString()),
      type: 'inicial',
      value: parseInt(odometroInicial)
    });
    setSuccessMsg("Inicial salvo! Para o correto cálculo do odômetro, registre o inicial, salve, e no final do expediente, registre o odômetro final.");
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 1200);
  };

  // Editar inicial
  const handleEditInicial = () => setEditingInicial(true);
  const handleUpdateInicial = async () => {
    if (!cicloAberto) return;
    await updateOdometerRecord(cicloAberto.inicial.id, { value: parseInt(odometroInicial) });
    setEditingInicial(false);
    setSuccessMsg("Inicial atualizado!");
  };

  // Salvar final
  const handleSaveFinal = async () => {
    if (!odometroFinal || !cicloAberto) return;
    const inicial = cicloAberto.inicial.value;
    const final = parseInt(odometroFinal);
    if (final <= inicial) {
      alert("O odômetro final deve ser maior que o inicial.");
      return;
    }
    if (final - inicial > 500) {
      if (!window.confirm("A diferença de km é muito alta. Tem certeza que deseja salvar?")) return;
    }
    await addOdometerRecord({
      date: data.toISOString(),
      type: 'final',
      value: final
    });
    setSuccessMsg("Final salvo! Distância registrada com sucesso.");
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 1200);
  };

  // Salvar edição de ciclo
  const handleSaveEdicaoCiclo = async () => {
    if (!cicloParaEditar) return;
    if (!odometroInicial || !odometroFinal) return;
    const inicial = parseInt(odometroInicial);
    const final = parseInt(odometroFinal);
    if (final <= inicial) {
      alert("O odômetro final deve ser maior que o inicial.");
      return;
    }
    if (final - inicial > 500) {
      if (!window.confirm("A diferença de km é muito alta. Tem certeza que deseja salvar?")) return;
    }
    await updateOdometerRecord(cicloParaEditar.inicial.id, { value: inicial });
    await updateOdometerRecord(cicloParaEditar.final.id, { value: final });
    setSuccessMsg("Ciclo atualizado!");
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 1200);
  };

  // Histórico do dia
  const historico = ciclosDoDia;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            <span>Registro de Odômetro</span>
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={e => e.preventDefault()}>
          {editMode && (cicloParaEditar || cicloEditando) ? (
            <>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input value={format(((cicloParaEditar?.inicial.date || cicloEditando?.inicial.date) instanceof Date ? (cicloParaEditar?.inicial.date || cicloEditando?.inicial.date) : new Date(cicloParaEditar?.inicial.date || cicloEditando?.inicial.date)), "dd/MM/yyyy", { locale: ptBR })} disabled />
              </div>
              <div className="space-y-2">
                <Label>Odômetro Inicial</Label>
                <Input
                  type="number"
                  value={odometroInicial}
                  onChange={e => setOdometroInicial(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Odômetro Final</Label>
                <Input
                  type="number"
                  value={odometroFinal}
                  onChange={e => setOdometroFinal(e.target.value)}
                />
                {odometroFinal && odometroInicial && (
                  <div className="text-sm text-blue-700 mt-1">
                    Quilometragem: {parseInt(odometroFinal) - parseInt(odometroInicial)} km
                  </div>
                )}
              </div>
              <Button className="w-full mt-2" onClick={async () => {
                if (cicloParaEditar) {
                  await handleSaveEdicaoCiclo();
                } else if (cicloEditando) {
                  // Salvar edição do ciclo do dia
                  if (!odometroInicial || !odometroFinal) return;
                  const inicial = parseInt(odometroInicial);
                  const final = parseInt(odometroFinal);
                  if (final <= inicial) {
                    alert("O odômetro final deve ser maior que o inicial.");
                    return;
                  }
                  if (final - inicial > 500) {
                    if (!window.confirm("A diferença de km é muito alta. Tem certeza que deseja salvar?")) return;
                  }
                  await updateOdometerRecord(cicloEditando.inicial.id, { value: inicial });
                  await updateOdometerRecord(cicloEditando.final.id, { value: final });
                  setSuccessMsg("Ciclo atualizado!");
                  setTimeout(() => {
                    setSuccessMsg("");
                    setEditMode(false);
                    setCicloEditando(null);
                  }, 1200);
                }
              }} type="button">
                Salvar Alterações
              </Button>
              <Button className="w-full mt-2" variant="outline" onClick={() => { setEditMode(false); setCicloEditando(null); }} type="button">
                Cancelar
              </Button>
              {successMsg && (
                <div className="text-center text-green-700 text-sm bg-green-50 rounded p-2 mt-2">
                  {successMsg}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Se existe ciclo aberto, só permite fechar */}
              {cicloAberto && !editingInicial ? (
                <>
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input value={format((cicloAberto.inicial.date instanceof Date ? cicloAberto.inicial.date : new Date(cicloAberto.inicial.date)), "dd/MM/yyyy", { locale: ptBR })} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Odômetro Inicial</Label>
                    <div className="flex items-center space-x-2">
                      <Input type="number" value={cicloAberto.inicial.value} disabled className="bg-gray-100" />
                      <Button variant="ghost" size="icon" onClick={handleEditInicial} type="button">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Odômetro Final</Label>
                    <Input
                      type="number"
                      placeholder="Digite a km final"
                      value={odometroFinal}
                      onChange={e => setOdometroFinal(e.target.value)}
                    />
                    {odometroFinal && (
                      <div className="text-sm text-blue-700 mt-1">
                        Quilometragem: {parseInt(odometroFinal) - cicloAberto.inicial.value} km
                      </div>
                    )}
                    <Button className="w-full mt-2" onClick={handleSaveFinal} type="button">
                      Salvar Final
                    </Button>
                  </div>
                  <div className="text-green-700 text-sm bg-green-50 rounded p-2">
                    Já existe um registro inicial em aberto. Agora registre o odômetro final.
                  </div>
                </>
              ) : editingInicial && cicloAberto ? (
                <>
                  <div className="space-y-2">
                    <Label>Editar Odômetro Inicial</Label>
                    <Input
                      type="number"
                      value={odometroInicial}
                      onChange={e => setOdometroInicial(e.target.value)}
                    />
                    <Button className="w-full mt-2" onClick={handleUpdateInicial} type="button">
                      Atualizar Inicial
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !data && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {data ? format(data, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={data}
                          onSelect={d => d && setData(d)}
                          initialFocus
                          locale={ptBR}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Odômetro Inicial (km)</Label>
                    <Input
                      type="number"
                      value={odometroInicial}
                      placeholder="Digite km inicial"
                      onChange={e => setOdometroInicial(e.target.value)}
                    />
                    <Button className="w-full mt-2" onClick={handleSaveInicial} type="button">
                      Salvar Odômetro
                    </Button>
                    {showConfirmDate && (
                      <div className="text-yellow-700 text-sm bg-yellow-50 rounded p-2 mt-2">
                        Você está registrando para uma data anterior. Tem certeza?
                        <Button size="sm" className="ml-2" onClick={() => { setShowConfirmDate(false); handleSaveInicial(); }}>Sim</Button>
                        <Button size="sm" variant="outline" className="ml-2" onClick={() => setShowConfirmDate(false)}>Cancelar</Button>
                      </div>
                    )}
                  </div>
                  <div className="text-blue-700 text-sm bg-blue-50 rounded p-2">
                    Para o correto cálculo do odômetro, registre o inicial, salve, e no final do expediente, registre o odômetro final.
                  </div>
                </>
              )}

              {/* Histórico do dia */}
              <div className="mt-6">
                <Label>Histórico do Dia</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {historico.length === 0 && (
                    <div className="text-muted-foreground text-sm">Nenhum ciclo registrado para este dia.</div>
                  )}
                  {historico.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm">
                      <div>
                        <span className="font-medium">{format(c.inicial.date, "HH:mm")}</span> - Início: <span className="font-semibold">{c.inicial.value} km</span>
                        {c.final && (
                          <>
                            , Fim: <span className="font-semibold">{c.final.value} km</span>
                            , Distância: <span className="font-semibold">{c.final.value - c.inicial.value} km</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("px-2 py-1 rounded text-xs", c.status === 'fechado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>{c.status}</span>
                        {c.status === 'fechado' && c.final && (
                          <Button size="icon" variant="ghost" onClick={() => { setCicloEditando({ inicial: c.inicial, final: c.final! }); }} title="Editar ciclo">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {successMsg && (
                <div className="text-center text-green-700 text-sm bg-green-50 rounded p-2 mt-2">
                  {successMsg}
                </div>
              )}
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOdometerModal;
