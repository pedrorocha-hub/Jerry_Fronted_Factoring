import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: 'Administrador' | 'Comercial';
}

type AuthStatus = 'unknown' | 'authed' | 'guest';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  status: AuthStatus;
  profileError: Error | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('unknown');
  const [profileError, setProfileError] = useState<Error | null>(null);

  useEffect(() => {
    const watchdog = setTimeout(() => {
      if (status === 'unknown') {
        console.error("Supabase auth state did not resolve in 4 seconds. Forcing to 'guest' state.");
        setStatus('guest');
      }
    }, 4000);

    const fetchProfile = async (user: User) => {
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(profileData as Profile);
        setProfileError(null);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfileError(error as Error);
        setProfile(null);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      clearTimeout(watchdog);
      setSession(session);

      if (session && session.user) {
        // Si hay una sesión válida, estamos autenticados.
        if (status !== 'authed') setStatus('authed');
        
        // Si el perfil no está cargado o el usuario cambió, lo cargamos.
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || !profile) {
          await fetchProfile(session.user);
        }
      } else {
        // Si no hay sesión, estamos como invitados.
        setStatus('guest');
        setProfile(null);
        setProfileError(null);
      }
    });

    return () => {
      clearTimeout(watchdog);
      subscription.unsubscribe();
    };
  }, [profile, status]); // Añadimos profile y status para re-evaluar si es necesario

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    status,
    profileError,
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