// src/components/Navigation.tsx
import React from 'react';
import { ActivePage, UserRole } from '../types/app';


interface NavigationProps {
  currentPage: ActivePage;
  onPageChange: (page: ActivePage) => void;
  onLogout: () => void;
  userRole: UserRole;
}


export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onPageChange,
  onLogout,
  userRole,
}) => {
  // Liste des liens de navigation principaux, visibles par tous les rôles
  const navItems: { page: ActivePage; label: string }[] = [
    { page: 'accueil', label: 'Accueil' },
    { page: 'scan_keg', label: 'Scanner un fût' },
    { page: 'check_stock', label: 'Voir le stock' },
  ];

  // Lien admin-only : création d'identité de fût
  const isAdmin = userRole === 'administrateur';

  return (
    <nav style={{ padding: '10px', backgroundColor: '#f5f5f5', marginBottom: '20px' }}>
      <ul style={{ display: 'flex', listStyle: 'none', gap: '15px', margin: 0, padding: 0, alignItems: 'center' }}>
        {navItems.map((item) => (
          <li key={item.page}>
            <button
              onClick={() => onPageChange(item.page)}
              style={{
                fontWeight: currentPage === item.page ? 'bold' : 'normal',
                cursor: 'pointer',
                padding: '5px 10px',
              }}
            >
              {item.label}
            </button>
          </li>
        ))}

        {/* Lien admin-only :visible uniquement si l'utilisateur est administrateur */}
        {isAdmin && (
          <li>
            <button
              onClick={() => onPageChange('create_keg_identity')}
              style={{
                fontWeight: currentPage === 'create_keg_identity' ? 'bold' : 'normal',
                cursor: 'pointer',
                padding: '5px 10px',
                backgroundColor: '#001529',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Créer un fût
            </button>
          </li>
        )}

        <li style={{ marginLeft: 'auto' }}>
          <button
            onClick={onLogout}
            style={{
              cursor: 'pointer',
              padding: '5px 10px',
              backgroundColor: '#ff4d4d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            Déconnexion
          </button>
        </li>
      </ul>
    </nav>
  );
};