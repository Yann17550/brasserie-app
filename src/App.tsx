// src/App.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabaseClient';
import { UserProfile, ActivePage } from './types/app';
import { Login } from './components/Login';
import { Navigation } from './components/Navigation';
import { Home } from './components/Home';
import { KegScanner } from './components/KegScanner';
import { StockCheck } from './components/StockCheck';

function App() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState<ActivePage>('accueil');
  const [loading, setLoading] = useState(true);

  // Récupère le profil et le rôle de l'utilisateur depuis la table réelle 'users_profile'
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users_profile')
        .select('id, full_name, role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserProfile(data as UserProfile);
    } catch (err) {
      console.error("Erreur lors de la récupération du profil :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Vérification de la session existante au premier chargement de manière séquentielle
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(currentSession);
        if (currentSession?.user) {
          await fetchUserProfile(currentSession.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Erreur d'initialisation auth:", err);
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    // 2. Écoute les changements d'état de l'authentification (connexion/déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      
      setSession(newSession);
      if (newSession?.user) {
        setLoading(true); // Re-bascule en chargement le temps de chasser le profil
        fetchUserProfile(newSession.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentPage('accueil');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h3>Chargement de l'application...</h3>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, on lui affiche l'écran de Login
  if (!session) {
    return <Login onLoginSuccess={() => setCurrentPage('accueil')} />;
  }

  // Rendu conditionnel des vues selon la page active
  return (
    <div>
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        onLogout={handleLogout} 
      />
      
      <main style={{ padding: '20px' }}>
        {currentPage === 'accueil' && (
          <Home userProfile={userProfile} onNavigate={setCurrentPage} />
        )}
        
        {currentPage === 'scan_keg' && (
          /* CORRECTION : On passe l'ID de l'opérateur connecté au scanner pour la table keg_movements */
          <KegScanner userId={session.user.id} />
        )}
        
        {currentPage === 'check_stock' && (
          <StockCheck />
        )}
      </main>
    </div>
  );
}

export default App;