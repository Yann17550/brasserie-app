// src/components/Home.tsx
import React from 'react';
import { UserProfile, ActivePage } from '../types/app';

interface HomeProps {
  userProfile: UserProfile | null;
  onNavigate: (page: ActivePage) => void;
}

export const Home: React.FC<HomeProps> = ({ userProfile, onNavigate }) => {
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Gestion de la Brasserie</h1>
      
      <div style={{ backgroundColor: '#e9ecef', padding: '15px', borderRadius: '6px', marginBottom: '25px' }}>
        <h3>Bienvenue, {userProfile?.full_name || 'Utilisateur'} !</h3>
        <p><strong>Rôle assigné :</strong> <span style={{ textTransform: 'capitalize' }}>{userProfile?.role || 'Non défini'}</span></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <button
          onClick={() => onNavigate('scan_keg')}
          style={{ padding: '20px', fontSize: '16px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #007bff', backgroundColor: '#fff', color: '#007bff' }}
        >
          📷 Scanner un fût
        </button>
        
        <button
          onClick={() => onNavigate('check_stock')}
          style={{ padding: '20px', fontSize: '16px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #28a745', backgroundColor: '#fff', color: '#28a745' }}
        >
          📦 Consulter le stock
        </button>
      </div>

      {userProfile?.role === 'administrateur' && (
        <div style={{ marginTop: '30px', padding: '15px', border: '1px dashed #dc3545', borderRadius: '6px' }}>
          <h4 style={{ color: '#dc3545', marginTop: 0 }}>Options Administrateur</h4>
          <p style={{ fontSize: '14px' }}>Fonctionnalités de gestion du personnel et des fournisseurs réservées à votre rang.</p>
        </div>
      )}
    </div>
  );
};