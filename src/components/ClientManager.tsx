// src/components/ClientManager.tsx
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const ClientManager: React.FC = () => {
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from('clients')
      .insert([{ name: clientName.trim() }]);

    if (error) {
      alert(`Erreur : ${error.message}`);
    } else {
      setClientName('');
      alert('Client ajouté avec succès !');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Ajouter un Client</h3>
      <form onSubmit={handleAddClient}>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Nom du client"
          required
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Ajout en cours...' : 'Ajouter'}
        </button>
      </form>
    </div>
  );
};