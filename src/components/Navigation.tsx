import React from 'react';
import { ActivePage, UserRole } from '../types/app';
import '../styles/Navigation.css';

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
    <nav className="app-nav">
      <div className="app-nav__inner">
        <button
          type="button"
          className="app-nav__brand"
          onClick={() => onPageChange('accueil')}
        >
          <span className="app-nav__brand-mark">🍺</span>

          <span className="app-nav__brand-text">
            <span className="app-nav__brand-title">Île & Elle</span>
            <span className="app-nav__brand-subtitle">Gestion brasserie</span>
          </span>
        </button>

        <ul className="app-nav__list">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;

            return (
              <li key={item.page}>
                <button
                  type="button"
                  onClick={() => onPageChange(item.page)}
                  className={`app-nav__link ${isActive ? 'app-nav__link--active' : ''}`}
                >
                  {item.label}
                </button>
              </li>
            );
          })}

          {isAdmin && (
            <li>
              <button
                type="button"
                onClick={() => onPageChange('admin_options')}
                className={`app-nav__link app-nav__link--admin ${
                  currentPage === 'admin_options' ? 'app-nav__link--active-admin' : ''
                }`}
              >
                Options administrateur
              </button>
            </li>
          )}
        </ul>

        <button
          type="button"
          onClick={onLogout}
          className="app-nav__logout"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
};