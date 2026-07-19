// src/components/AdminOptions.tsx
import React from 'react';
import { ActivePage } from '../types/app';

interface AdminOptionsProps {
  onNavigate: (page: ActivePage) => void;
}

export const AdminOptions: React.FC<AdminOptionsProps> = ({ onNavigate }) => {
  return (
    <div style={{ padding: '20px', maxWidth: '760px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '10px' }}>Options administrateur</h1>

      <p style={{ marginBottom: '24px', color: '#555' }}>
        Cette zone regroupe les fonctionnalités réservées à l’administration.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        <button
          onClick={() => onNavigate('create_keg_identity')}
          style={{
            padding: '18px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '10px',
            border: '1px solid #722ed1',
            backgroundColor: '#fff',
            color: '#531dab',
            textAlign: 'left',
          }}
        >
          ➕ Créer une identité de fût
        </button>

        <button
          onClick={() => onNavigate('create_user')}
          style={{
            padding: '18px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '10px',
            border: '1px solid #1677ff',
            backgroundColor: '#fff',
            color: '#0958d9',
            textAlign: 'left',
          }}
        >
          👤 Créer un utilisateur
        </button>

        <button
          onClick={() => onNavigate('check_stock')}
          style={{
            padding: '18px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '10px',
            border: '1px solid #389e0d',
            backgroundColor: '#fff',
            color: '#237804',
            textAlign: 'left',
          }}
        >
          📦 Voir le stock
        </button>
      </div>
    </div>
  );
};