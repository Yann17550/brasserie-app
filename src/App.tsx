import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabaseClient';
import { UserProfile, ActivePage } from './types/app';
import { Login } from './components/Login';
import { Navigation } from './components/Navigation';
import { Home } from './components/Home';
import { KegScanner } from './components/KegScanner';
import StockCheck from './components/StockCheck';
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

  // Charge le profil métier lié à l'utilisateur connecté.
  // On garde cette étape séparée car l'utilisateur Supabase Auth ne contient pas
  // toutes les infos nécessaires à l'application (nom complet, rôle).
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
      console.error('Erreur lors de la récupération du profil :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Initialise l'état d'authentification au chargement de l'application.
    // Cette partie gère aussi le cas particulier du reset de mot de passe,
    // où Supabase peut renvoyer un code dans l'URL à échanger contre une session.
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
              console.error('Erreur exchangeCodeForSession :', error);

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

            // Nettoie l'URL après échange du code pour éviter de le conserver
            // dans la barre d'adresse.
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
        console.error("Erreur d'initialisation auth :", err);

        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Écoute les changements de session en temps réel :
    // connexion, déconnexion, récupération de mot de passe, etc.
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

  // Déconnecte l'utilisateur et remet l'interface dans son état initial.
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentPage('accueil');
    setUserProfile(null);
    setRecoveryReady(false);
  };

  // Bloc visuel réutilisé pour éviter de répéter le même style
  // à chaque page réservée aux administrateurs.
  const renderAccessDenied = (message: string) => (
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
      <p>{message}</p>
    </div>
  );

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

  // Cas particulier : la page de changement de mot de passe
  // doit rester accessible même hors navigation classique.
  if (currentPage === 'update_password') {
    return (
      <UpdatePassword
        onBackToLogin={() => setCurrentPage('accueil')}
        recoveryReady={recoveryReady}
      />
    );
  }

  // Si aucune session n'existe, on reste sur les écrans publics :
  // connexion ou mot de passe oublié.
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

  // La session existe, mais on attend encore le profil applicatif.
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
      {currentPage !== 'accueil' && (
        <Navigation
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onLogout={handleLogout}
          userRole={userProfile.role}
        />
      )}

      <main style={{ padding: '16px 20px 24px' }}>
        {currentPage === 'accueil' && (
          <Home
            userProfile={userProfile}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
          />
        )}

        {currentPage === 'scan_keg' && <KegScanner userId={session.user.id} />}

        {currentPage === 'clients' && <ClientCreator />}

        {currentPage === 'check_stock' &&
          (isAdmin ? (
            <StockCheck />
          ) : (
            renderAccessDenied('Cette interface est réservée aux administrateurs.')
          ))}

        {currentPage === 'admin_options' &&
          (isAdmin ? (
            <AdminOptions onNavigate={setCurrentPage} />
          ) : (
            renderAccessDenied('Cette interface est réservée aux administrateurs.')
          ))}

        {currentPage === 'create_keg_identity' &&
          (isAdmin ? (
            <KegIdentityCreator />
          ) : (
            renderAccessDenied(
              "Cette interface de création d'identité de fût est réservée aux administrateurs."
            )
          ))}

        {currentPage === 'create_user' &&
          (isAdmin ? (
            <CreateUser />
          ) : (
            renderAccessDenied('Cette interface est réservée aux administrateurs.')
          ))}
      </main>
    </div>
  );
}

export default App;