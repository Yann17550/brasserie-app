// src/components/Home.tsx
import React from 'react';
import { UserProfile, ActivePage } from '../types/app';

interface HomeProps {
  userProfile: UserProfile | null;
  onNavigate: (page: ActivePage) => void;
}

export const Home: React.FC<HomeProps> = ({ userProfile, onNavigate }) => {
  const isAdmin = userProfile?.role === 'administrateur';

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <h1>Gestion de la Brasserie</h1>

      <div
        style={{
          backgroundColor: '#e9ecef',
          padding: '15px',
          borderRadius: '6px',
          marginBottom: '25px',
        }}
      >
        <h3>Bienvenue, {userProfile?.full_name || 'Collaborateur'} !</h3>
        <p>
          <strong>Rôle assigné :</strong>{' '}
          <span style={{ textTransform: 'capitalize' }}>
            {userProfile?.role || 'Chargement...'}
          </span>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <button
          onClick={() => onNavigate('scan_keg')}
          style={{
            padding: '20px',
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '8px',
            border: '1px solid #007bff',
            backgroundColor: '#fff',
            color: '#007bff',
          }}
        >
          📷 Scanner un fût
        </button>

        <button
          onClick={() => onNavigate('clients')}
          style={{
            padding: '20px',
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '8px',
            border: '1px solid #28a745',
            backgroundColor: '#fff',
            color: '#28a745',
          }}
        >
          👥 Créer un client
        </button>
      </div>

      {isAdmin && (
        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            border: '1px dashed #722ed1',
            borderRadius: '6px',
            backgroundColor: '#faf5ff',
          }}
        >
          <h4 style={{ color: '#531dab', marginTop: 0, marginBottom: '10px' }}>
            Options Administrateur
          </h4>

          <p style={{ fontSize: '14px', marginBottom: '15px' }}>
            Les outils d’administration ont été regroupés dans un espace dédié pour alléger le menu principal.
          </p>

          <button
            onClick={() => onNavigate('admin_options')}
            style={{
              padding: '12px 16px',
              fontSize: '15px',
              cursor: 'pointer',
              borderRadius: '8px',
              border: '1px solid #722ed1',
              backgroundColor: '#fff',
              color: '#531dab',
            }}
          >
            Ouvrir les options administrateur
          </button>
        </div>
      )}
    </div>
  );
};