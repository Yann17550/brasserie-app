// src/types/app.ts

// Rôles utilisateurs correspondant à notre base de données Supabase
export type UserRole = 'livreur' | 'vendeur' | 'administrateur';

// Structure d'un profil utilisateur complet
export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
}

// Types de mouvements de fûts autorisés pour le scan
export type MovementType = 'entrée_stock' | 'sortie_livraison' | 'sortie_emporté';

// Pages disponibles dans la navigation de l'application
export type ActivePage = 'accueil' | 'add_supplier' | 'add_delivery_man' | 'check_stock' | 'scan_keg';