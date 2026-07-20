// src/components/CreateUser.tsx
import React, { useMemo, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { UserRole } from '../types/app';

export const CreateUser: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('vendeur');

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedPasswordPreview, setGeneratedPasswordPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fullName = useMemo(() => {
    return `${firstName.trim()} ${lastName.trim()}`.trim();
  }, [firstName, lastName]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);
    setGeneratedPasswordPreview(null);

    const cleanedFirstName = firstName.trim();
    const cleanedLastName = lastName.trim();
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedFirstName || !cleanedLastName || !cleanedEmail) {
      setErrorMessage('Merci de remplir le prénom, le nom et l’adresse email.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          firstName: cleanedFirstName,
          lastName: cleanedLastName,
          email: cleanedEmail,
          role,
        },
      });

      if (error) {
        console.error('Erreur create-user:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Création impossible.');
      }

      setStatusMessage(
        `Utilisateur créé avec succès : ${data.fullName} (${data.email}).`
      );
      setGeneratedPasswordPreview(
        `Mot de passe provisoire : ${data.temporaryPassword}`
      );

      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('vendeur');
    } catch (error: any) {
      console.error('Erreur handleSubmit create-user:', error);

      if (error?.context) {
        try {
          const errorBody = await error.context.json();
          setErrorMessage(
            errorBody?.error || error.message || 'Une erreur est survenue.'
          );
          return;
        } catch {
        }
      }

      setErrorMessage(error.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginTop: 0 }}>Créer un utilisateur</h1>

      <p style={{ color: '#555', marginBottom: '24px' }}>
        Cette page prépare la création d’un compte utilisateur avec génération automatique
        d’un mot de passe provisoire.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: '10px',
          padding: '20px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label htmlFor="firstName" style={{ display: 'block', marginBottom: '6px' }}>
              Prénom
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              disabled={isLoading}
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label htmlFor="lastName" style={{ display: 'block', marginBottom: '6px' }}>
              Nom
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              disabled={isLoading}
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '6px' }}>
            Adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="role" style={{ display: 'block', marginBottom: '6px' }}>
            Rôle
          </label>
          <select
            id="role"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            disabled={isLoading}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          >
            <option value="vendeur">Vendeur</option>
            <option value="livreur">Livreur</option>
            <option value="administrateur">Administrateur</option>
          </select>
        </div>

        <div
          style={{
            marginBottom: '20px',
            padding: '12px 14px',
            borderRadius: '8px',
            backgroundColor: '#f6f8fa',
            border: '1px solid #e5e7eb',
            color: '#444',
            fontSize: '14px',
          }}
        >
          <strong>Nom complet généré :</strong> {fullName || '—'}
          <br />
          <strong>Mot de passe initial :</strong> généré automatiquement au moment de la création
        </div>

        {statusMessage && (
          <div
            style={{
              color: '#135200',
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '6px',
            }}
          >
            {statusMessage}
          </div>
        )}

        {generatedPasswordPreview && (
          <div
            style={{
              color: '#614700',
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#fffbe6',
              border: '1px solid #ffe58f',
              borderRadius: '6px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {generatedPasswordPreview}
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              color: '#cf1322',
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#fff1f0',
              border: '1px solid #ffa39e',
              borderRadius: '6px',
            }}
          >
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '12px 18px',
            backgroundColor: '#1677ff',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          {isLoading ? 'Création en cours...' : 'Créer l’utilisateur'}
        </button>
      </form>
    </div>
  );
};