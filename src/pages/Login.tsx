import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';

const Login = () => {
  const { session, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    // Only navigate when the session check is complete and a session exists.
    if (!loading && session) {
      navigate('/', { replace: true });
    }
  }, [session, loading, navigate]);

  // While the session is being checked, show a loading indicator
  // to prevent the login form from flashing.
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80]"></div>
      </div>
    );
  }

  // If loading is done and there's no session, show the login form.
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#121212] rounded-lg border border-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Bienvenido</h1>
          <p className="text-gray-400">Inicia sesión para continuar</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="dark"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Correo electrónico',
                password_label: 'Contraseña',
                button_label: 'Iniciar sesión',
                link_text: '¿Ya tienes una cuenta? Inicia sesión',
              },
              sign_up: {
                email_label: 'Correo electrónico',
                password_label: 'Contraseña',
                button_label: 'Registrarse',
                link_text: '¿No tienes una cuenta? Regístrate',
              },
              forgotten_password: {
                link_text: '¿Olvidaste tu contraseña?',
                email_label: 'Correo electrónico',
                button_label: 'Enviar instrucciones',
              }
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;