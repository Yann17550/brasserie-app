// src/components/stock-check/stockCheck.types.ts

import type { Tables } from '../../../database.types';

export type KegRow = Tables<'kegs'>;
export type ClientRow = Pick<Tables<'clients'>, 'id' | 'name'>;

export type FiltreStock = 'tous' | 'sortis' | 'stock_plein' | 'stock_vide';

export type ColonneTri =
  | 'keg_number'
  | 'beer_type'
  | 'brewery_name'
  | 'capacity_liters'
  | 'current_movement_type'
  | 'current_etat_fut'
  | 'client'
  | 'last_movement_at';

export type SensTri = 'asc' | 'desc';

export type StockTotals = {
  totalFuts: number;
  totalSortis: number;
  totalStockesPleins: number;
  totalStockesVides: number;
};