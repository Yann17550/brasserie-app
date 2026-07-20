// src/components/UpdatePassword.tsx
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface UpdatePasswordProps {
  onBackToLogin: () => void;
  recoveryReady: boolean;
}

export const UpdatePassword: React.FC<UpdatePasswordProps> = ({
  onBackToLogin,
  recoveryReady,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    if (!recoveryReady) {
      setErrorMessage(
        "La session de réinitialisation n'est pas prête. Merci de rouvrir le lien reçu par email."
      );
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMessage('Merci de remplir les deux champs.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Les deux mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setStatusMessage('Mot de passe mis à jour avec succès. Tu peux maintenant te reconnecter.');
      setPassword('');
      setConfirmPassword('');

      await supabase.auth.signOut();

      setTimeout(() => {
        onBackToLogin();
      }, 1200);
    } catch (error: any) {
      setErrorMessage(
        error.message || 'Impossible de mettre à jour le mot de passe.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Changer le mot de passe</h2>

      <p style={{ color: '#555' }}>
        Choisis un nouveau mot de passe personnel.
      </p>

      {!recoveryReady && (
        <div style={{ color: '#614700', marginBottom: '15px', padding: '10px', backgroundColor: '#fffbe6', borderRadius: '4px', border: '1px solid #ffe58f' }}>
          Session de réinitialisation non détectée. Ouvre à nouveau le lien reçu par email sur cet appareil.
        </div>
      )}

      {statusMessage && (
        <div style={{ color: '#135200', marginBottom: '15px', padding: '10px', backgroundColor: '#f6ffed', borderRadius: '4px', border: '1px solid #b7eb8f' }}>
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div style={{ color: '#cf1322', marginBottom: '15px', padding: '10px', backgroundColor: '#fff1f0', borderRadius: '4px', border: '1px solid #ffa39e' }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="new-password" style={{ display: 'block', marginBottom: '5px' }}>
            Nouveau mot de passe :
          </label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading || !recoveryReady}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="confirm-password" style={{ display: 'block', marginBottom: '5px' }}>
            Confirmer le mot de passe :
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={isLoading || !recoveryReady}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !recoveryReady}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: recoveryReady ? '#007bff' : '#9bbcf3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: recoveryReady ? 'pointer' : 'not-allowed',
            marginBottom: '12px',
          }}
        >
          {isLoading ? 'Mise à jour en cours...' : 'Enregistrer le nouveau mot de passe'}
        </button>
      </form>

      <button
        type="button"
        onClick={onBackToLogin}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          color: '#333',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Retour à la connexion
      </button>
    </div>
  );
};