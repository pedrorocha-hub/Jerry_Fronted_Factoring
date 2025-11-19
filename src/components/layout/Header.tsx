import React from 'react';
import { useSession } from '@/contexts/SessionContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User as UserIcon } from 'lucide-react';

const Header: React.FC = () => {
  const { user, profile, signOut } = useSession();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="flex items-center justify-end h-16 px-6 bg-[#121212] border-b border-gray-800">
      <div className="flex items-center space-x-4">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-3 focus:outline-none p-2 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{profile?.full_name || user.email}</p>
                  {/* <p className="text-xs text-gray-400 capitalize">{profile?.role?.toLowerCase()}</p> */}
                </div>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gray-700 text-white border border-gray-600">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#121212] border-gray-700 text-white" align="end">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="focus:bg-gray-800 focus:text-white cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut} className="focus:bg-red-900/50 focus:text-red-300 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default Header;