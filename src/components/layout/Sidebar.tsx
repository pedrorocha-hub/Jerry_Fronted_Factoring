import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, FolderCheck, Building, Upload, Users, Shield, FileSpreadsheet } from 'lucide-react';
import { useSession } from '@/contexts/SessionContext';

const Sidebar: React.FC = () => {
  const { isAdmin } = useSession();

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/solicitudes-operacion', icon: FileText, label: 'Solicitudes de Operación' },
    { to: '/dossiers-guardados', icon: FolderCheck, label: 'Dossiers Guardados' },
    { to: '/fichas-ruc', icon: Building, label: 'Fichas RUC' },
    { to: '/eeff', icon: FileSpreadsheet, label: 'EEFF' },
    { to: '/sentinel', icon: Shield, label: 'Sentinel' },
    { to: '/upload', icon: Upload, label: 'Subir Documentos' },
  ];

  const adminNavItems = [
    { to: '/admin/users', icon: Users, label: 'Gestión de Usuarios' },
  ];

  const linkClasses = "flex items-center px-4 py-3 text-gray-300 rounded-lg transition-colors duration-200";
  const activeLinkClasses = "bg-[#00FF80]/10 text-[#00FF80] font-semibold";

  return (
    <aside className="w-64 bg-[#121212] border-r border-gray-800 flex flex-col">
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">LCP</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : 'hover:bg-gray-800'}`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        {isAdmin && (
          <>
            <div className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Admin
            </div>
            {adminNavItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : 'hover:bg-gray-800'}`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;