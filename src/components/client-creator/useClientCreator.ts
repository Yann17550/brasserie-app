import { useCallback, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

interface ClientInsertPayload {
  name: string;
}

export function useClientCreator() {
  const [clientName, setClientName] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetMessages = useCallback(() => {
    setStatusMessage(null);
    setErrorMessage(null);
    setDebugInfo(null);
  }, []);

  const resetForm = useCallback(() => {
    setClientName('');
    setIsLoading(false);
    resetMessages();
  }, [resetMessages]);

  const handleCreateClient = useCallback(async () => {
    if (isLoading) return;

    resetMessages();

    const cleanedClientName = clientName.trim();

    if (!cleanedClientName) {
      setErrorMessage('Le nom du client est obligatoire.');
      return;
    }

    setIsLoading(true);

    const payload: ClientInsertPayload = {
      name: cleanedClientName,
    };

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          setErrorMessage('Création impossible : ce client existe déjà.');
          setDebugInfo(`Code SQL : ${error.code} | ${error.message}`);
        } else {
          setErrorMessage("Erreur technique lors de la création du client.");
          setDebugInfo(`Code : ${error.code ?? 'N/A'} | ${error.message}`);
        }

        setIsLoading(false);
        return;
      }

      setStatusMessage(`Client créé avec succès : ${data.name}.`);
      setClientName('');
      setIsLoading(false);
    } catch (error: any) {
      setErrorMessage(error.message || 'Une erreur inattendue est survenue.');
      setIsLoading(false);
    }
  }, [clientName, isLoading, resetMessages]);

  return {
    clientName,
    setClientName,
    statusMessage,
    errorMessage,
    debugInfo,
    isLoading,
    resetForm,
    handleCreateClient,
  };
}