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
        // Si hay cualquier error, devolver un perfil por defecto
        console.log('Creating default profile due to error');
        return {
          id: userId,
          role: 'COMERCIAL',
          updated_at: new Date().toISOString(),
          first_name: null,
          last_name: null
        };
      }

      console.log('Profile fetched successfully:', profileData);
      return profileData;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      // En caso de cualquier error, devolver perfil por defecto
      return {
        id: userId,
        role: 'COMERCIAL',
        updated_at: new Date().toISOString(),
        first_name: null,
        last_name: null
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
        console.log('SessionContext: Starting auth initialization...');
        
        // Timeout de seguridad
        initializationTimeout = setTimeout(() => {
          if (mounted && loading) {
            console.warn('SessionContext: Initialization timeout, setting loading to false');
            setLoading(false);
          }
        }, 5000); // 5 segundos máximo

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

        console.log('SessionContext: Session check complete:', currentSession ? 'authenticated' : 'not authenticated');
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Si hay usuario, intentar cargar perfil pero no bloquear la app
        if (currentSession?.user) {
          console.log('SessionContext: User found, loading profile...');
          // No await aquí - cargar perfil en background
          fetchProfile(currentSession.user.id).then(profileData => {
            if (mounted) {
              setProfile(profileData);
              console.log('SessionContext: Profile loaded in background');
            }
          }).catch(error => {
            console.error('SessionContext: Background profile load failed:', error);
            // Crear perfil por defecto si falla
            if (mounted) {
              setProfile({
                id: currentSession.user.id,
                role: 'COMERCIAL',
                updated_at: new Date().toISOString(),
                first_name: null,
                last_name: null
              });
            }
          });
        } else {
          setProfile(null);
        }

        // Siempre terminar la carga aquí
        setLoading(false);
        console.log('SessionContext: Initialization complete');

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

    // Initialize
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('SessionContext: Auth state change:', event);

        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Cargar perfil en background sin bloquear
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
                first_name: null,
                last_name: null
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