// src/components/ClientCreator.tsx
import React, { useCallback, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import './ClientCreator.css';

interface ClientInsertPayload {
  name: string;
}

export const ClientCreator: React.FC = () => {
  const [clientName, setClientName] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const resetMessages = () => {
    setStatusMessage(null);
    setErrorMessage(null);
    setDebugInfo(null);
  };

  const resetForm = () => {
    setClientName('');
    resetMessages();
  };

  const handleCreateClient = useCallback(async () => {
    resetMessages();

    const cleanedClientName = clientName.trim();

    if (!cleanedClientName) {
      setErrorMessage('Le nom du client est obligatoire.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Création du client en cours...');

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
          return;
        }

        setErrorMessage("Erreur technique lors de la création du client.");
        setDebugInfo(`Code : ${error.code ?? 'N/A'} | ${error.message}`);
        return;
      }

      setStatusMessage(`Client créé avec succès : ${data.name}.`);
      setClientName('');
    } catch (error: any) {
      setErrorMessage(error.message || 'Une erreur inattendue est survenue.');
    } finally {
      setIsLoading(false);
    }
  }, [clientName]);

  return (
    <div className="client-creator">
      <h2 className="client-creator__title">Créer un client</h2>

      <div className="client-creator__info-box">
        <p className="client-creator__info-text">
          Cette interface permet de créer un client dans le référentiel
          <strong> clients</strong>.
        </p>
      </div>

      <div className="client-creator__form-card">
        <div className="client-creator__field">
          <label htmlFor="client-name" className="client-creator__label">
            Nom du client
          </label>
          <input
            id="client-name"
            type="text"
            value={clientName}
            onChange={(event) => setClientName(event.target.value)}
            placeholder="Exemple : Café du Centre"
            disabled={isLoading}
            className="client-creator__input"
          />
        </div>
      </div>

      {statusMessage && (
        <div className="client-creator__message client-creator__message--status">
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="client-creator__message client-creator__message--error">
          {errorMessage}
        </div>
      )}

      {debugInfo && (
        <div className="client-creator__message client-creator__message--debug">
          <strong>🔧 Info Diagnostic :</strong>
          <br />
          {debugInfo}
        </div>
      )}

      <div className="client-creator__actions">
        <button
          onClick={handleCreateClient}
          disabled={isLoading}
          className={`client-creator__button client-creator__button--primary ${
            isLoading ? 'client-creator__button--disabled' : ''
          }`}
        >
          {isLoading ? 'Création en cours...' : 'Créer le client'}
        </button>

        <button
          onClick={resetForm}
          disabled={isLoading}
          className={`client-creator__button client-creator__button--secondary ${
            isLoading ? 'client-creator__button--disabled' : ''
          }`}
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
};