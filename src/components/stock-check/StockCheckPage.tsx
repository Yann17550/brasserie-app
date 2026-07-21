import React, { useMemo, useState } from 'react';
import { StockSummaryCards } from './StockSummaryCards';
import { StockTable } from './StockTable';
import { useStockData } from './useStockData';
import type { ColonneTri, FiltreStock, SensTri } from './stockCheck.types';
import {
  buildClientNameMap,
  computeStockTotals,
  filterStocks,
  getFilterTitle,
  sortStocks,
} from './stockCheck.utils';

export default function StockCheck() {
  const { stocks, clients, isLoading, error } = useStockData();

  const [filter, setFilter] = useState<FiltreStock>('tous');
  const [sortColumn, setSortColumn] = useState<ColonneTri>('last_movement_at');
  const [sortDirection, setSortDirection] = useState<SensTri>('desc');

  // Associe chaque id client à son nom pour simplifier l'affichage
  // et le tri sur la colonne client.
  const clientNameById = useMemo(() => buildClientNameMap(clients), [clients]);

  // Applique le filtre sélectionné par l'utilisateur.
  const filteredStocks = useMemo(() => {
    return filterStocks(stocks, filter);
  }, [stocks, filter]);

  // Applique le tri sur les lignes déjà filtrées.
  const displayedStocks = useMemo(() => {
    return sortStocks(filteredStocks, sortColumn, sortDirection, clientNameById);
  }, [filteredStocks, sortColumn, sortDirection, clientNameById]);

  // Calcule les 4 compteurs affichés en haut de la page.
  const totals = useMemo(() => computeStockTotals(stocks), [stocks]);

  const filterTitle = useMemo(() => getFilterTitle(filter), [filter]);

  const handleSortChange = (column: ColonneTri) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortColumn(column);
    setSortDirection('asc');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginTop: 0 }}>Visualisation du stock</h1>
      <p style={{ color: '#555', marginBottom: '24px' }}>
        Cliquez sur une carte pour afficher les fûts concernés, puis utilisez les titres du
        tableau pour trier les résultats.
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
          <StockSummaryCards
            filter={filter}
            totals={totals}
            onFilterChange={setFilter}
          />

          <div
            style={{
              marginBottom: '16px',
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: '#f6f8fa',
              border: '1px solid #e5e7eb',
            }}
          >
            <strong>{filterTitle}</strong> : {displayedStocks.length} fût
            {displayedStocks.length > 1 ? 's' : ''} concerné
            {displayedStocks.length > 1 ? 's' : ''}
          </div>

          {displayedStocks.length === 0 ? (
            <p>Aucun fût trouvé pour cette sélection.</p>
          ) : (
            <StockTable
              rows={displayedStocks}
              clientNameById={clientNameById}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
            />
          )}
        </>
      )}
    </div>
  );
}