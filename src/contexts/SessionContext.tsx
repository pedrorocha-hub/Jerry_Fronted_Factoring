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

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Si hay error de RLS, crear un perfil por defecto
        if (error.code === 'PGRST301' || error.message.includes('row-level security')) {
          console.log('RLS error detected, creating default profile');
          return {
            id: userId,
            role: 'COMERCIAL',
            updated_at: new Date().toISOString(),
            first_name: null,
            last_name: null
          };
        }
        return null;
      }

      console.log('Profile fetched successfully:', profileData);
      return profileData;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('SessionContext: Starting initialization...');
        
        // Set a maximum timeout for the entire initialization
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session initialization timeout')), 8000);
        });

        const sessionPromise = supabase.auth.getSession();

        const { data: { session: currentSession }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (error) {
          console.error('SessionContext: Error getting session:', error);
          throw error;
        }

        if (!mounted) return;

        console.log('SessionContext: Session obtained:', currentSession ? 'exists' : 'null');
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // If there's a user, try to fetch profile but don't block on it
        if (currentSession?.user) {
          console.log('SessionContext: Fetching profile...');
          try {
            const profileData = await fetchProfile(currentSession.user.id);
            if (mounted) {
              setProfile(profileData);
            }
          } catch (profileError) {
            console.error('SessionContext: Profile fetch failed, continuing anyway:', profileError);
            // Continue without profile - the app can still work
          }
        } else {
          setProfile(null);
        }

      } catch (error) {
        console.error('SessionContext: Initialization failed:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          console.log('SessionContext: Initialization complete');
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('SessionContext: Auth state change:', event);

        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user && event === 'SIGNED_IN') {
          console.log('SessionContext: User signed in, fetching profile...');
          try {
            const profileData = await fetchProfile(newSession.user.id);
            if (mounted) {
              setProfile(profileData);
            }
          } catch (error) {
            console.error('SessionContext: Profile fetch failed after sign in:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = { session, user, profile, loading, signOut };

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