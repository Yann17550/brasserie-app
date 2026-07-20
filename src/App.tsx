// src/App.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabaseClient';
import { UserProfile, ActivePage } from './types/app';
import { Login } from './components/Login';
import { Navigation } from './components/Navigation';
import { Home } from './components/Home';
import { KegScanner } from './components/KegScanner';
import  StockCheck  from './components/StockCheck';
import { KegIdentityCreator } from './components/KegIdentityCreator';
import { ClientCreator } from './components/ClientCreator';
import { AdminOptions } from './components/AdminOptions';
import { CreateUser } from './components/CreateUser';
import { ForgotPassword } from './components/ForgotPassword';
import { UpdatePassword } from './components/UpdatePassword';
import './App.css';

function App() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState<ActivePage>('accueil');
  const [loading, setLoading] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);

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
        const pathname = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        if (pathname === '/update-password') {
          setCurrentPage('update_password');

          if (code) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
              console.error('Erreur exchangeCodeForSession:', error);
              if (isMounted) {
                setRecoveryReady(false);
                setLoading(false);
              }
              return;
            }

            if (!isMounted) return;

            setSession(data.session);
            setRecoveryReady(true);
            setLoading(false);
            window.history.replaceState({}, document.title, '/update-password');
            return;
          }

          const {
            data: { session: existingRecoverySession },
          } = await supabase.auth.getSession();

          if (!isMounted) return;

          setSession(existingRecoverySession);
          setRecoveryReady(!!existingRecoverySession);
          setLoading(false);
          return;
        }

        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        setSession(newSession);
        setRecoveryReady(!!newSession);
        setCurrentPage('update_password');
        setLoading(false);
        return;
      }

      setSession(newSession);

      if (window.location.pathname === '/update-password') {
        setRecoveryReady(!!newSession);
        setCurrentPage('update_password');
        setLoading(false);
        return;
      }

      if (newSession?.user) {
        setLoading(true);
        fetchUserProfile(newSession.user.id);
      } else {
        setUserProfile(null);
        setRecoveryReady(false);
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
    setUserProfile(null);
    setRecoveryReady(false);
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <h3>Chargement de l'application...</h3>
      </div>
    );
  }

  if (currentPage === 'update_password') {
    return (
      <UpdatePassword
        onBackToLogin={() => setCurrentPage('accueil')}
        recoveryReady={recoveryReady}
      />
    );
  }

  if (!session) {
    if (currentPage === 'forgot_password') {
      return <ForgotPassword onBackToLogin={() => setCurrentPage('accueil')} />;
    }

    return (
      <Login
        onLoginSuccess={() => setCurrentPage('accueil')}
        onForgotPassword={() => setCurrentPage('forgot_password')}
      />
    );
  }

  const isAdmin = userProfile?.role === 'administrateur';

  if (!userProfile) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
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

        {currentPage === 'scan_keg' && <KegScanner userId={session.user.id} />}

        {currentPage === 'clients' && <ClientCreator />}

        {currentPage === 'check_stock' &&
          (isAdmin ? (
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
          ))}

        {currentPage === 'admin_options' &&
          (isAdmin ? (
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
          ))}

        {currentPage === 'create_keg_identity' &&
          (isAdmin ? (
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
          ))}

        {currentPage === 'create_user' &&
          (isAdmin ? (
            <CreateUser />
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
          ))}
      </main>
    </div>
  );
}

export default App;