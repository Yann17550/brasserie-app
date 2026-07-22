import React from 'react';
import { UserProfile, ActivePage } from '../types/app';
import '../styles/Home.css';


interface HomeProps {
  userProfile: UserProfile | null;
  onNavigate: (page: ActivePage) => void;
}

export const Home: React.FC<HomeProps> = ({ userProfile, onNavigate }) => {
  const isAdmin = userProfile?.role === 'administrateur';

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__brand">
          <img
            src="/logo512.jpg"
            alt="Logo Île & Elle"
            className="home-hero__logo"
          />

          <div className="home-hero__text">
            <p className="home-hero__eyebrow">Gestion des fûts</p>
            <h1 className="home-hero__title">Gestion de la Brasserie</h1>
            <p className="home-hero__subtitle">
              Accédez rapidement aux actions principales de suivi, de scan et d’administration.
            </p>
          </div>
        </div>

        <div className="home-welcome-card">
          <div>
            <p className="home-welcome-card__label">Bienvenue</p>
            <h2 className="home-welcome-card__name">
              {userProfile?.full_name || 'Collaborateur'}
            </h2>
          </div>

          <div className="home-role-badge">
            <span className="home-role-badge__label">Rôle</span>
            <span className="home-role-badge__value">
              {userProfile?.role || 'Chargement...'}
            </span>
          </div>
        </div>
      </section>

      <section className="home-actions">
        <button
          type="button"
          onClick={() => onNavigate('scan_keg')}
          className="home-action-card home-action-card--primary"
        >
          <span className="home-action-card__icon" aria-hidden="true">
            📷
          </span>
          <span className="home-action-card__content">
            <span className="home-action-card__title">Scanner un fût</span>
            <span className="home-action-card__description">
              Identifier rapidement un fût et enregistrer son mouvement.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('clients')}
          className="home-action-card home-action-card--secondary"
        >
          <span className="home-action-card__icon" aria-hidden="true">
            👥
          </span>
          <span className="home-action-card__content">
            <span className="home-action-card__title">Créer un client</span>
            <span className="home-action-card__description">
              Ajouter un nouveau client sans passer par les options avancées.
            </span>
          </span>
        </button>
      </section>

      {isAdmin && (
        <section className="home-admin-card">
          <div className="home-admin-card__header">
            <div>
              <p className="home-admin-card__eyebrow">Administration</p>
              <h3 className="home-admin-card__title">Options administrateur</h3>
            </div>
          </div>

          <p className="home-admin-card__text">
            Les outils d’administration ont été regroupés dans un espace dédié pour alléger le menu principal.
          </p>

          <button
            type="button"
            onClick={() => onNavigate('admin_options')}
            className="home-admin-card__button"
          >
            Ouvrir les options administrateur
          </button>
        </section>
      )}
    </div>
  );
};