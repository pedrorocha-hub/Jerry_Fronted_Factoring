import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  role: 'ADMINISTRADOR' | 'COMERCIAL';
  updated_at: string;
  full_name: string | null;
}

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return profileData;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const initializeSession = async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
      } else if (currentSession?.user) {
        const profileData = await fetchProfile(currentSession.user.id);
        setSession(currentSession);
        setUser(currentSession.user);
        setProfile(profileData);
      }
      
      setLoading(false);
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setLoading(true);
        if (newSession?.user) {
          const profileData = await fetchProfile(newSession.user.id);
          setSession(newSession);
          setUser(newSession.user);
          setProfile(profileData);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = profile?.role === 'ADMINISTRADOR';
  const value = { session, user, profile, loading, signOut, isAdmin };

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