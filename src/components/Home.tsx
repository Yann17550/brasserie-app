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
          onClick={() => onNavigate('check_stock')}
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
          📦 Consulter le stock
        </button>
      </div>

      {isAdmin && (
        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            border: '1px dashed #dc3545',
            borderRadius: '6px',
            backgroundColor: '#fff5f5',
          }}
        >
          <h4 style={{ color: '#dc3545', marginTop: 0, marginBottom: '10px' }}>
            Options Administrateur
          </h4>

          <p style={{ fontSize: '14px', marginBottom: '15px' }}>
            Cette zone regroupe les fonctionnalités réservées à l’administration de la
            brasserie.
          </p>

          <button
            onClick={() => onNavigate('create_keg_identity')}
            style={{
              padding: '12px 16px',
              fontSize: '15px',
              cursor: 'pointer',
              borderRadius: '8px',
              border: '1px solid #dc3545',
              backgroundColor: '#fff',
              color: '#dc3545',
            }}
          >
            ➕ Créer une identité de fût
          </button>
        </div>
      )}
    </div>
  );
};