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
    // Only redirect when loading is complete and session exists
    if (!loading && session) {
      console.log('Login: Session found, redirecting to dashboard');
      navigate('/', { replace: true });
    }
  }, [session, loading, navigate]);

  // Show loading while session is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80] mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // If there's already a session, don't show login form
  if (session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80] mx-auto mb-4"></div>
          <p className="text-gray-400">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#121212] rounded-lg border border-gray-800">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="https://www.pescholar.com/wp-content/uploads/2024/03/cyber-brain-7633488_1280.jpg" 
              alt="Upgrade AI" 
              className="h-16 w-16 rounded-lg object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-white">Upgrade AI</h1>
          <p className="text-gray-400 mt-2">Inicia sesión para continuar</p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            style: {
              button: {
                background: '#00FF80',
                color: '#000000',
                borderRadius: '8px',
                border: 'none',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
              },
              input: {
                background: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#ffffff',
                padding: '12px 16px',
              },
              label: {
                color: '#9ca3af',
                fontSize: '14px',
                fontWeight: '500',
              },
              message: {
                color: '#ef4444',
                fontSize: '14px',
              },
            }
          }}
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