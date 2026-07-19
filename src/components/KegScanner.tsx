// src/components/KegScanner.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../services/supabaseClient';
import type { Client, EtatFut, Keg, MovementType } from '../types/app';
import './KegScanner.css';

interface KegScannerProps {
  userId: string;
}

export const KegScanner: React.FC<KegScannerProps> = ({ userId }) => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [identifiedKeg, setIdentifiedKeg] = useState<Keg | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedMovementType, setSelectedMovementType] = useState<MovementType | ''>('');
  const [selectedEtatFut, setSelectedEtatFut] = useState<EtatFut | ''>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isProcessingRef = useRef<boolean>(false);

  const normalizeUrl = (url: string): string => {
    return url
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');
  };

  const resetMessages = () => {
    setStatusMessage(null);
    setErrorMessage(null);
    setDebugInfo(null);
  };

  const resetFormState = () => {
    setScanResult(null);
    setIdentifiedKeg(null);
    setSelectedMovementType('');
    setSelectedEtatFut('');
    setSelectedClientId('');
    setStatusMessage(null);
    setErrorMessage(null);
    setDebugInfo(null);
  };

  const loadClients = useCallback(async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      setErrorMessage("Erreur lors du chargement de la liste des clients.");
      setDebugInfo(`Code : ${error.code ?? 'N/A'} | ${error.message}`);
      return;
    }

    setClients(data ?? []);
  }, []);

  const findKegByScannedValue = useCallback(async (decodedText: string) => {
    setIsLoading(true);
    resetMessages();
    setStatusMessage('Recherche du fût correspondant au QR code...');

    const scannedValueClean = decodedText.trim();
    const normalizedScanned = normalizeUrl(scannedValueClean);

    try {
      const { data: kegs, error: fetchError } = await supabase
        .from('kegs')
        .select('id, qr_code_token, capacity_liters, beer_type, updated_at, brewery_name, keg_number');

      if (fetchError) {
        setErrorMessage("Erreur technique lors de la récupération des fûts.");
        setDebugInfo(`Code : ${fetchError.code ?? 'N/A'} | ${fetchError.message}`);
        return;
      }

      const matchedKeg =
        kegs?.find((keg) => normalizeUrl(keg.qr_code_token) === normalizedScanned) ?? null;

      if (!matchedKeg) {
        setErrorMessage("Fût introuvable dans la base de données.");
        setDebugInfo(`Valeur scannée normalisée : "${normalizedScanned}"`);
        return;
      }

      setScanResult(scannedValueClean);
      setIdentifiedKeg(matchedKeg);
      setStatusMessage(
        `Fût identifié : ${matchedKeg.beer_type} ${matchedKeg.capacity_liters}L${matchedKeg.keg_number ? `, n° ${matchedKeg.keg_number}` : ''}.`
      );
      setDebugInfo('Fût trouvé avec succès par correspondance d’URL normalisée.');
    } catch (error: any) {
      setErrorMessage(error.message || 'Une erreur technique est survenue.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmitMovement = useCallback(async () => {
    resetMessages();

    if (!identifiedKeg) {
      setErrorMessage("Aucun fût identifié. Merci de scanner un fût avant d'enregistrer un mouvement.");
      return;
    }

    if (!selectedMovementType) {
      setErrorMessage('Le type de mouvement est obligatoire.');
      return;
    }

    if (selectedMovementType === 'en stock' && !selectedEtatFut) {
      setErrorMessage("L'état du fût est obligatoire pour un retour en stock.");
      return;
    }

    if (selectedMovementType === 'En clientèle' && !selectedClientId) {
      setErrorMessage('Le client est obligatoire pour un mouvement en clientèle.');
      return;
    }

    const etatFutToInsert: EtatFut =
      selectedMovementType === 'En clientèle' ? 'plein' : (selectedEtatFut as EtatFut);

    const clientIdToInsert: string | null =
      selectedMovementType === 'En clientèle' ? selectedClientId : null;

    setIsLoading(true);
    setStatusMessage('Enregistrement du mouvement en cours...');

    try {
      const { error: insertError } = await supabase
        .from('keg_movements')
        .insert([
          {
            keg_id: identifiedKeg.id,
            user_id: userId,
            movement_type: selectedMovementType,
            etat_fut: etatFutToInsert,
            client_id: clientIdToInsert,
            notes: null,
          },
        ]);

      if (insertError) {
        setErrorMessage("Erreur lors de l'enregistrement du mouvement.");
        setDebugInfo(`Code : ${insertError.code ?? 'N/A'} | ${insertError.message}`);
        return;
      }

      setStatusMessage('Succès ! Le mouvement du fût a été enregistré.');
      setDebugInfo(
        `Mouvement enregistré : type="${selectedMovementType}", etat_fut="${etatFutToInsert}", client_id="${clientIdToInsert ?? 'null'}".`
      );
    } catch (error: any) {
      setErrorMessage(error.message || "Une erreur technique est survenue lors de l'insertion.");
    } finally {
      setIsLoading(false);
    }
  }, [identifiedKeg, selectedClientId, selectedEtatFut, selectedMovementType, userId]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    if (scanResult) {
      return;
    }

    const scanner = new Html5QrcodeScanner(
      'reader',
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
        await findKegByScannedValue(decodedText);
      } catch (err) {
        console.error('Erreur scanner :', err);
      } finally {
        isProcessingRef.current = false;
      }
    };

    const onScanFailure = (error: any) => {
      console.warn(`Scan en cours... ${error}`);
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch((err) => console.error('Erreur lors du nettoyage du scanner', err));
    };
  }, [findKegByScannedValue, scanResult]);

  useEffect(() => {
    if (selectedMovementType === 'en stock') {
      setSelectedClientId('');
      return;
    }

    if (selectedMovementType === 'En clientèle') {
      setSelectedEtatFut('');
    }
  }, [selectedMovementType]);

  return (
    <div className="keg-scanner">
      <h2 className="keg-scanner__title">Scanner un fût</h2>

      {!scanResult && (
        <div id="reader" className="keg-scanner__reader"></div>
      )}

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
              <p className="keg-scanner__scan-line keg-scanner__scan-line--last">
                <strong>Numéro de fût :</strong> {identifiedKeg.keg_number ?? 'Non renseigné'}
              </p>
            </>
          )}
        </div>
      )}

      {identifiedKeg && (
        <div className="keg-scanner__form-card">
          <div className="keg-scanner__field">
            <label className="keg-scanner__label">Type de mouvement</label>
            <select
              value={selectedMovementType}
              onChange={(event) => setSelectedMovementType(event.target.value as MovementType | '')}
              disabled={isLoading}
              className="keg-scanner__input"
            >
              <option value="">Sélectionner un mouvement</option>
              <option value="en stock">en stock</option>
              <option value="En clientèle">En clientèle</option>
            </select>
          </div>

          {selectedMovementType === 'en stock' && (
            <div className="keg-scanner__field">
              <label className="keg-scanner__label">État du fût</label>
              <select
                value={selectedEtatFut}
                onChange={(event) => setSelectedEtatFut(event.target.value as EtatFut | '')}
                disabled={isLoading}
                className="keg-scanner__input"
              >
                <option value="">Sélectionner un état</option>
                <option value="plein">plein</option>
                <option value="vide">vide</option>
              </select>
            </div>
          )}

          {selectedMovementType === 'En clientèle' && (
            <div className="keg-scanner__field">
              <label className="keg-scanner__label">Client</label>
              <select
                value={selectedClientId}
                onChange={(event) => setSelectedClientId(event.target.value)}
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
                Pour un mouvement en clientèle, l'état du fût est automatiquement enregistré à
                "plein".
              </p>
            </div>
          )}

          <button
            onClick={handleSubmitMovement}
            disabled={!identifiedKeg || !selectedMovementType || isLoading}
            className={`keg-scanner__button keg-scanner__button--primary ${
              !identifiedKeg || !selectedMovementType || isLoading
                ? 'keg-scanner__button--disabled'
                : ''
            }`}
          >
            {isLoading ? 'Enregistrement en cours...' : 'Enregistrer le mouvement'}
          </button>
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

      {!isLoading && scanResult && (
        <button
          onClick={resetFormState}
          className="keg-scanner__button keg-scanner__button--restart"
        >
          Scanner un autre fût
        </button>
      )}
    </div>
  );
};