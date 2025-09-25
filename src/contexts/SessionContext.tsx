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
    const initializeSession = async () => {
      // 1. Get the initial session state quickly.
      const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting initial session:", sessionError);
        setLoading(false);
        return;
      }

      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        
        // 2. Fetch profile if a session exists.
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', initialSession.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile on init, signing out:", profileError);
          await signOut();
        } else {
          setProfile(profileData);
        }
      }
      
      // 3. Mark initial loading as complete.
      setLoading(false);
    };

    initializeSession();

    // 4. Listen for subsequent auth state changes (e.g., token refresh, sign out).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile on auth change, signing out:", profileError);
          await signOut();
        } else {
          setProfile(profileData);
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
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