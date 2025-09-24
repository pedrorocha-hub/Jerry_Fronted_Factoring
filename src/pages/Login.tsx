import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';

const Login = () => {
  const navigate = useNavigate();
  const { session } = useSession();

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#121212] rounded-lg border border-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Bienvenido a Upgrade AI</h1>
          <p className="text-gray-400">Inicia sesión para continuar</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={[]}
          localization={{
            variables: {
              sign_up: {
                email_label: 'Correo electrónico',
                password_label: 'Contraseña',
                button_label: 'Registrarse',
                social_provider_text: 'Iniciar sesión con {{provider}}',
                link_text: '¿No tienes una cuenta? Regístrate',
              },
              sign_in: {
                email_label: 'Correo electrónico',
                password_label: 'Contraseña',
                button_label: 'Iniciar sesión',
                social_provider_text: 'Iniciar sesión con {{provider}}',
                link_text: '¿Ya tienes una cuenta? Inicia sesión',
              },
            },
          }}
          signUpOptions={{
            data: {
              first_name: '',
              last_name: ''
            }
          }}
        />
      </div>
    </div>
  );
};

export default Login;