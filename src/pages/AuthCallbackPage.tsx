import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // The session is handled by the onAuthStateChange listener in SessionContext
    // We just need to redirect the user after Supabase handles the auth callback.
    // A small delay can help ensure the session is set before redirecting.
    const timer = setTimeout(() => {
      navigate('/');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#00FF80] mx-auto" />
        <p className="mt-4 text-white">Autenticando, por favor espera...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;