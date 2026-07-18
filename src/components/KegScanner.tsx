// src/components/KegScanner.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../services/supabaseClient';

interface KegScannerProps {
  userId: string; // L'ID de l'utilisateur connecté passé depuis App.tsx
}

export const KegScanner: React.FC<KegScannerProps> = ({ userId }) => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Réf pour éviter d'exécuter le traitement plusieurs fois si le scanneur s'active rapidement
  const isProcessingRef = useRef<boolean>(false);

  /**
   * Processus principal : Recherche du fût -> Mise à jour du fût -> Historisation du mouvement
   * Enveloppé dans useCallback pour stabiliser la référence et satisfaire ESLint
   */
  const handleKegProcess = useCallback(async (qrToken: string) => {
    setIsLoading(true);
    setStatusMessage("Recherche du fût correspondant au QR code...");
    setErrorMessage(null);

    try {
      // 1. Recherche du fût via la colonne token de la base
      const { data: keg, error: fetchError } = await supabase
        .from('kegs')
        .select('*')
        .eq('qr_code_token', qrToken)
        .single();

      if (fetchError || !keg) {
        setErrorMessage("Fût introuvable dans la base de données pour ce QR code.");
        return;
      }

      setStatusMessage(`Fût identifié : ${keg.beer_type} (${keg.capacity_liters}L). Enregistrement du mouvement...`);

      // 2. Mise à jour du statut du fût vers 'stock'
      const { error: updateError } = await supabase
        .from('kegs')
        .update({ current_status: 'stock', updated_at: new Date().toISOString() })
        .eq('id', keg.id);

      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour du fût : ${updateError.message}`);
      }

      // 3. Enregistrement du mouvement dans 'keg_movements' avec la colonne user_id
      const { error: movementError } = await supabase
        .from('keg_movements')
        .insert([
          {
            keg_id: keg.id,
            user_id: userId, // Alignement strict avec la colonne user_id
            movement_type: 'entrée_stock',
            notes: 'Entrée en stock automatique via scan mobile.'
          }
        ]);

      if (movementError) {
        throw new Error(`Erreur lors de l'enregistrement dans l'historique : ${movementError.message}`);
      }

      setStatusMessage(`Succès ! Le fût est enregistré en stock et le mouvement a été historisé.`);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Une erreur technique est survenue.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]); // Dépendance de userId car utilisé à l'intérieur

  useEffect(() => {
    // Initialisation du scanner de QR Code de la bibliothèque html5-qrcode
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true
      },
      false
    );

    // Déclenché dès qu'un QR code valide est décodé par la caméra
    const onScanSuccess = async (decodedText: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      
      try {
        // Arrêt propre du scanner avant le traitement pour éviter les doublons
        await scanner.clear(); 
        setScanResult(decodedText);
        await handleKegProcess(decodedText);
      } catch (err) {
        console.error("Erreur lors de l'arrêt du scanner :", err);
      } finally {
        isProcessingRef.current = false;
      }
    };

    const onScanFailure = (error: any) => {
      console.warn(`Scan en cours... ${error}`);
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch((err) => console.error("Erreur lors du nettoyage du scanner", err));
    };
  }, [handleKegProcess]); // Ajout de la dépendance stable pour valider ESLint

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Scanner un Fût</h2>
      
      <div id="reader" style={{ width: '100%', marginBottom: '20px' }}></div>

      {scanResult && (
        <div style={{ wordBreak: 'break-all', marginBottom: '15px', fontSize: '14px' }}>
          <strong>Lien détecté :</strong> {scanResult}
        </div>
      )}

      {statusMessage && (
        <div style={{ padding: '10px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '4px', color: '#1890ff', marginBottom: '15px' }}>
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: '10px', backgroundColor: '#fff1f0', border: '1px solid #ffa39e', borderRadius: '4px', color: '#f5222d', marginBottom: '15px' }}>
          {errorMessage}
        </div>
      )}

      {!isLoading && scanResult && (
        <button 
          onClick={() => { 
            setScanResult(null); 
            setStatusMessage(null); 
            setErrorMessage(null);
            window.location.reload();
          }}
          style={{ width: '100%', padding: '10px', backgroundColor: '#001529', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Scanner un autre fût
        </button>
      )}
    </div>
  );
};