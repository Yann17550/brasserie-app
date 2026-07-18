// src/components/StockCheck.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface KegStock {
  id: string;
  serial_number: string;
  capacity_liters: number;
  current_status: 'disponible' | 'livré' | 'maintenance';
  last_movement_date: string | null;
}

export const StockCheck: React.FC = () => {
  const [stocks, setStocks] = useState<KegStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStockStatus();
  }, []);

  const fetchStockStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      // Récupération de la liste des fûts triés par numéro de série
      const { data, error: fetchError } = await supabase
        .from('kegs')
        .select('id, serial_number, capacity_liters, current_status, last_movement_date')
        .order('serial_number', { ascending: true });

      if (fetchError) throw fetchError;

      setStocks(data || []);
    } catch (err: any) {
      setError(err.message || "Impossible de charger l'état des stocks.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: KegStock['current_status']) => {
    switch (status) {
      case 'disponible': return '#28a745';
      case 'livré': return '#007bff';
      case 'maintenance': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>État des Stocks (Fûts)</h2>
        <button 
          onClick={fetchStockStatus} 
          disabled={loading}
          style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          {loading ? 'Mise à jour...' : '🔄 Actualiser'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {loading && stocks.length === 0 ? (
        <p>Chargement des données...</p>
      ) : stocks.length === 0 ? (
        <p>Aucun fût enregistré dans la base de données pour le moment.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>N° de Série</th>
              <th style={{ padding: '12px' }}>Capacité</th>
              <th style={{ padding: '12px' }}>Statut</th>
              <th style={{ padding: '12px' }}>Dernière activité</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((keg) => (
              <tr key={keg.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{keg.serial_number}</td>
                <td style={{ padding: '12px' }}>{keg.capacity_liters} L</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    backgroundColor: getStatusBadgeColor(keg.current_status), 
                    color: '#fff', 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    textTransform: 'uppercase'
                  }}>
                    {keg.current_status}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#6c757d' }}>
                  {keg.last_movement_date 
                    ? new Date(keg.last_movement_date).toLocaleString('fr-FR') 
                    : 'Aucun mouvement'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};