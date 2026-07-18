// src/components/KegScanner.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../services/supabaseClient';

interface KegScannerProps {
  userId: string;
}

export const KegScanner: React.FC<KegScannerProps> = ({ userId }) => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // États de diagnostic temporaires
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  const isProcessingRef = useRef<boolean>(false);

  const handleKegProcess = useCallback(async (qrToken: string) => {
    setIsLoading(true);
    setStatusMessage("Recherche du fût correspondant au QR code...");
    setErrorMessage(null);

    const cleanToken = qrToken.trim();
    // DIAGNOSTIC IMMÉDIAT : On affiche ce que le téléphone a lu
    setDebugInfo(`Chaîne lue : "${cleanToken}" | Longueur : ${cleanToken.length} caractères`);

    try {
      const { data: keg, error: fetchError } = await supabase
        .from('kegs')
        .select('*')
        .eq('qr_code_token', cleanToken)
        .single();

      if (fetchError) {
        setErrorMessage(`Erreur Supabase (PGRST116) : Aucun fût trouvé pour ce jeton.`);
        return;
      }

      setStatusMessage(`Fût identifié : ${keg.beer_type} (${keg.capacity_liters}L). Enregistrement du mouvement...`);

      const { error: updateError } = await supabase
        .from('kegs')
        .update({ current_status: 'stock', updated_at: new Date().toISOString() })
        .eq('id', keg.id);

      if (updateError) throw new Error(updateError.message);

      const { error: movementError } = await supabase
        .from('keg_movements')
        .insert([{ keg_id: keg.id, user_id: userId, movement_type: 'entrée_stock', notes: 'Entrée en stock automatique via scan mobile.' }]);

      if (movementError) throw new Error(movementError.message);

      setStatusMessage(`Succès ! Le fût est enregistré en stock.`);
    } catch (error: any) {
      setErrorMessage(error.message || "Une erreur technique est survenue.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true
      },
      false
    );

    const onScanSuccess = async (decodedText: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      
      try {
        await scanner.clear(); 
        const cleanedText = decodedText.trim();
        setScanResult(cleanedText);
        await handleKegProcess(cleanedText);
      } catch (err) {
        console.error("Erreur scanner :", err);
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
  }, [handleKegProcess]);

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

      {/* Affichage du bloc de diagnostic si disponible */}
      {debugInfo && (
        <div style={{ padding: '10px', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px', color: '#d46b08', marginBottom: '15px', fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
          <strong>🔧 Info Diagnostic :</strong><br />
          {debugInfo}
        </div>
      )}

      {!isLoading && scanResult && (
        <button 
          onClick={() => { 
            setScanResult(null); 
            setStatusMessage(null); 
            setErrorMessage(null);
            setDebugInfo(null);
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