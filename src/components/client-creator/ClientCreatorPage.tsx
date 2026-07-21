import React from 'react';
import { useClientCreator } from './useClientCreator';

export default function ClientCreatorPage() {
  const {
    clientName,
    setClientName,
    statusMessage,
    errorMessage,
    debugInfo,
    isLoading,
    resetForm,
    handleCreateClient,
  } = useClientCreator();

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
          type="button"
          onClick={handleCreateClient}
          disabled={isLoading}
          className="client-creator__button client-creator__button--primary"
        >
          {isLoading ? 'Création en cours...' : 'Créer le client'}
        </button>

        <button
          type="button"
          onClick={resetForm}
          className="client-creator__button client-creator__button--secondary"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}