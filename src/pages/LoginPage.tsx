import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';

const LoginPage = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#121212] rounded-lg shadow-lg border border-gray-800">
        <div>
          <h2 className="text-3xl font-bold text-center text-white">Iniciar Sesión</h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Accede a tu cuenta para continuar
          </p>
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
                button_label: 'Iniciar Sesión',
                email_input_placeholder: 'tu@email.com',
                password_input_placeholder: 'Tu contraseña',
              },
              sign_up: {
                email_label: 'Correo electrónico',
                password_label: 'Contraseña',
                button_label: 'Registrarse',
                email_input_placeholder: 'tu@email.com',
                password_input_placeholder: 'Crea una contraseña',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;