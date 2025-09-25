import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  role: 'ADMINISTRADOR' | 'COMERCIAL';
  updated_at: string;
  first_name: string | null;
  last_name: string | null;
}

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    let isMounted = true;

    // Set a timeout to prevent an infinite loading state.
    // If no session is found within this time, we assume the user is logged out.
    const loadingTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("Session check timed out. Assuming no active session.");
        setLoading(false);
      }
    }, 2000); // 2-second timeout

    const fetchProfile = async (userId: string) => {
      if (!isMounted) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (isMounted) {
        if (error) {
          console.error('Error fetching profile, signing out:', error);
          await signOut();
        } else {
          setProfile(data);
        }
      }
    };

    // onAuthStateChange is the single source of truth for the session state.
    // It fires once on initial load and then for any auth changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;
      
      clearTimeout(loadingTimeout);

      // A failed token refresh will result in a SIGNED_OUT event and a null session.
      if (event === 'SIGNED_OUT' || !currentSession) {
        await signOut();
        setLoading(false);
        return;
      }

      // When a session is available (initial, signed in, or token refreshed),
      // update the state and fetch the user's profile.
      setSession(currentSession);
      setUser(currentSession.user);
      await fetchProfile(currentSession.user.id);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []); // Empty dependency array ensures this runs only once on mount.

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
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