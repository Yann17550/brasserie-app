// src/components/stock-check/StockSummaryCards.tsx

import React from 'react';
import type { FiltreStock, StockTotals } from './stockCheck.types';

type Props = {
  filter: FiltreStock;
  totals: StockTotals;
  onFilterChange: (filter: FiltreStock) => void;
};

export function StockSummaryCards({ filter, totals, onFilterChange }: Props) {
  return (
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
        onClick={() => onFilterChange('tous')}
        style={filter === 'tous' ? cardActiveStyle : cardButtonStyle}
      >
        <strong>Total fûts</strong>
        <div style={numberStyle}>{totals.totalFuts}</div>
      </button>

      <button
        type="button"
        onClick={() => onFilterChange('sortis')}
        style={filter === 'sortis' ? cardActiveStyle : cardButtonStyle}
      >
        <strong>Fûts sortis</strong>
        <div style={numberStyle}>{totals.totalSortis}</div>
      </button>

      <button
        type="button"
        onClick={() => onFilterChange('stock_plein')}
        style={filter === 'stock_plein' ? cardActiveStyle : cardButtonStyle}
      >
        <strong>Fûts stockés pleins</strong>
        <div style={numberStyle}>{totals.totalStockesPleins}</div>
      </button>

      <button
        type="button"
        onClick={() => onFilterChange('stock_vide')}
        style={filter === 'stock_vide' ? cardActiveStyle : cardButtonStyle}
      >
        <strong>Fûts stockés vides</strong>
        <div style={numberStyle}>{totals.totalStockesVides}</div>
      </button>
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