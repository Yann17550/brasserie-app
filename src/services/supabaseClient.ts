// src/services/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Sécurité : On bloque le lancement si l'utilisateur a oublié de configurer son fichier .env
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Erreur de configuration : Les variables REACT_APP_SUPABASE_URL et REACT_APP_SUPABASE_ANON_KEY doivent être définies dans votre fichier .env"
  );
}

// Initialisation de l'instance unique (Singleton) pour toute l'application
export const supabase = createClient(supabaseUrl, supabaseAnonKey);