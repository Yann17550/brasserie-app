import React from 'react';
import type { Client } from '../../types/app';
import type { ScannerAction } from './kegScanner.types';
import { getActionLabel, requiresClient } from './kegScanner.utils';

type Props = {
  availableActions: ScannerAction[];
  clients: Client[];
  selectedAction: ScannerAction | '';
  selectedClientId: string;
  isLoading: boolean;
  onActionChange: (action: ScannerAction | '') => void;
  onClientChange: (clientId: string) => void;
  onSubmit: () => void;
};

export function KegScannerForm({
  availableActions,
  clients,
  selectedAction,
  selectedClientId,
  isLoading,
  onActionChange,
  onClientChange,
  onSubmit,
}: Props) {
  return (
    <div className="keg-scanner__form-card">
      <div className="keg-scanner__field">
        <label className="keg-scanner__label">Action</label>
        <select
          value={selectedAction}
          onChange={(event) => onActionChange(event.target.value as ScannerAction | '')}
          disabled={isLoading}
          className="keg-scanner__input"
          translate="no"
        >
          <option value="">Sélectionner une action</option>
          {availableActions.map((action) => (
            <option key={action} value={action}>
              {getActionLabel(action)}
            </option>
          ))}
        </select>
      </div>

      {requiresClient(selectedAction) && (
        <div className="keg-scanner__field">
          <label className="keg-scanner__label">Client</label>
          <select
            value={selectedClientId}
            onChange={(event) => onClientChange(event.target.value)}
            disabled={isLoading}
            className="keg-scanner__input"
          >
            <option value="">Sélectionner un client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          <p className="keg-scanner__hint">
            Pour une sortie, l'état du fût est automatiquement enregistré à "plein".
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!selectedAction || isLoading}
        className={`keg-scanner__button keg-scanner__button--primary ${
          !selectedAction || isLoading ? 'keg-scanner__button--disabled' : ''
        }`}
        translate="no"
      >
        Enregistrer le mouvement
      </button>
    </div>
  );
}