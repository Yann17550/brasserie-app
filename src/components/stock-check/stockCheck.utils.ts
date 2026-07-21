// src/components/stock-check/stockCheck.utils.ts

import type {
  ClientRow,
  ColonneTri,
  FiltreStock,
  KegRow,
  SensTri,
  StockTotals,
} from './stockCheck.types';

// Construit une table de correspondance id client -> nom client.
// Cela évite de refaire des recherches répétées dans le tableau des clients.
export function buildClientNameMap(clients: ClientRow[]) {
  return new Map(clients.map((client) => [client.id, client.name]));
}

// Applique le filtre métier choisi par l'utilisateur.
// Règle actuelle : un fût "sorti" n'est plus considéré dans le stock plein/vide.
export function filterStocks(stocks: KegRow[], filter: FiltreStock) {
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
}

// Trie les lignes selon la colonne choisie.
// Le client et la date sont des cas particuliers car leur valeur affichée
// n'est pas directement triable telle quelle depuis la ligne brute.
export function sortStocks(
  stocks: KegRow[],
  sortColumn: ColonneTri,
  sortDirection: SensTri,
  clientNameById: Map<string, string>
) {
  const rows = [...stocks];

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
}

// Calcule les gros compteurs affichés dans les cartes du haut.
export function computeStockTotals(stocks: KegRow[]): StockTotals {
  return {
    totalFuts: stocks.length,
    totalSortis: stocks.filter((keg) => keg.current_movement_type === 'sortie').length,
    totalStockesPleins: stocks.filter(
      (keg) =>
        keg.current_movement_type !== 'sortie' &&
        (keg.current_etat_fut || '').toLowerCase() === 'plein'
    ).length,
    totalStockesVides: stocks.filter(
      (keg) =>
        keg.current_movement_type !== 'sortie' &&
        (keg.current_etat_fut || '').toLowerCase() === 'vide'
    ).length,
  };
}

// Fournit le libellé lisible correspondant au filtre actif.
export function getFilterTitle(filter: FiltreStock) {
  if (filter === 'sortis') return 'Fûts sortis';
  if (filter === 'stock_plein') return 'Fûts stockés pleins';
  if (filter === 'stock_vide') return 'Fûts stockés vides';
  return 'Stock complet';
}

export function getSortIndicator(
  currentColumn: ColonneTri,
  currentDirection: SensTri,
  column: ColonneTri
) {
  if (currentColumn !== column) return '';
  return currentDirection === 'asc' ? ' ↑' : ' ↓';
}