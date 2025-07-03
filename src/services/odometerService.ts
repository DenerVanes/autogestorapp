
import { supabase } from "@/integrations/supabase/client";

export const odometerService = {
  // Odometer Records
  async getOdometerRecords() {
    console.log('Getting odometer records...');
    const { data, error } = await supabase
      .from('odometer_records')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error getting odometer records:', error);
      throw error;
    }

    console.log('Odometer records loaded:', data?.length || 0);
    return data || [];
  },

  async createOdometerRecord(record: any) {
    console.log('Creating odometer record:', record);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Se é um registro inicial, gera um novo pair_id
    let pair_id = record.pair_id;
    if (record.type === 'inicial' && !pair_id) {
      pair_id = crypto.randomUUID();
      console.log('Gerando novo pair_id para registro inicial:', pair_id);
    }

    const recordToInsert = {
      user_id: user.id,
      date: record.date,
      type: record.type,
      value: record.value,
      pair_id: pair_id
    };

    console.log('Inserindo registro:', recordToInsert);

    const { data, error } = await supabase
      .from('odometer_records')
      .insert([recordToInsert])
      .select()
      .single();

    if (error) {
      console.error('Error creating odometer record:', error);
      throw error;
    }

    console.log('Odometer record created:', data);
    return data;
  },

  async updateOdometerRecord(id: string, updates: any) {
    console.log('Updating odometer record:', id, updates);
    const { data, error } = await supabase
      .from('odometer_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating odometer record:', error);
      throw error;
    }

    console.log('Odometer record updated:', data);
    return data;
  },

  async deleteOdometerRecord(id: string) {
    console.log('Deleting odometer record:', id);
    const { error } = await supabase
      .from('odometer_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting odometer record:', error);
      throw error;
    }

    console.log('Odometer record deleted:', id);
  },
};
