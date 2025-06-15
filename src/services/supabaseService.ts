
import { supabase } from "@/integrations/supabase/client";

export const supabaseService = {
  // User Profile
  async getUserProfile(userId: string) {
    console.log('Getting user profile for:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }

    console.log('User profile found:', data);
    return data;
  },

  async updateUserProfile(userId: string, updates: any) {
    console.log('Updating user profile:', userId, updates);
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    console.log('User profile updated:', data);
    return data;
  },

  // Transactions
  async getTransactions() {
    console.log('Getting transactions...');
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }

    console.log('Transactions loaded:', data?.length || 0);
    return data || [];
  },

  async createTransaction(transaction: any) {
    console.log('Creating transaction:', transaction);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: user.id,
        ...transaction
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }

    console.log('Transaction created:', data);
    return {
      id: data.id,
      type: data.type,
      date: data.date,
      value: data.value,
      category: data.category,
      fuelType: data.fuel_type,
      pricePerLiter: data.price_per_liter,
      subcategory: data.subcategory,
      observation: data.observation
    };
  },

  async updateTransaction(id: string, updates: any) {
    console.log('Updating transaction:', id, updates);
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }

    console.log('Transaction updated:', data);
    return data;
  },

  async deleteTransaction(id: string) {
    console.log('Deleting transaction:', id);
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }

    console.log('Transaction deleted:', id);
  },

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

    const { data, error } = await supabase
      .from('odometer_records')
      .insert([{
        user_id: user.id,
        ...record
      }])
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
