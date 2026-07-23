import React, { useState } from 'react';
import { UserProfile, ActivePage } from '../types/app';
import '../styles/Home.css';

interface HomeProps {
  userProfile: UserProfile | null;
  onNavigate: (page: ActivePage) => void;
  onLogout: () => void;
}

export const Home: React.FC<HomeProps> = ({ userProfile, onNavigate, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = userProfile?.role === 'administrateur';

  const handleNavigate = (page: ActivePage) => {
    setMenuOpen(false);
    onNavigate(page);
  };

  const handleLogoutClick = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <div className="home-page">
      <section className="home-header-card">
        <div className="home-header-card__row">
          <div className="home-header-card__brand">
            <img
              src="/logo512.png"
              alt="Logo Île & Elle"
              className="home-header-card__logo"
            />

            <div className="home-header-card__text">
              <h1 className="home-header-card__title">Île & Elle</h1>
              <p className="home-header-card__subtitle">Gestion des fûts</p>
            </div>
          </div>

          <button
            type="button"
            className={`home-menu-toggle ${menuOpen ? 'home-menu-toggle--open' : ''}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Ouvrir le menu d'accueil"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {menuOpen && (
          <div className="home-header-menu">
            <button
              type="button"
              onClick={() => handleNavigate('scan_keg')}
              className="home-header-menu__button home-header-menu__button--primary"
            >
              Scanner un fût
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('clients')}
              className="home-header-menu__button"
            >
              Créer un client
            </button>

            <button
              type="button"
              onClick={handleLogoutClick}
              className="home-header-menu__button home-header-menu__button--logout"
            >
              Déconnexion
            </button>
          </div>
        )}
      </section>

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