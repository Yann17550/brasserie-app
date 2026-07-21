import React from 'react';
import type { KegWithCurrentState } from './kegScanner.types';
import { getCurrentEtatLabel, getCurrentMovementLabel } from './kegScanner.utils';

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
  debugInfo,
}: Props) {
  return (
    <>
      {scanResult && (
        <div className="keg-scanner__scan-result">
          <p className="keg-scanner__scan-line">
            <strong>QR détecté :</strong> {scanResult}
          </p>

          {identifiedKeg && (
            <>
              <p className="keg-scanner__scan-line">
                <strong>Brasserie :</strong> {identifiedKeg.brewery_name}
              </p>
              <p className="keg-scanner__scan-line">
                <strong>Bière :</strong> {identifiedKeg.beer_type}
              </p>
              <p className="keg-scanner__scan-line">
                <strong>Capacité :</strong> {identifiedKeg.capacity_liters}L
              </p>
              <p className="keg-scanner__scan-line">
                <strong>Numéro de fût :</strong> {identifiedKeg.keg_number ?? 'Non renseigné'}
              </p>
              <p className="keg-scanner__scan-line">
                <strong>Statut actuel :</strong> {getCurrentMovementLabel(identifiedKeg.current_movement_type)}
              </p>
              <p className="keg-scanner__scan-line keg-scanner__scan-line--last">
                <strong>État actuel :</strong> {getCurrentEtatLabel(identifiedKeg.current_etat_fut)}
              </p>
            </>
          )}
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

      {debugInfo && (
        <div className="keg-scanner__message keg-scanner__message--debug">
          <strong>🔧 Info Diagnostic :</strong>
          <br />
          {debugInfo}
        </div>
      )}
    </>
  );
}