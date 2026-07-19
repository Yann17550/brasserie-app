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
  const isAdmin = userRole === 'administrateur';

  const navItems: { page: ActivePage; label: string }[] = [
    { page: 'accueil', label: 'Accueil' },
    { page: 'scan_keg', label: 'Scanner un fût' },
    { page: 'clients', label: 'Créer un client' },
  ];

  return (
    <nav
      style={{
        padding: '10px 16px',
        backgroundColor: '#f5f5f5',
        marginBottom: '20px',
        borderBottom: '1px solid #e5e5e5',
      }}
    >
      <ul
        style={{
          display: 'flex',
          listStyle: 'none',
          gap: '12px',
          margin: 0,
          padding: 0,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {navItems.map((item) => (
          <li key={item.page}>
            <button
              onClick={() => onPageChange(item.page)}
              style={{
                fontWeight: currentPage === item.page ? 'bold' : 'normal',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
                border: currentPage === item.page ? '1px solid #1677ff' : '1px solid #d9d9d9',
                backgroundColor: currentPage === item.page ? '#e6f4ff' : '#ffffff',
                color: '#1f1f1f',
              }}
            >
              {item.label}
            </button>
          </li>
        ))}

        {isAdmin && (
          <li>
            <button
              onClick={() => onPageChange('admin_options')}
              style={{
                fontWeight: currentPage === 'admin_options' ? 'bold' : 'normal',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #722ed1',
                backgroundColor: currentPage === 'admin_options' ? '#f9f0ff' : '#ffffff',
                color: '#531dab',
              }}
            >
              Options administrateur
            </button>
          </li>
        )}

        <li style={{ marginLeft: 'auto' }}>
          <button
            onClick={onLogout}
            style={{
              cursor: 'pointer',
              padding: '8px 12px',
              backgroundColor: '#ff4d4f',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
            }}
          >
            Déconnexion
          </button>
        </li>
      </ul>
    </nav>
  );
};