// src/services/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../database.types';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Erreur de configuration : Les variables REACT_APP_SUPABASE_URL et REACT_APP_SUPABASE_ANON_KEY doivent être définies dans votre fichier .env'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);