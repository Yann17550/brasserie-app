// src/components/ForgotPassword.tsx
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail) {
      setErrorMessage('Merci de renseigner une adresse email.');
      return;
    }

    setIsLoading(true);

    try {
      const redirectTo = `${window.location.origin}/update-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(cleanedEmail, {
        redirectTo,
      });

      if (error) throw error;

      setStatusMessage(
        'Si cette adresse existe, un email de réinitialisation a été envoyé.'
      );
    } catch (error: any) {
      setErrorMessage(
        error.message || "Impossible d'envoyer l'email de réinitialisation."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Mot de passe oublié</h2>

      <p style={{ color: '#555' }}>
        Renseigne ton adresse email pour recevoir un lien de réinitialisation.
      </p>

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
          <label htmlFor="forgot-email" style={{ display: 'block', marginBottom: '5px' }}>
            Adresse e-mail :
          </label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          {isLoading ? 'Envoi en cours...' : 'Recevoir un lien de réinitialisation'}
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