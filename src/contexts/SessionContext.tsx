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
        return {
          id: userId,
          role: 'COMERCIAL',
          updated_at: new Date().toISOString(),
          full_name: null
        };
      }

      return profileData;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return {
        id: userId,
        role: 'COMERCIAL',
        updated_at: new Date().toISOString(),
        full_name: null
      };
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
    let mounted = true;
    let initializationTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        initializationTimeout = setTimeout(() => {
          if (mounted && loading) {
            setLoading(false);
          }
        }, 5000);

        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('SessionContext: Error getting session:', error);
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          fetchProfile(currentSession.user.id).then(profileData => {
            if (mounted) {
              setProfile(profileData);
            }
          }).catch(error => {
            console.error('SessionContext: Background profile load failed:', error);
            if (mounted) {
              setProfile({
                id: currentSession.user.id,
                role: 'COMERCIAL',
                updated_at: new Date().toISOString(),
                full_name: null
              });
            }
          });
        } else {
          setProfile(null);
        }

        setLoading(false);

      } catch (error) {
        console.error('SessionContext: Fatal error in initialization:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      } finally {
        if (initializationTimeout) {
          clearTimeout(initializationTimeout);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          fetchProfile(newSession.user.id).then(profileData => {
            if (mounted) {
              setProfile(profileData);
            }
          }).catch(error => {
            console.error('SessionContext: Profile load failed on auth change:', error);
            if (mounted) {
              setProfile({
                id: newSession.user.id,
                role: 'COMERCIAL',
                updated_at: new Date().toISOString(),
                full_name: null
              });
            }
          });
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
      }
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