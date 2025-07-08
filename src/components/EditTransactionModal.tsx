
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { Transaction } from "@/types";
import { toast } from "sonner";
import { useFormPersistence } from "@/hooks/useFormPersistence";

interface EditTransactionModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose
}) => {
  const { addTransaction, updateTransaction } = useUser();
  const [loading, setLoading] = useState(false);

  // Dados iniciais do formulário
  const initialFormData = {
    type: transaction.type,
    value: transaction.value.toString(),
    date: transaction.date.toISOString().slice(0, 16),
    category: transaction.category,
    subcategory: transaction.subcategory || '',
    fuelType: transaction.fuelType || '',
    pricePerLiter: transaction.pricePerLiter?.toString() || '',
    observation: transaction.observation || ''
  };

  // Usar persistência de formulário apenas para transações novas
  const formId = transaction.id ? `edit_transaction_${transaction.id}` : 'new_transaction';
  const { formData, updateFormData, clearSavedData } = useFormPersistence(formId, initialFormData);

  // Resetar dados quando a transação muda (para edição) - SEM CAUSAR REFRESH
  useEffect(() => {
    if (isOpen && transaction.id) {
      // Para transações existentes, sempre usar os dados atuais (não persistir)
      updateFormData(initialFormData);
    }
  }, [transaction.id, isOpen]); // Dependências específicas

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.value || !formData.category) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);
      
      const transactionData = {
        type: formData.type as 'receita' | 'despesa',
        value: parseFloat(formData.value),
        date: new Date(formData.date),
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        fuelType: formData.fuelType || undefined,
        pricePerLiter: formData.pricePerLiter ? parseFloat(formData.pricePerLiter) : undefined,
        observation: formData.observation || undefined
      };

      if (transaction.id) {
        await updateTransaction(transaction.id, transactionData);
        toast.success("Transação atualizada com sucesso!");
      } else {
        await addTransaction(transactionData);
        toast.success("Transação criada com sucesso!");
      }
      
      // Limpar dados salvos e fechar modal SEMPRE após salvar com sucesso
      clearSavedData();
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error("Erro ao salvar transação");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Para transações em edição, não manter persistência
    if (transaction.id) {
      onClose();
    } else {
      // Para novas transações, manter os dados salvos (não limpar)
      onClose();
    }
  };

  const categoryOptions = {
    receita: ['Corrida', 'Gorjeta', 'Bônus', 'Outros'],
    despesa: ['Combustível', 'Manutenção', 'Multa', 'Estacionamento', 'Outros']
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {transaction.id ? 'Editar' : 'Nova'} {formData.type === 'receita' ? 'Receita' : 'Despesa'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.value}
              onChange={(e) => updateFormData({ value: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label>Data e Hora</Label>
            <Input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => updateFormData({ date: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label>Categoria</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => updateFormData({ category: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions[formData.type].map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.category === 'Combustível' && (
            <>
              <div>
                <Label>Tipo de Combustível</Label>
                <Select 
                  value={formData.fuelType} 
                  onValueChange={(value) => updateFormData({ fuelType: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o combustível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gasolina">Gasolina</SelectItem>
                    <SelectItem value="Etanol">Etanol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="GNV">GNV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Preço por Litro (R$)</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={formData.pricePerLiter}
                  onChange={(e) => updateFormData({ pricePerLiter: e.target.value })}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div>
            <Label>Observação</Label>
            <Textarea
              value={formData.observation}
              onChange={(e) => updateFormData({ observation: e.target.value })}
              placeholder="Observações adicionais..."
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionModal;
