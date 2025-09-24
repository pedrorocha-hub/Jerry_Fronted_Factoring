import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: 'Administrador' | 'Comercial';
}

type AuthStatus = 'unknown' | 'authed' | 'guest' | 'error';

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
    const fetchProfile = async (user: User) => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        
        setProfile(profileData as Profile);
        setProfileError(null);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfileError(error as Error);
        setProfile(null);
      }
    };

    // Check initial session state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setStatus('authed');
        fetchProfile(session.user);
      } else {
        setStatus('guest');
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setStatus('authed');
        if (session?.user) {
          await fetchProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setStatus('guest');
        setProfile(null);
        setProfileError(null);
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