
import { supabase } from "@/integrations/supabase/client";

export const workHoursService = {
  // Work Hours
  async getWorkHours() {
    console.log('Getting work hours...');
    const { data, error } = await supabase
      .from('work_hours_records')
      .select('*')
      .order('start_date_time', { ascending: false });

    if (error) {
      console.error('Error getting work hours:', error);
      throw error;
    }

    console.log('Work hours loaded:', data?.length || 0);
    return data || [];
  },

  async createWorkHours(record: any) {
    console.log('Creating work hours:', record);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('work_hours_records')
      .insert([{
        user_id: user.id,
        ...record
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating work hours:', error);
      throw error;
    }

    console.log('Work hours created:', data);
    return data;
  },

  async updateWorkHours(id: string, updates: any) {
    console.log('Updating work hours:', id, updates);
    const { data, error } = await supabase
      .from('work_hours_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating work hours:', error);
      throw error;
    }

    console.log('Work hours updated:', data);
    return data;
  },

  async deleteWorkHours(id: string) {
    console.log('Deleting work hours:', id);
    const { error } = await supabase
      .from('work_hours_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting work hours:', error);
      throw error;
    }

    console.log('Work hours deleted:', id);
  }
};
