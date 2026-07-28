import React, { useState } from 'react';
import { ActivePage, UserRole } from '../types/app';
import '../styles/AppHeader.css';

type HeaderAction = {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'default' | 'logout';
  disabled?: boolean;
};

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  actions: HeaderAction[];
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'Île & Elle',
  subtitle = 'Gestion des fûts',
  actions,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleActionClick = (action: HeaderAction) => {
    if (action.disabled) return;
    setMenuOpen(false);
    action.onClick();
  };

  return (
    <section className="app-header">
      <div className="app-header__row">
        <div className="app-header__brand">
          <img
            src="/logo512.png"
            alt="Logo Île & Elle"
            className="app-header__logo"
          />

          <div className="app-header__text">
            <h1 className="app-header__title">{title}</h1>
            <p className="app-header__subtitle">{subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          className={`app-header__toggle ${menuOpen ? 'app-header__toggle--open' : ''}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && (
        <div className="app-header__menu">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => handleActionClick(action)}
              disabled={action.disabled}
              className={`app-header__menu-button ${
                action.variant === 'primary'
                  ? 'app-header__menu-button--primary'
                  : action.variant === 'logout'
                  ? 'app-header__menu-button--logout'
                  : ''
              } ${action.disabled ? 'app-header__menu-button--disabled' : ''}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

type CommonHeaderProps = {
  onNavigate: (page: ActivePage) => void;
  onLogout: () => void;
  userRole?: UserRole;
};

export const getCommonHeaderActions = ({
  onNavigate,
  onLogout,
  userRole,
}: CommonHeaderProps): HeaderAction[] => {
  const isAdmin = userRole === 'administrateur';

  const actions: HeaderAction[] = [
    {
      label: 'Accueil',
      onClick: () => onNavigate('accueil'),
    },
    {
      label: 'Scanner un fût',
      onClick: () => onNavigate('scan_keg'),
      variant: 'primary',
    },
    {
      label: 'Créer un client',
      onClick: () => onNavigate('clients'),
    },
  ];

  if (isAdmin) {
    actions.push(
      {
        label: 'Voir le stock',
        onClick: () => onNavigate('check_stock'),
      },
      {
        label: 'Créer un fût',
        onClick: () => onNavigate('create_keg_identity'),
      },
      {
        label: 'Créer un utilisateur',
        onClick: () => onNavigate('create_user'),
      },
      {
        label: 'Modifier un utilisateur',
        onClick: () => undefined,
        disabled: true,
      }
    );
  }

  actions.push({
    label: 'Déconnexion',
    onClick: onLogout,
    variant: 'logout',
  });

  return actions;
};