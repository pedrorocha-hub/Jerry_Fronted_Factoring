import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FolderCheck, Upload, Users, BarChart } from 'lucide-react';
import { useSession } from '@/contexts/SessionContext';

const Sidebar: React.FC = () => {
  const { isAdmin } = useSession();

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/dossiers-guardados', icon: FolderCheck, label: 'RIBs Guardados' },
    { to: '/upload', icon: Upload, label: 'Subir Documentos' },
    { to: '/top-10k', icon: BarChart, label: 'Top 10k' },
  ];

  // const adminNavItems = [
  //   { to: '/admin/users', icon: Users, label: 'Gestión de Usuarios' },
  // ];

  const linkClasses = "flex items-center px-4 py-3 text-gray-300 rounded-lg transition-colors duration-200";
  const activeLinkClasses = "bg-[#00FF80]/10 text-[#00FF80] font-semibold";
  const hoverClasses = "hover:bg-[#00FF80]/10 hover:text-[#00FF80]";

  return (
    <aside className="w-64 bg-[#121212] border-r border-gray-800 flex flex-col">
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">Upgrade AI</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : hoverClasses}`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        {/* Sección de admin oculta */}
        {/* {isAdmin && (
          <>
            <div className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Admin
            </div>
            {adminNavItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : hoverClasses}`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )} */}
      </nav>
    </aside>
  );
};

export default Sidebar;