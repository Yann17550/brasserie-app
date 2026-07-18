// src/components/KegScanner.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../services/supabaseClient';
import { MovementType } from '../types/app';

export const KegScanner: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [movementType, setMovementType] = useState<MovementType>('entrée_stock');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Référence pour conserver l'instance du scanner de la bibliothèque
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialisation du scanner configuré pour un rendu fluide sur smartphone
    const scanner = new Html5QrcodeScanner(
      'reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true
      },
      /* verbose= */ false
    );

    scannerRef.current = scanner;

    // Lancement du scan et capture du résultat
    scanner.render(
      (decodedText) => {
        setScanResult(decodedText);
        setStatusMessage(null);
      },
      (error) => {
        // Échec silencieux des scans intermédiaires (recherche de focus)
      }
    );

    // Nettoyage de la caméra à la fermeture du composant
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error("Erreur de nettoyage du scanner :", err));
      }
    };
  }, []);

  const handleSubmitMovement = async () => {
    if (!scanResult) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      // 1. Récupération de l'utilisateur actif via la session Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        throw new Error("Authentification requise pour enregistrer un mouvement.");
      }

      // 2. Insertion du mouvement dans la table 'keg_movements'
      const { error: insertError } = await supabase
        .from('keg_movements')
        .insert([
          {
            keg_id: scanResult, // Le QR code décodé doit correspondre à l'identifiant du fût
            movement_type: movementType,
            operator_id: session.user.id,
            created_at: new Date().toISOString()
          }
        ]);

      if (insertError) throw insertError;

      setStatusMessage({ type: 'success', text: `Mouvement "${movementType}" enregistré avec succès pour le fût.` });
      setScanResult(null); // Réinitialisation pour le prochain scan
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || "Erreur lors de l'enregistrement." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2>Scanner un Fût</h2>

      {statusMessage && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '15px', 
          borderRadius: '4px',
          backgroundColor: statusMessage.type === 'success' ? '#d4edda' : '#f8d7da',
          color: statusMessage.type === 'success' ? '#155724' : '#721c24'
        }}>
          {statusMessage.text}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="movement-type" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Type de mouvement :
        </label>
        <select
          id="movement-type"
          value={movementType}
          onChange={(e) => setMovementType(e.target.value as MovementType)}
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          disabled={loading}
        >
          <option value="entrée_stock">Entrée en stock (Retour brasserie / Remplissage)</option>
          <option value="sortie_livraison">Sortie - Livraison client</option>
          <option value="sortie_emporté">Sortie - Emporté direct</option>
        </select>
      </div>

      {/* Zone d'affichage du flux vidéo de la caméra */}
      <div id="reader" style={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}></div>

      {scanResult && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #007bff', borderRadius: '6px', backgroundColor: '#f7fafd' }}>
          <p><strong>Code détecté :</strong> <code>{scanResult}</code></p>
          <button
            onClick={handleSubmitMovement}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#007bff', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? "Validation..." : "Confirmer ce mouvement"}
          </button>
        </div>
      )}
    </div>
  );
};