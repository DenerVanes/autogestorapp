
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

    const recordToInsert = {
      user_id: user.id,
      date: record.date,
      type: record.type,
      value: record.value
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
    console.log('Deleting odometer record from database:', id);
    const { error } = await supabase
      .from('odometer_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting odometer record:', error);
      throw error;
    }

    console.log('Odometer record deleted from database:', id);
  },

  async deleteMultipleOdometerRecords(ids: string[]) {
    console.log('Deleting multiple odometer records from database:', ids);
    
    for (const id of ids) {
      if (id) {
        await this.deleteOdometerRecord(id);
      }
    }
    
    console.log('Multiple odometer records deleted from database');
  },
};
