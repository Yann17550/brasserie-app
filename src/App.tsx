// src/App.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabaseClient';
import { UserProfile, ActivePage } from './types/app';
import { Login } from './components/Login';
import { Navigation } from './components/Navigation';
import { Home } from './components/Home';
import { KegScanner } from './components/KegScanner';
import { StockCheck } from './components/StockCheck';
import { KegIdentityCreator } from './components/KegIdentityCreator';
import { ClientCreator } from './components/ClientCreator';
import { AdminOptions } from './components/AdminOptions';
import './App.css';

function App() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState<ActivePage>('accueil');
  const [loading, setLoading] = useState(true);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;

      setSession(newSession);
      if (newSession?.user) {
        setLoading(true);
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

  if (!session) {
    return <Login onLoginSuccess={() => setCurrentPage('accueil')} />;
  }

  const isAdmin = userProfile?.role === 'administrateur';

  if (!userProfile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h3>Chargement du profil utilisateur...</h3>
      </div>
    );
  }

  return (
    <div>
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        userRole={userProfile.role}
      />

      <main style={{ padding: '20px' }}>
        {currentPage === 'accueil' && (
          <Home userProfile={userProfile} onNavigate={setCurrentPage} />
        )}

        {currentPage === 'scan_keg' && (
          <KegScanner userId={session.user.id} />
        )}

        {currentPage === 'clients' && (
          <ClientCreator />
        )}

        {currentPage === 'check_stock' && (
          isAdmin ? (
            <StockCheck />
          ) : (
            <div
              style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '20px',
                backgroundColor: '#fff1f0',
                border: '1px solid #ffa39e',
                borderRadius: '8px',
                color: '#cf1322',
              }}
            >
              <h2>Accès refusé</h2>
              <p>Cette interface est réservée aux administrateurs.</p>
            </div>
          )
        )}

        {currentPage === 'admin_options' && (
          isAdmin ? (
            <AdminOptions onNavigate={setCurrentPage} />
          ) : (
            <div
              style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '20px',
                backgroundColor: '#fff1f0',
                border: '1px solid #ffa39e',
                borderRadius: '8px',
                color: '#cf1322',
              }}
            >
              <h2>Accès refusé</h2>
              <p>Cette interface est réservée aux administrateurs.</p>
            </div>
          )
        )}

        {currentPage === 'create_keg_identity' && (
          isAdmin ? (
            <KegIdentityCreator />
          ) : (
            <div
              style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '20px',
                backgroundColor: '#fff1f0',
                border: '1px solid #ffa39e',
                borderRadius: '8px',
                color: '#cf1322',
              }}
            >
              <h2>Accès refusé</h2>
              <p>
                Cette interface de création d'identité de fût est réservée aux administrateurs.
              </p>
            </div>
          )
        )}

        {currentPage === 'create_user' && (
          isAdmin ? (
            <div
              style={{
                maxWidth: '760px',
                margin: '0 auto',
                padding: '20px',
                backgroundColor: '#f9f9f9',
                border: '1px solid #d9d9d9',
                borderRadius: '10px',
              }}
            >
              <h2 style={{ marginTop: 0 }}>Créer un utilisateur</h2>
              <p style={{ marginBottom: 0 }}>
                Cette page est prête côté visuel. Le branchement réel avec Supabase sera ajouté ensuite.
              </p>
            </div>
          ) : (
            <div
              style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '20px',
                backgroundColor: '#fff1f0',
                border: '1px solid #ffa39e',
                borderRadius: '8px',
                color: '#cf1322',
              }}
            >
              <h2>Accès refusé</h2>
              <p>Cette interface est réservée aux administrateurs.</p>
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default App;