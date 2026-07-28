import React from 'react';
import type { KegWithCurrentState } from './kegScanner.types';
import { getCurrentEtatLabel } from './kegScanner.utils';

type Props = {
  scanResult: string | null;
  identifiedKeg: KegWithCurrentState | null;
  statusMessage: string | null;
  errorMessage: string | null;
  debugInfo: string | null;
};

export function KegScannerStatus({
  scanResult,
  identifiedKeg,
  statusMessage,
  errorMessage,
}: Props) {
  return (
    <>
      {scanResult && (
        <div className="keg-scanner__result-card">
          <div className="keg-scanner__result-header">
            <h3 className="keg-scanner__result-title">Résultat du scan</h3>
          </div>

          <div className="keg-scanner__result-list">
            <p className="keg-scanner__result-line">
              <span className="keg-scanner__result-label">QR détecté :</span>
              <span className="keg-scanner__result-value">{scanResult}</span>
            </p>

            {identifiedKeg && (
              <>
                <p className="keg-scanner__result-line">
                  <span className="keg-scanner__result-label">Brasserie :</span>
                  <span className="keg-scanner__result-value">
                    {identifiedKeg.brewery_name}
                  </span>
                </p>

                <p className="keg-scanner__result-line">
                  <span className="keg-scanner__result-label">Bière :</span>
                  <span className="keg-scanner__result-value">
                    {identifiedKeg.beer_type}
                  </span>
                </p>

                <p className="keg-scanner__result-line">
                  <span className="keg-scanner__result-label">Capacité :</span>
                  <span className="keg-scanner__result-value">
                    {identifiedKeg.capacity_liters} L
                  </span>
                </p>

                <p className="keg-scanner__result-line">
                  <span className="keg-scanner__result-label">Numéro de fût :</span>
                  <span className="keg-scanner__result-value">
                    {identifiedKeg.keg_number ?? 'Non renseigné'}
                  </span>
                </p>

                <p className="keg-scanner__result-line">
                  <span className="keg-scanner__result-label">État actuel :</span>
                  <span className="keg-scanner__result-value">
                    {getCurrentEtatLabel(identifiedKeg.current_etat_fut)}
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="keg-scanner__message keg-scanner__message--status">
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="keg-scanner__message keg-scanner__message--error">
          {errorMessage}
        </div>
      )}
    </>
  );
}