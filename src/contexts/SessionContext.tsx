import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  full_name: string | null;
  role: 'ADMINISTRADOR' | 'COMERCIAL';
  onboarding_completed: boolean;
  updated_at: string | null;
}

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isOnboardingCompleted: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(true);

  const fetchProfileAndCheckAdmin = async (currentUser: User | null) => {
    if (currentUser) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setProfile(null);
        setIsOnboardingCompleted(false);
      } else {
        setProfile(profileData as Profile);
        // IMPORTANTE: Usar el valor EXACTO de la BD
        // Si es undefined/null, significa que el usuario no tiene perfil (raro), default false
        const onboardingStatus = profileData?.onboarding_completed === true;
        console.log('📊 Onboarding status from DB:', profileData?.onboarding_completed, '→', onboardingStatus, 'for user:', currentUser.email);
        setIsOnboardingCompleted(onboardingStatus);
      }

      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (error) throw error;
        setIsAdmin(data || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    } else {
      // Solo resetear cuando realmente no hay usuario
      setProfile(null);
      setIsAdmin(false);
      // Mantener true por defecto cuando no hay usuario (durante logout/login)
      // Se actualizará cuando se cargue el perfil real
    }
  };

  const refreshProfile = async () => {
    await fetchProfileAndCheckAdmin(user);
  };

  useEffect(() => {
    const getSessionAndSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Si es un cambio de sesión, forzar recarga del perfil
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Trigger re-fetch del perfil
          setTimeout(() => {
            if (session?.user) {
              fetchProfileAndCheckAdmin(session.user);
            }
          }, 100);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
    
    getSessionAndSubscription();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchProfileAndCheckAdmin(user);
    }
  }, [user, loading]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    // No resetear isOnboardingCompleted aquí, se actualizará cuando se vuelva a hacer login
    setIsOnboardingCompleted(true); // Mantener true para evitar flash
  };

  return (
    <SessionContext.Provider value={{ session, user, profile, loading, isAdmin, isOnboardingCompleted, signOut, refreshProfile }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};