import React from 'react';
import { UserProfile, ActivePage } from '../types/app';
import { AppHeader, getCommonHeaderActions } from './AppHeader';
import '../styles/Home.css';

interface HomeProps {
  userProfile: UserProfile | null;
  onNavigate: (page: ActivePage) => void;
  onLogout: () => void;
}

export const Home: React.FC<HomeProps> = ({ userProfile, onNavigate, onLogout }) => {
  const isAdmin = userProfile?.role === 'administrateur';

  return (
    <div className="home-page">
      <AppHeader
        actions={getCommonHeaderActions({
          onNavigate,
          onLogout,
          userRole: userProfile?.role,
        })}
      />

      <section className="home-welcome">
        <p className="home-welcome__label">Bienvenue</p>
        <h2 className="home-welcome__name">
          {userProfile?.full_name || 'Collaborateur'}
        </h2>
      </section>

      <section className="home-main-action">
        <button
          type="button"
          onClick={() => onNavigate('scan_keg')}
          className="home-main-action__button"
        >
          <span className="home-main-action__icon" aria-hidden="true">
            📷
          </span>

          <span className="home-main-action__content">
            <span className="home-main-action__title">Scanner un fût</span>
            <span className="home-main-action__description">
              Action principale de l’accueil.
            </span>
          </span>
        </button>
      </section>

      {isAdmin && (
        <section className="home-admin">
          <div className="home-admin__header">
            <h3 className="home-admin__title">Administration</h3>
          </div>

          <div className="home-admin__grid">
            <button
              type="button"
              onClick={() => onNavigate('check_stock')}
              className="home-admin__button"
            >
              Voir le stock
            </button>

            <button
              type="button"
              onClick={() => onNavigate('create_keg_identity')}
              className="home-admin__button"
            >
              Créer un fût
            </button>

            <button
              type="button"
              onClick={() => onNavigate('create_user')}
              className="home-admin__button"
            >
              Créer un utilisateur
            </button>

            <button
              type="button"
              disabled
              className="home-admin__button home-admin__button--disabled"
            >
              Modifier un utilisateur
            </button>
          </div>
        </section>
      )}
    </div>
  );
};