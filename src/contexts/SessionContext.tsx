import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: 'Administrador' | 'Comercial';
}

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authError: Error | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProfile = async (user: User) => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw new Error(`Error al cargar el perfil: ${profileError.message}. Es posible que no tengas permisos para ver tu propio perfil.`);
        }
        
        setProfile(profileData as Profile);
        setAuthError(null);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setAuthError(error as Error);
        setProfile(null);
      }
    };

    const initializeSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setAuthError(sessionError);
      } else {
        setSession(session);
        if (session?.user) {
          await fetchProfile(session.user);
        }
      }
      setLoading(false);
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          await fetchProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setAuthError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    authError,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};