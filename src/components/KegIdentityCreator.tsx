// src/components/KegIdentityCreator.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../services/supabaseClient';
import './KegIdentityCreator.css';

interface KegInsertPayload {
  qr_code_token: string;
  capacity_liters: number;
  beer_type: string;
  brewery_name: string;
  keg_number: string;
}

export const KegIdentityCreator: React.FC = () => {
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [extractedToken, setExtractedToken] = useState<string | null>(null);
  const [kegNumber, setKegNumber] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScannerReady, setIsScannerReady] = useState<boolean>(true);

  const isProcessingRef = useRef<boolean>(false);

  // Valeurs métier confirmées
  const breweryName = 'Br. Île & Elle';
  const capacityLiters = 20;
  const beerType = 'Blonde';

  const resetMessages = () => {
    setStatusMessage(null);
    setErrorMessage(null);
    setDebugInfo(null);
  };

  const resetFormForNextCreation = () => {
    setScannedUrl(null);
    setExtractedToken(null);
    setKegNumber('');
    setStatusMessage(null);
    setErrorMessage(null);
    setDebugInfo(null);
    setIsScannerReady(true);
  };

  const handleCreateKeg = useCallback(async () => {
    resetMessages();

    if (!scannedUrl) {
      setErrorMessage("Aucun QR code n'a été scanné.");
      return;
    }

    const cleanedScannedUrl = scannedUrl.trim();

    if (!cleanedScannedUrl) {
      setErrorMessage("Le contenu du QR code scanné est vide.");
      return;
    }

    const cleanedKegNumber = kegNumber.trim();

    if (!cleanedKegNumber) {
      setErrorMessage("Le numéro de fût est obligatoire.");
      return;
    }

    setIsLoading(true);
    setStatusMessage("Création de l'identité du fût en cours...");

    const payload: KegInsertPayload = {
      qr_code_token: cleanedScannedUrl,
      capacity_liters: capacityLiters,
      beer_type: beerType,
      brewery_name: breweryName,
      keg_number: cleanedKegNumber,
    };

    try {
      // Règle métier validée :
      // on crée uniquement l'identité du fût dans `kegs`.
      // Aucun mouvement n'est créé ici, car `keg_movements`
      // reste l'unique source de vérité pour les états et changements métier.
      const { data, error } = await supabase
        .from('kegs')
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          setErrorMessage("Création impossible : ce QR code ou ce numéro de fût existe déjà.");
          setDebugInfo(`Code SQL : ${error.code} | ${error.message}`);
          return;
        }

        setErrorMessage("Erreur technique lors de la création du fût.");
        setDebugInfo(`Code : ${error.code ?? 'N/A'} | ${error.message}`);
        return;
      }

      setStatusMessage(
        `Fût créé avec succès : ${data.beer_type} ${data.capacity_liters}L, n° ${data.keg_number}.`
      );
      setExtractedToken(cleanedScannedUrl);
    } catch (error: any) {
      setErrorMessage(error.message || "Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  }, [kegNumber, scannedUrl]);

  useEffect(() => {
    if (!isScannerReady || scannedUrl) {
      return;
    }

    const scanner = new Html5QrcodeScanner(
      'keg-identity-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    );

    const onScanSuccess = async (decodedText: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
        await scanner.clear();

        const trimmedText = decodedText.trim();

        setScannedUrl(trimmedText);
        setExtractedToken(trimmedText);
        resetMessages();

        if (!trimmedText) {
          setErrorMessage('QR code détecté, mais son contenu est vide.');
          return;
        }

        setStatusMessage("QR code reconnu. Vérifie le numéro de fût puis valide la création.");
      } catch (err: any) {
        setErrorMessage("Erreur lors de l'arrêt du scanner après lecture.");
        setDebugInfo(err?.message || String(err));
      } finally {
        isProcessingRef.current = false;
      }
    };

    const onScanFailure = (error: any) => {
      console.warn(`Scan en cours... ${error}`);
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch((err) => {
        console.error('Erreur lors du nettoyage du scanner', err);
      });
    };
  }, [isScannerReady, scannedUrl]);

  return (
    <div className="keg-identity-creator">
      <h2 className="keg-identity-creator__title">Créer une identité de fût</h2>

      <div className="keg-identity-creator__info-box">
        <p className="keg-identity-creator__info-text">
          Cette interface sert uniquement à créer la fiche de référence d'un nouveau fût dans
          <strong> kegs</strong>. Aucun mouvement de stock n'est créé ici.
        </p>
      </div>

      {!scannedUrl && (
        <div className="keg-identity-creator__scanner-wrapper">
          <div id="keg-identity-reader" className="keg-identity-creator__scanner"></div>
        </div>
      )}

      {scannedUrl && (
        <div className="keg-identity-creator__scan-result">
          <p className="keg-identity-creator__scan-line">
            <strong>QR code détecté :</strong> {scannedUrl}
          </p>

          <p className="keg-identity-creator__scan-line keg-identity-creator__scan-line--last">
            <strong>Valeur enregistrée :</strong> {extractedToken ?? 'Valeur indisponible'}
          </p>
        </div>
      )}

      <div className="keg-identity-creator__form-card">
        <div className="keg-identity-creator__field">
          <label className="keg-identity-creator__label">Brasserie</label>
          <input
            type="text"
            value={breweryName}
            readOnly
            className="keg-identity-creator__input keg-identity-creator__input--readonly"
          />
        </div>

        <div className="keg-identity-creator__field">
          <label className="keg-identity-creator__label">Capacité (litres)</label>
          <input
            type="number"
            value={capacityLiters}
            readOnly
            className="keg-identity-creator__input keg-identity-creator__input--readonly"
          />
        </div>

        <div className="keg-identity-creator__field">
          <label className="keg-identity-creator__label">Type de bière</label>
          <input
            type="text"
            value={beerType}
            readOnly
            className="keg-identity-creator__input keg-identity-creator__input--readonly"
          />
        </div>

        <div className="keg-identity-creator__field keg-identity-creator__field--last">
          <label htmlFor="keg-number" className="keg-identity-creator__label">
            Numéro de fût
          </label>
          <input
            id="keg-number"
            type="text"
            value={kegNumber}
            onChange={(event) => setKegNumber(event.target.value)}
            placeholder="Exemple : FUT-001"
            disabled={!scannedUrl || isLoading}
            className={`keg-identity-creator__input ${
              !scannedUrl ? 'keg-identity-creator__input--readonly' : ''
            }`}
          />
        </div>
      </div>

      {statusMessage && (
        <div className="keg-identity-creator__message keg-identity-creator__message--status">
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="keg-identity-creator__message keg-identity-creator__message--error">
          {errorMessage}
        </div>
      )}

      {debugInfo && (
        <div className="keg-identity-creator__message keg-identity-creator__message--debug">
          <strong>🔧 Info Diagnostic :</strong>
          <br />
          {debugInfo}
        </div>
      )}

      <div className="keg-identity-creator__actions">
        <button
          onClick={handleCreateKeg}
          disabled={!scannedUrl || isLoading}
          className={`keg-identity-creator__button keg-identity-creator__button--primary ${
            !scannedUrl || isLoading
              ? 'keg-identity-creator__button--disabled'
              : ''
          }`}
        >
          {isLoading ? 'Création en cours...' : "Créer l'identité du fût"}
        </button>

        <button
          onClick={resetFormForNextCreation}
          disabled={isLoading}
          className={`keg-identity-creator__button keg-identity-creator__button--secondary ${
            isLoading ? 'keg-identity-creator__button--disabled' : ''
          }`}
        >
          Scanner un autre QR code
        </button>
      </div>
    </div>
  );
};