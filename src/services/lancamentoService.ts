// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import { Lancamento } from '@/lib/types';
// Corrigido: Importação do tipo Database removida, pois não existe exportação chamada 'Database' em '@/types/database.types'
// type LancamentoRow = Database['public']['Tables']['lancamento']['Row'];

// Se precisar do tipo LancamentoRow, defina manualmente ou ajuste conforme a estrutura real do banco de dados.
// Exemplo de definição manual (ajuste conforme necessário):
type LancamentoRow = {
  id: string;
  user_id: string;
  dataLancamento: string;
  horaInicial: string;
  horaFinal?: string | null;
  odometroInicial: number;
  odometroFinal?: number | null;
  quilometragemPercorrida?: number | null;
  status: 'completo' | 'pendente';
  observacoes?: string | null;
};

// Função para converter de snake_case (Supabase) para camelCase (App)
const fromSupabase = (record: LancamentoRow): Lancamento => ({
  id: record.id,
  // A conversão de nomes (ex: user_id -> userId) não é mais necessária se os nomes forem iguais
  // mas mantemos a função para o caso de precisarmos de transformações de dados.
  dataLancamento: record.dataLancamento,
  horaInicial: record.horaInicial,
  horaFinal: record.horaFinal || undefined,
  odometroInicial: record.odometroInicial,
  odometroFinal: record.odometroFinal || undefined,
  quilometragemPercorrida: record.quilometragemPercorrida || undefined,
  status: record.status as 'completo' | 'pendente',
  observacoes: record.observacoes || undefined,
});

export const lancamentoService = {
  async getLancamentos(): Promise<Lancamento[]> {
    console.log('🚗 getLancamentos called');
    try {
      const { data, error } = await supabase.from('lancamento').select('*');
      if (error) {
        console.error('❌ Error fetching lancamentos:', error);
        throw new Error(error.message);
      }
      console.log('✅ Raw lancamentos data:', data);
      const result = data ? data.map(fromSupabase) : [];
      console.log('📋 Processed lancamentos:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in getLancamentos:', error);
      throw error;
    }
  },

  async createLancamento(lancamento: Omit<Lancamento, 'id' | 'status' | 'quilometragemPercorrida' | 'horaFinal' | 'odometroFinal' | 'observacoes'>, userId: string): Promise<Lancamento> {
    console.log('Service: createLancamento chamado com:', { lancamento, userId });
    const payload = {
      user_id: userId,
      dataLancamento: lancamento.dataLancamento,
      horaInicial: lancamento.horaInicial,
      odometroInicial: lancamento.odometroInicial,
      status: 'pendente',
    };
    console.log('Service: Enviando este payload para o Supabase:', payload);

    const { data, error } = await supabase
      .from('lancamento')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Service: Erro retornado pelo Supabase!', error);
      throw new Error(error.message);
    }
    
    console.log('Service: Sucesso! Dados retornados pelo Supabase:', data);
    return fromSupabase(data);
  },

  async updateLancamento(id: string, updates: Partial<Lancamento>): Promise<Lancamento> {
    console.log('🔄 updateLancamento called with:', { id, updates });
    try {
      const { data, error } = await supabase
        .from('lancamento')
        .update({
          horaFinal: updates.horaFinal,
          odometroFinal: updates.odometroFinal,
          quilometragemPercorrida: updates.quilometragemPercorrida,
          status: 'completo',
          observacoes: updates.observacoes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating lancamento:', error);
        throw new Error(error.message);
      }
      console.log('✅ Lancamento updated:', data);
      return fromSupabase(data);
    } catch (error) {
      console.error('❌ Error in updateLancamento:', error);
      throw error;
    }
  },

  async deleteLancamento(id: string): Promise<void> {
    console.log('🗑️ deleteLancamento called with id:', id);
    console.log('🔍 Current user context:', await supabase.auth.getUser());
    
    try {
      // Primeiro, vamos verificar se o registro existe
      const { data: existingRecord, error: selectError } = await supabase
        .from('lancamento')
        .select('*')
        .eq('id', id)
        .single();
      
      if (selectError) {
        console.error('❌ Error checking if record exists:', selectError);
        throw new Error(`Record not found or access denied: ${selectError.message}`);
      }
      
      console.log('✅ Record found, attempting to delete:', existingRecord);
      
      const { error } = await supabase.from('lancamento').delete().eq('id', id);
      if (error) {
        console.error('❌ Error deleting lancamento:', error);
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(error.message);
      }
      console.log('✅ Lancamento deleted successfully');
    } catch (error) {
      console.error('❌ Error in deleteLancamento:', error);
      throw error;
    }
  },
}; 