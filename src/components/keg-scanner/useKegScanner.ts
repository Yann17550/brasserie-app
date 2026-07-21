import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../../services/supabaseClient';
import type { Client } from '../../types/app';
import type { KegWithCurrentState, ScannerAction } from './kegScanner.types';
import {
  getActionPayload,
  getAvailableActions,
  isActionAllowed,
  requiresClient,
} from './kegScanner.utils';

export function useKegScanner(userId: string) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [identifiedKeg, setIdentifiedKeg] = useState<KegWithCurrentState | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedAction, setSelectedAction] = useState<ScannerAction | ''>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [movementSaved, setMovementSaved] = useState<boolean>(false);

  const isProcessingRef = useRef<boolean>(false);

  const resetMessages = useCallback(() => {
    setStatusMessage(null);
    setErrorMessage(null);
    setDebugInfo(null);
  }, []);

  const resetFormState = useCallback(() => {
    setScanResult(null);
    setIdentifiedKeg(null);
    setSelectedAction('');
    setSelectedClientId('');
    setStatusMessage(null);
    setErrorMessage(null);
    setDebugInfo(null);
    setMovementSaved(false);
  }, []);

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

  const findKegByScannedValue = useCallback(
    async (decodedText: string) => {
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
        setSelectedAction('');
        setSelectedClientId('');
        setStatusMessage(
          `Fût identifié : ${matchedKeg.beer_type} ${matchedKeg.capacity_liters}L${
            matchedKeg.keg_number ? `, n° ${matchedKeg.keg_number}` : ''
          }.`
        );
        setDebugInfo(
          `Fût trouvé. État courant : movement_type="${matchedKeg.current_movement_type ?? 'null'}", etat_fut="${matchedKeg.current_etat_fut ?? 'null'}", client_id="${matchedKeg.current_client_id ?? 'null'}".`
        );
      } catch (error: any) {
        setErrorMessage(error.message || 'Une erreur technique est survenue.');
      } finally {
        setIsLoading(false);
      }
    },
    [resetMessages]
  );

  const availableActions = useMemo(() => {
    return getAvailableActions(identifiedKeg);
  }, [identifiedKeg]);

  const handleSubmitMovement = useCallback(async () => {
    resetMessages();

    if (!identifiedKeg) {
      setErrorMessage("Aucun fût identifié. Merci de scanner un fût avant d'enregistrer un mouvement.");
      return;
    }

    if (!selectedAction) {
      setErrorMessage("L'action est obligatoire.");
      return;
    }

    if (!isActionAllowed(identifiedKeg, selectedAction)) {
      setErrorMessage('Cette transition est interdite pour le statut actuel du fût.');
      setDebugInfo(
        `Transition refusée : movement_type="${identifiedKeg.current_movement_type ?? 'null'}", etat_fut="${identifiedKeg.current_etat_fut ?? 'null'}", action="${selectedAction}".`
      );
      return;
    }

    if (requiresClient(selectedAction) && !selectedClientId) {
      setErrorMessage('Le client est obligatoire pour une sortie.');
      return;
    }

    const payload = getActionPayload(selectedAction, selectedClientId);

    setIsLoading(true);
    setStatusMessage('Enregistrement du mouvement en cours...');

    try {
      const { error: insertError } = await supabase
        .from('keg_movements')
        .insert([
          {
            keg_id: identifiedKeg.id,
            user_id: userId,
            movement_type: payload.movementType,
            etat_fut: payload.etatFut,
            client_id: payload.clientId,
            notes: null,
          },
        ]);

      if (insertError) {
        setErrorMessage("Erreur lors de l'enregistrement du mouvement.");
        setDebugInfo(`Insert keg_movements | Code : ${insertError.code ?? 'N/A'} | ${insertError.message}`);
        return;
      }

      const { data: updatedKeg, error: updateError } = await supabase
        .from('kegs')
        .update({
          current_movement_type: payload.movementType,
          current_client_id: payload.clientId,
          current_etat_fut: payload.etatFut,
          last_movement_at: new Date().toISOString(),
        })
        .eq('id', identifiedKeg.id)
        .select('id, current_movement_type, current_client_id, current_etat_fut, last_movement_at');

      if (updateError) {
        setErrorMessage("Le mouvement a été enregistré, mais la mise à jour de l'état courant du fût a échoué.");
        setDebugInfo(`Update kegs | Code : ${updateError.code ?? 'N/A'} | ${updateError.message}`);
        return;
      }

      if (!updatedKeg || updatedKeg.length === 0) {
        setErrorMessage("Le mouvement a été enregistré, mais aucune ligne de la table kegs n'a été mise à jour.");
        setDebugInfo(`Update kegs vide | keg.id="${identifiedKeg.id}" | aucun enregistrement modifié`);
        return;
      }

      setIdentifiedKeg((prev) =>
        prev
          ? {
              ...prev,
              current_movement_type: payload.movementType,
              current_client_id: payload.clientId,
              current_etat_fut: payload.etatFut,
            }
          : prev
      );
      setMovementSaved(true);
      setStatusMessage('Succès ! Le mouvement du fût a été enregistré.');
      setDebugInfo(
        `Historique + état courant mis à jour : type="${payload.movementType}", etat_fut="${payload.etatFut}", client_id="${payload.clientId ?? 'null'}".`
      );
    } catch (error: any) {
      setErrorMessage(error.message || "Une erreur technique est survenue lors de l'enregistrement.");
    } finally {
      setIsLoading(false);
    }
  }, [identifiedKeg, resetMessages, selectedAction, selectedClientId, userId]);

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
    if (!requiresClient(selectedAction)) {
      setSelectedClientId('');
    }
  }, [selectedAction]);

  return {
    scanResult,
    identifiedKeg,
    clients,
    selectedAction,
    selectedClientId,
    statusMessage,
    errorMessage,
    debugInfo,
    isLoading,
    movementSaved,
    availableActions,
    setSelectedAction,
    setSelectedClientId,
    resetFormState,
    handleSubmitMovement,
  };
}