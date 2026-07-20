import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Tables } from '../../database.types';

type KegRow = Tables<'kegs'>;
type ClientRow = Pick<Tables<'clients'>, 'id' | 'name'>;
type FiltreStock = 'tous' | 'sortis' | 'stock_plein' | 'stock_vide';
type ColonneTri =
  | 'keg_number'
  | 'beer_type'
  | 'brewery_name'
  | 'capacity_liters'
  | 'current_movement_type'
  | 'current_etat_fut'
  | 'client'
  | 'last_movement_at';
type SensTri = 'asc' | 'desc';

export default function StockCheck() {
  const [stocks, setStocks] = useState<KegRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [filter, setFilter] = useState<FiltreStock>('tous');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<ColonneTri>('last_movement_at');
  const [sortDirection, setSortDirection] = useState<SensTri>('desc');

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

  const clientNameById = useMemo(() => {
    return new Map(clients.map((client) => [client.id, client.name]));
  }, [clients]);

  const stocksFiltres = useMemo(() => {
    if (filter === 'sortis') {
      return stocks.filter((keg) => keg.current_movement_type === 'sortie');
    }

    if (filter === 'stock_plein') {
      return stocks.filter(
        (keg) =>
          keg.current_movement_type !== 'sortie' &&
          (keg.current_etat_fut || '').toLowerCase() === 'plein'
      );
    }

    if (filter === 'stock_vide') {
      return stocks.filter(
        (keg) =>
          keg.current_movement_type !== 'sortie' &&
          (keg.current_etat_fut || '').toLowerCase() === 'vide'
      );
    }

    return stocks;
  }, [stocks, filter]);

  const stocksAffiches = useMemo(() => {
    const rows = [...stocksFiltres];

    rows.sort((a, b) => {
      let valeurA: string | number = '';
      let valeurB: string | number = '';

      if (sortColumn === 'client') {
        valeurA = a.current_client_id ? clientNameById.get(a.current_client_id) || '' : '';
        valeurB = b.current_client_id ? clientNameById.get(b.current_client_id) || '' : '';
      } else if (sortColumn === 'last_movement_at') {
        valeurA = a.last_movement_at ? new Date(a.last_movement_at).getTime() : 0;
        valeurB = b.last_movement_at ? new Date(b.last_movement_at).getTime() : 0;
      } else {
        valeurA = (a[sortColumn] ?? '') as string | number;
        valeurB = (b[sortColumn] ?? '') as string | number;
      }

      if (typeof valeurA === 'number' && typeof valeurB === 'number') {
        return sortDirection === 'asc' ? valeurA - valeurB : valeurB - valeurA;
      }

      const texteA = String(valeurA).toLowerCase();
      const texteB = String(valeurB).toLowerCase();

      if (texteA < texteB) {
        return sortDirection === 'asc' ? -1 : 1;
      }

      if (texteA > texteB) {
        return sortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });

    return rows;
  }, [stocksFiltres, sortColumn, sortDirection, clientNameById]);

  const totalFuts = stocks.length;
  const totalSortis = stocks.filter((keg) => keg.current_movement_type === 'sortie').length;
  const totalStockesPleins = stocks.filter(
    (keg) =>
      keg.current_movement_type !== 'sortie' &&
      (keg.current_etat_fut || '').toLowerCase() === 'plein'
  ).length;
  const totalStockesVides = stocks.filter(
    (keg) =>
      keg.current_movement_type !== 'sortie' &&
      (keg.current_etat_fut || '').toLowerCase() === 'vide'
  ).length;

  const titreFiltre = useMemo(() => {
    if (filter === 'sortis') return 'Fûts sortis';
    if (filter === 'stock_plein') return 'Fûts stockés pleins';
    if (filter === 'stock_vide') return 'Fûts stockés vides';
    return 'Stock complet';
  }, [filter]);

  const changerTri = (colonne: ColonneTri) => {
    if (sortColumn === colonne) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortColumn(colonne);
    setSortDirection('asc');
  };

  const indicateurTri = (colonne: ColonneTri) => {
    if (sortColumn !== colonne) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginTop: 0 }}>Visualisation du stock</h1>
      <p style={{ color: '#555', marginBottom: '24px' }}>
        Cliquez sur une carte pour afficher les fûts concernés, puis utilisez les titres du tableau pour trier les résultats.
      </p>

      {isLoading && <p>Chargement du stock...</p>}

      {error && (
        <div
          style={{
            color: '#cf1322',
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#fff1f0',
            border: '1px solid #ffa39e',
            borderRadius: '6px',
          }}
        >
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '20px',
            }}
          >
            <button
              type="button"
              onClick={() => setFilter('tous')}
              style={filter === 'tous' ? cardActiveStyle : cardButtonStyle}
            >
              <strong>Total fûts</strong>
              <div style={numberStyle}>{totalFuts}</div>
            </button>

            <button
              type="button"
              onClick={() => setFilter('sortis')}
              style={filter === 'sortis' ? cardActiveStyle : cardButtonStyle}
            >
              <strong>Fûts sortis</strong>
              <div style={numberStyle}>{totalSortis}</div>
            </button>

            <button
              type="button"
              onClick={() => setFilter('stock_plein')}
              style={filter === 'stock_plein' ? cardActiveStyle : cardButtonStyle}
            >
              <strong>Fûts stockés pleins</strong>
              <div style={numberStyle}>{totalStockesPleins}</div>
            </button>

            <button
              type="button"
              onClick={() => setFilter('stock_vide')}
              style={filter === 'stock_vide' ? cardActiveStyle : cardButtonStyle}
            >
              <strong>Fûts stockés vides</strong>
              <div style={numberStyle}>{totalStockesVides}</div>
            </button>
          </div>

          <div
            style={{
              marginBottom: '16px',
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: '#f6f8fa',
              border: '1px solid #e5e7eb',
            }}
          >
            <strong>{titreFiltre}</strong> : {stocksAffiches.length} fût{stocksAffiches.length > 1 ? 's' : ''} concerné{stocksAffiches.length > 1 ? 's' : ''}
          </div>

          {stocksAffiches.length === 0 ? (
            <p>Aucun fût trouvé pour cette sélection.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  backgroundColor: '#fff',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={sortableThStyle} onClick={() => changerTri('keg_number')}>
                      Numéro fût{indicateurTri('keg_number')}
                    </th>
                    <th style={sortableThStyle} onClick={() => changerTri('beer_type')}>
                      Bière{indicateurTri('beer_type')}
                    </th>
                    <th style={sortableThStyle} onClick={() => changerTri('brewery_name')}>
                      Brasserie{indicateurTri('brewery_name')}
                    </th>
                    <th style={sortableThStyle} onClick={() => changerTri('capacity_liters')}>
                      Capacité{indicateurTri('capacity_liters')}
                    </th>
                    <th style={sortableThStyle} onClick={() => changerTri('current_movement_type')}>
                      Mouvement actuel{indicateurTri('current_movement_type')}
                    </th>
                    <th style={sortableThStyle} onClick={() => changerTri('current_etat_fut')}>
                      État actuel{indicateurTri('current_etat_fut')}
                    </th>
                    <th style={sortableThStyle} onClick={() => changerTri('client')}>
                      Client{indicateurTri('client')}
                    </th>
                    <th style={sortableThStyle} onClick={() => changerTri('last_movement_at')}>
                      Dernier mouvement{indicateurTri('last_movement_at')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stocksAffiches.map((keg) => (
                    <tr key={keg.id}>
                      <td style={tdStyle}>{keg.keg_number}</td>
                      <td style={tdStyle}>{keg.beer_type}</td>
                      <td style={tdStyle}>{keg.brewery_name}</td>
                      <td style={tdStyle}>{keg.capacity_liters} L</td>
                      <td style={tdStyle}>{keg.current_movement_type || '—'}</td>
                      <td style={tdStyle}>{keg.current_etat_fut || '—'}</td>
                      <td style={tdStyle}>
                        {keg.current_client_id
                          ? clientNameById.get(keg.current_client_id) || keg.current_client_id
                          : '—'}
                      </td>
                      <td style={tdStyle}>
                        {keg.last_movement_at
                          ? new Date(keg.last_movement_at).toLocaleString('fr-FR')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const cardButtonStyle: React.CSSProperties = {
  minWidth: '180px',
  padding: '14px',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  backgroundColor: '#fff',
  cursor: 'pointer',
  textAlign: 'left',
};

const cardActiveStyle: React.CSSProperties = {
  ...cardButtonStyle,
  border: '1px solid #1677ff',
  backgroundColor: '#eaf3ff',
};

const numberStyle: React.CSSProperties = {
  marginTop: '8px',
  fontSize: '28px',
  fontWeight: 700,
};

const sortableThStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px',
  borderBottom: '1px solid #ddd',
  fontSize: '14px',
  cursor: 'pointer',
  userSelect: 'none',
};

const tdStyle: React.CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid #eee',
  fontSize: '14px',
};