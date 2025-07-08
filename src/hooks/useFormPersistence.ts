
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
        // Mescla dados salvos com dados iniciais, priorizando dados salvos
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Erro ao carregar dados do formulário:', error);
      }
    }
  }, [formId]);

  // Salva dados no localStorage sempre que formData muda (mas não na inicialização)
  useEffect(() => {
    // Evita salvar na primeira renderização
    const timer = setTimeout(() => {
      // Só salva se há dados diferentes do inicial
      if (JSON.stringify(formData) !== JSON.stringify(initialData)) {
        localStorage.setItem(`form_${formId}`, JSON.stringify(formData));
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [formData, formId]);

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
