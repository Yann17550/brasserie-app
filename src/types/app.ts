// src/types/app.ts

export type UserRole = 'livreur' | 'vendeur' | 'administrateur';

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
}

export interface Client {
  id: string;
  name: string;
}

export type MovementType = 'stock' | 'sorti';

export type EtatFut = 'plein' | 'vide';

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

export interface Keg {
  id: string;
  qr_code_token: string;
  capacity_liters: number;
  beer_type: string;
  updated_at: string;
  brewery_name: string;
  keg_number: string;
}

export interface CreateKegPayload {
  qr_code_token: string;
  capacity_liters: number;
  beer_type: string;
  brewery_name: string;
  keg_number: string;
}

export type ActivePage =
  | 'accueil'
  | 'scan_keg'
  | 'clients'
  | 'check_stock'
  | 'create_keg_identity'
  | 'admin_options'
  | 'create_user'
  | 'forgot_password'
  | 'update_password';