// src/types/app.ts

// Rôles utilisateurs correspondant à notre base de données Supabase
export type UserRole = 'livreur' | 'vendeur' | 'administrateur';

// Structure d'un profil utilisateur complet
export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
}

// Structure d'un client issue de la table 'clients'
// Cette table sert de référentiel et sa clé primaire est utilisée
// comme FK dans 'keg_movements' lorsque le fût est en clientèle.
export interface Client {
  id: string;
  name: string;
}

// Types de mouvements métier réellement utilisés dans l'application.
// Règle métier : un fût est soit en stock, soit en clientèle.
export type MovementType = 'en stock' | 'En clientèle';

// État physique du fût.
export type EtatFut = 'plein' | 'vide';

// Structure d'un mouvement de fût issue de la table 'keg_movements'.
// Règle d'or : cette table est l'unique source de vérité métier.
export interface KegMovement {
  id: string;
  keg_id: string;
  user_id: string;
  movement_type: MovementType;
  notes: string | null;
  created_at: string;
  client_id: string | null;
  etat_fut: EtatFut | null;
}

// Structure d'un fût issue de la table 'kegs'.
// Cette table porte l'identité du fût et ses caractéristiques fixes.
// Elle ne doit pas contenir l'état courant métier, qui reste déduit
// du dernier mouvement dans 'keg_movements'.
export interface Keg {
  id: string;
  qr_code_token: string;
  capacity_liters: number;
  beer_type: string;
  updated_at: string;
  brewery_name: string;
  keg_number: string;
}

// Données nécessaires à la création d'une identité de fût.
// Ce type est utile pour isoler la responsabilité du futur formulaire
// de création sans imposer les colonnes techniques générées par la base.
export interface CreateKegPayload {
  qr_code_token: string;
  capacity_liters: number;
  beer_type: string;
  brewery_name: string;
  keg_number: string;
}

// Pages disponibles dans la navigation réelle de l'application.
export type ActivePage =
  | 'accueil'
  | 'scan_keg'
  | 'check_stock'
  | 'clients'
  | 'create_keg_identity';