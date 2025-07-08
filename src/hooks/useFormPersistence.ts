
import { useState, useEffect, useCallback } from 'react';

interface FormData {
  [key: string]: any;
}

export const useFormPersistence = <T extends FormData>(
  formId: string,
  initialData: T
) => {
  const [formData, setFormData] = useState<T>(initialData);

  // Carrega dados salvos no localStorage quando o componente monta
  useEffect(() => {
    const savedData = localStorage.getItem(`form_${formId}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Erro ao carregar dados do formulário:', error);
      }
    }
  }, [formId]);

  // Salva dados no localStorage sempre que formData muda
  useEffect(() => {
    if (formData !== initialData) {
      localStorage.setItem(`form_${formId}`, JSON.stringify(formData));
    }
  }, [formData, formId, initialData]);

  // Função para atualizar dados do formulário
  const updateFormData = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Função para limpar dados salvos após sucesso
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(`form_${formId}`);
    setFormData(initialData);
  }, [formId, initialData]);

  return {
    formData,
    updateFormData,
    clearSavedData
  };
};
