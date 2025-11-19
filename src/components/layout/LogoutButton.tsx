import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error al cerrar sesión');
      console.error('Error signing out:', error);
    } else {
      navigate('/login');
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      className="w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white"
    >
      <LogOut className="h-4 w-4 mr-3" />
      <span>Cerrar Sesión</span>
    </Button>
  );
};

export default LogoutButton;