import React from 'react';
import type { ColonneTri, KegRow, SensTri } from './stockCheck.types';
import { getSortIndicator } from './stockCheck.utils';

type Props = {
  rows: KegRow[];
  clientNameById: Map<string, string>;
  sortColumn: ColonneTri;
  sortDirection: SensTri;
  onSortChange: (column: ColonneTri) => void;
};

export function StockTable({
  rows,
  clientNameById,
  sortColumn,
  sortDirection,
  onSortChange,
}: Props) {
  return (
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
            <th style={sortableThStyle} onClick={() => onSortChange('keg_number')}>
              Numéro fût{getSortIndicator(sortColumn, sortDirection, 'keg_number')}
            </th>
            <th style={sortableThStyle} onClick={() => onSortChange('beer_type')}>
              Bière{getSortIndicator(sortColumn, sortDirection, 'beer_type')}
            </th>
            <th style={sortableThStyle} onClick={() => onSortChange('brewery_name')}>
              Brasserie{getSortIndicator(sortColumn, sortDirection, 'brewery_name')}
            </th>
            <th style={sortableThStyle} onClick={() => onSortChange('capacity_liters')}>
              Capacité{getSortIndicator(sortColumn, sortDirection, 'capacity_liters')}
            </th>
            <th style={sortableThStyle} onClick={() => onSortChange('current_movement_type')}>
              Mouvement actuel{getSortIndicator(sortColumn, sortDirection, 'current_movement_type')}
            </th>
            <th style={sortableThStyle} onClick={() => onSortChange('current_etat_fut')}>
              État actuel{getSortIndicator(sortColumn, sortDirection, 'current_etat_fut')}
            </th>
            <th style={sortableThStyle} onClick={() => onSortChange('client')}>
              Client{getSortIndicator(sortColumn, sortDirection, 'client')}
            </th>
            <th style={sortableThStyle} onClick={() => onSortChange('last_movement_at')}>
              Dernier mouvement{getSortIndicator(sortColumn, sortDirection, 'last_movement_at')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((keg) => (
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
  );
}

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