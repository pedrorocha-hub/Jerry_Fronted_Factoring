import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ClipboardList, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/contexts/SessionContext';

const Sidebar = () => {
  const location = useLocation();
  const { signOut } = useSession();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Upload, label: 'Subir Documentos', path: '/upload' },
    { icon: FileText, label: 'Planilla RIB', path: '/planilla-rib' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-[#0A0A0A] border-r border-gray-800 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Upgrade Title</h1>
        <p className="text-sm text-gray-400">Gestión Financiera</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#00FF80]/10 text-[#00FF80] border border-[#00FF80]/20'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <Button
          onClick={signOut}
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;