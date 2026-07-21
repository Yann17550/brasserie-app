// src/components/stock-check/useStockData.ts

import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import type { ClientRow, KegRow } from './stockCheck.types';

type UseStockDataResult = {
  stocks: KegRow[];
  clients: ClientRow[];
  isLoading: boolean;
  error: string | null;
};

export function useStockData(): UseStockDataResult {
  const [stocks, setStocks] = useState<KegRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [{ data: kegsData, error: kegsError }, { data: clientsData, error: clientsError }] =
          await Promise.all([
            supabase
              .from('kegs')
              .select(`
                id,
                keg_number,
                beer_type,
                brewery_name,
                capacity_liters,
                current_client_id,
                current_etat_fut,
                current_movement_type,
                last_movement_at,
                qr_code_token,
                updated_at
              `)
              .order('updated_at', { ascending: false }),
            supabase
              .from('clients')
              .select('id, name')
              .order('name', { ascending: true }),
          ]);

        if (kegsError) throw kegsError;
        if (clientsError) throw clientsError;

        setStocks(kegsData || []);
        setClients(clientsData || []);
      } catch (err: any) {
        setError(err.message || "Impossible de charger l'état des stocks.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStocks();
  }, []);

  return { stocks, clients, isLoading, error };
}