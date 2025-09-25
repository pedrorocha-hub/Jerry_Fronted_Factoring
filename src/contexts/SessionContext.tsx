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

    // onAuthStateChange is the single source of truth.
    // It fires once on initial load and then for any auth changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!isMounted) return;

      // The primary session information is now known. We can stop the main loading state.
      // This is the key change to prevent getting stuck on the loading screen.
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);

      // Now, fetch the secondary profile information in the background.
      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      } else {
        // If there's no session, ensure the profile is cleared.
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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