import { NavLink } from 'react-router-dom';
import { Home, FileText, Users, Upload, BarChart2, ShieldCheck, TrendingUp, FileClock, FolderCheck, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import LogoutButton from './LogoutButton';

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/fichas-ruc', icon: FileText, label: 'Fichas RUC' },
  { href: '/eeff', icon: BarChart2, label: 'EEFF' },
  { href: '/sentinel', icon: ShieldCheck, label: 'Sentinel' },
  { href: '/comportamiento-crediticio', icon: Users, label: 'Comportamiento Crediticio' },
  { href: '/ventas-mensuales', icon: TrendingUp, label: 'Ventas Mensuales' },
  { href: '/rib-reporte-tributario', icon: FileClock, label: 'RIB Reporte Tributario' },
  { href: '/dossiers-guardados', icon: FolderCheck, label: 'Dossiers Guardados' },
  { href: '/solicitudes-operacion', icon: Briefcase, label: 'Solicitudes de Operación' },
  { href: '/upload', icon: Upload, label: 'Subir PDFs' },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-black border-r border-gray-800 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">LCP</h1>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 py-2 text-gray-400 rounded-md hover:bg-gray-800 hover:text-white transition-colors text-sm',
                isActive && 'bg-[#00FF80]/10 text-[#00FF80]'
              )
            }
          >
            <item.icon className="h-4 w-4 mr-3" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 mt-auto">
        <LogoutButton />
      </div>
    </aside>
  );
};

export default Sidebar;