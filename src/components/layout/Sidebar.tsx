import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Upload, 
  Zap,
  FileText,
  Users
} from 'lucide-react';
import { useSession } from '@/contexts/SessionContext';

const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { profile } = useSession();

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Subir PDFs' },
    { to: '/rib', icon: FileText, label: 'Crear Rib' },
  ];

  const adminNavItems = [
    { to: '/admin/users', icon: Users, label: 'Gestión de Usuarios' }
  ];

  return (
    <div 
      className={`relative ${isExpanded ? 'w-64' : 'w-20'} bg-[#121212] border-r border-gray-800 flex flex-col transition-all duration-300 ease-in-out`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-center h-24">
        <div className="flex items-center space-x-3">
          <img src="https://www.pescholar.com/wp-content/uploads/2024/03/cyber-brain-7633488_1280.jpg" alt="Upgrade AI Logo" className="h-10 w-10 flex-shrink-0 rounded-md object-cover" />
          <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'w-32' : 'w-0'}`}>
            <h1 className="text-xl font-bold text-white whitespace-nowrap">Upgrade AI</h1>
            <p className="text-xs text-gray-400 whitespace-nowrap">Análisis Inteligente</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#00FF80]/10 text-[#00FF80]'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  } ${!isExpanded && 'justify-center'}`
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={`text-sm font-medium overflow-hidden transition-all duration-200 whitespace-nowrap ${isExpanded ? 'w-full' : 'w-0'}`}>{item.label}</span>
              </NavLink>
            </li>
          ))}
          {profile?.role === 'ADMINISTRADOR' && (
            <>
              <div className="pt-4">
                <span className={`text-xs text-gray-500 uppercase px-3 transition-all duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Admin</span>
              </div>
              {adminNavItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-[#00FF80]/10 text-[#00FF80]'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      } ${!isExpanded && 'justify-center'}`
                    }
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className={`text-sm font-medium overflow-hidden transition-all duration-200 whitespace-nowrap ${isExpanded ? 'w-full' : 'w-0'}`}>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </>
          )}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className={`flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-[#00FF80]/10 border border-[#00FF80]/20' : 'bg-transparent border border-transparent'} rounded-lg p-3`}>
          <Zap className={`h-4 w-4 text-[#00FF80] flex-shrink-0 ${isExpanded && 'animate-pulse'}`} />
          <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'w-full ml-2' : 'w-0'}`}>
            <p className="text-sm text-[#00FF80] font-medium whitespace-nowrap">IA Activa</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;