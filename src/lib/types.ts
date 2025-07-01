export interface Lancamento {
  id: string;
  user_id?: string;
  dataLancamento: string;
  horaInicial: string;
  horaFinal?: string;
  odometroInicial: number;
  odometroFinal?: number;
  quilometragemPercorrida?: number;
  status: "completo" | "pendente";
  observacoes?: string;
} 