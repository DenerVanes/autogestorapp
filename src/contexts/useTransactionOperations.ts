
import { supabaseService } from '@/services/supabaseService';
import { Transaction } from '@/types';

export const useTransactionOperations = (
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>,
  authUserId: string | undefined
) => {
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!authUserId) throw new Error('User not authenticated');

    const newTransaction = await supabaseService.createTransaction({
      type: transaction.type,
      date: transaction.date.toISOString(),
      value: transaction.value,
      category: transaction.category,
      fuel_type: transaction.fuelType,
      price_per_liter: transaction.pricePerLiter,
      subcategory: transaction.subcategory,
      observation: transaction.observation
    });

    const transformedTransaction: Transaction = {
      id: newTransaction.id,
      type: newTransaction.type as 'receita' | 'despesa',
      date: new Date(newTransaction.date),
      value: Number(newTransaction.value),
      category: newTransaction.category,
      fuelType: newTransaction.fuelType,
      pricePerLiter: newTransaction.pricePerLiter ? Number(newTransaction.pricePerLiter) : undefined,
      subcategory: newTransaction.subcategory,
      observation: newTransaction.observation
    };

    setTransactions(prev => [transformedTransaction, ...prev]);
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!authUserId) throw new Error('User not authenticated');

    const updatedTransaction = await supabaseService.updateTransaction(id, {
      type: updates.type,
      date: updates.date?.toISOString(),
      value: updates.value,
      category: updates.category,
      fuel_type: updates.fuelType,
      price_per_liter: updates.pricePerLiter,
      subcategory: updates.subcategory,
      observation: updates.observation
    });

    setTransactions(prev => prev.map(t => 
      t.id === id 
        ? {
            id: updatedTransaction.id,
            type: updatedTransaction.type as 'receita' | 'despesa',
            date: new Date(updatedTransaction.date),
            value: Number(updatedTransaction.value),
            category: updatedTransaction.category,
            fuelType: updatedTransaction.fuel_type,
            pricePerLiter: updatedTransaction.price_per_liter ? Number(updatedTransaction.price_per_liter) : undefined,
            subcategory: updatedTransaction.subcategory,
            observation: updatedTransaction.observation
          }
        : t
    ));
  };

  const deleteTransaction = async (id: string) => {
    if (!authUserId) throw new Error('User not authenticated');

    await supabaseService.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return {
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
};
