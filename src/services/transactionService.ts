
import { supabase } from "@/integrations/supabase/client";

export const transactionService = {
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
};
