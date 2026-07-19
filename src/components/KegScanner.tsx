// src/components/KegScanner.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../services/supabaseClient';
import type { Client, EtatFut, Keg, MovementType } from '../types/app';
import './KegScanner.css';

interface KegScannerProps {
  userId: string;
}

type KegWithCurrentState = Keg & {
  current_movement_type: MovementType | null;
  current_client_id: string | null;
  current_etat_fut: EtatFut | null;
};

export const KegScanner: React.FC<KegScannerProps> = ({ userId }) => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [identifiedKeg, setIdentifiedKeg] = useState<KegWithCurrentState | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedMovementType, setSelectedMovementType] = useState<MovementType | ''>('');
  const [selectedEtatFut, setSelectedEtatFut] = useState<EtatFut | ''>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [movementSaved, setMovementSaved] = useState<boolean>(false);

  const isProcessingRef = useRef<boolean>(false);

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
    setMovementSaved(false);
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
    setMovementSaved(false);
    setStatusMessage('Recherche du fût correspondant au QR code...');

    const scannedValueClean = decodedText.trim();

    if (!scannedValueClean) {
      setErrorMessage('Le QR code scanné est vide.');
      setDebugInfo('Aucune valeur exploitable n’a été extraite du scan.');
      setIsLoading(false);
      return;
    }

    try {
      const { data: matchedKeg, error: fetchError } = await supabase
        .from('kegs')
        .select(`
          id,
          qr_code_token,
          capacity_liters,
          beer_type,
          updated_at,
          brewery_name,
          keg_number,
          current_movement_type,
          current_client_id,
          current_etat_fut
        `)
        .eq('qr_code_token', scannedValueClean)
        .maybeSingle();

      if (fetchError) {
        setErrorMessage("Erreur technique lors de la récupération du fût.");
        setDebugInfo(`Code : ${fetchError.code ?? 'N/A'} | ${fetchError.message}`);
        return;
      }

      if (!matchedKeg) {
        setErrorMessage('Fût introuvable dans la base de données.');
        setDebugInfo(`Valeur scannée exacte : "${scannedValueClean}"`);
        return;
      }

      setScanResult(scannedValueClean);
      setIdentifiedKeg(matchedKeg as KegWithCurrentState);
      setSelectedMovementType('');
      setSelectedEtatFut('');
      setSelectedClientId('');
      setStatusMessage(
        `Fût identifié : ${matchedKeg.beer_type} ${matchedKeg.capacity_liters}L${matchedKeg.keg_number ? `, n° ${matchedKeg.keg_number}` : ''}.`
      );
      setDebugInfo(
        `Fût trouvé. État courant : movement_type="${matchedKeg.current_movement_type ?? 'null'}", etat_fut="${matchedKeg.current_etat_fut ?? 'null'}", client_id="${matchedKeg.current_client_id ?? 'null'}".`
      );
    } catch (error: any) {
      setErrorMessage(error.message || 'Une erreur technique est survenue.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const availableMovementOptions = useMemo<MovementType[]>(() => {
    if (!identifiedKeg?.current_movement_type) {
      return ['stock', 'sorti'];
    }

    if (identifiedKeg.current_movement_type === 'stock') {
      return ['sorti'];
    }

    if (identifiedKeg.current_movement_type === 'sorti') {
      return ['stock'];
    }

    return ['stock', 'sorti'];
  }, [identifiedKeg]);

  const currentMovementLabel = useMemo(() => {
    if (!identifiedKeg?.current_movement_type) {
      return 'Non défini';
    }

    return identifiedKeg.current_movement_type === 'stock' ? 'En stock' : 'Sorti';
  }, [identifiedKeg]);

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

    if (identifiedKeg.current_movement_type === selectedMovementType) {
      setErrorMessage('Ce mouvement est impossible car le fût est déjà dans cet état.');
      setDebugInfo(
        `Transition refusée : état courant="${identifiedKeg.current_movement_type}", mouvement demandé="${selectedMovementType}".`
      );
      return;
    }

    if (selectedMovementType === 'stock' && !selectedEtatFut) {
      setErrorMessage("L'état du fût est obligatoire pour un retour en stock.");
      return;
    }

    if (selectedMovementType === 'sorti' && !selectedClientId) {
      setErrorMessage('Le client est obligatoire pour une sortie.');
      return;
    }

    const etatFutToInsert: EtatFut =
      selectedMovementType === 'sorti' ? 'plein' : (selectedEtatFut as EtatFut);

    const clientIdToInsert: string | null =
      selectedMovementType === 'sorti' ? selectedClientId : null;

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
        setDebugInfo(`Insert keg_movements | Code : ${insertError.code ?? 'N/A'} | ${insertError.message}`);
        return;
      }

      const { error: updateError } = await supabase
        .from('kegs')
        .update({
          current_movement_type: selectedMovementType,
          current_client_id: clientIdToInsert,
          current_etat_fut: etatFutToInsert,
          last_movement_at: new Date().toISOString(),
        })
        .eq('id', identifiedKeg.id);

      if (updateError) {
        setErrorMessage("Le mouvement a été enregistré, mais la mise à jour de l'état courant du fût a échoué.");
        setDebugInfo(`Update kegs | Code : ${updateError.code ?? 'N/A'} | ${updateError.message}`);
        return;
      }

      setIdentifiedKeg((prev) =>
        prev
          ? {
              ...prev,
              current_movement_type: selectedMovementType,
              current_client_id: clientIdToInsert,
              current_etat_fut: etatFutToInsert,
            }
          : prev
      );
      setMovementSaved(true);
      setStatusMessage('Succès ! Le mouvement du fût a été enregistré.');
      setDebugInfo(
        `Historique + état courant mis à jour : type="${selectedMovementType}", etat_fut="${etatFutToInsert}", client_id="${clientIdToInsert ?? 'null'}".`
      );
    } catch (error: any) {
      setErrorMessage(error.message || "Une erreur technique est survenue lors de l'enregistrement.");
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
    if (selectedMovementType === 'stock') {
      setSelectedClientId('');
      return;
    }

    if (selectedMovementType === 'sorti') {
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
              <p className="keg-scanner__scan-line">
                <strong>Numéro de fût :</strong> {identifiedKeg.keg_number ?? 'Non renseigné'}
              </p>
              <p className="keg-scanner__scan-line keg-scanner__scan-line--last">
                <strong>Statut actuel :</strong> {currentMovementLabel}
              </p>
            </>
          )}
        </div>
      )}

      {identifiedKeg && !movementSaved && (
        <div className="keg-scanner__form-card">
          <div className="keg-scanner__field">
            <label className="keg-scanner__label">Type de mouvement</label>
            <select
              value={selectedMovementType}
              onChange={(event) => setSelectedMovementType(event.target.value as MovementType | '')}
              disabled={isLoading}
              className="keg-scanner__input"
              translate="no"
            >
              <option value="">Sélectionner un mouvement</option>
              {availableMovementOptions.map((movementType) => (
                <option key={movementType} value={movementType}>
                  {movementType === 'stock' ? 'En stock' : 'Sorti'}
                </option>
              ))}
            </select>
          </div>

          {selectedMovementType === 'stock' && (
            <div className="keg-scanner__field">
              <label className="keg-scanner__label">État du fût</label>
              <select
                value={selectedEtatFut}
                onChange={(event) => setSelectedEtatFut(event.target.value as EtatFut | '')}
                disabled={isLoading}
                className="keg-scanner__input"
                translate="no"
              >
                <option value="">Sélectionner un état</option>
                <option value="plein">Plein</option>
                <option value="vide">Vide</option>
              </select>
            </div>
          )}

          {selectedMovementType === 'sorti' && (
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
                Pour une sortie, l'état du fût est automatiquement enregistré à "plein".
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmitMovement}
            disabled={!identifiedKeg || !selectedMovementType || isLoading}
            className={`keg-scanner__button keg-scanner__button--primary ${
              !identifiedKeg || !selectedMovementType || isLoading
                ? 'keg-scanner__button--disabled'
                : ''
            }`}
            translate="no"
          >
            Enregistrer le mouvement
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
          type="button"
          onClick={resetFormState}
          className="keg-scanner__button keg-scanner__button--restart"
        >
          Scanner un autre fût
        </button>
      )}
    </div>
  );
};