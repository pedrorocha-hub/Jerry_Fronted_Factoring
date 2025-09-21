import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Upload, 
  Building2, 
  Users, 
  CreditCard, 
  Scale, 
  Receipt, 
  FileBarChart,
  Brain,
  Zap
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Subir PDFs' },
    { to: '/ficha-ruc', icon: Building2, label: 'Fichas RUC' },
    { to: '/representante-legal', icon: Users, label: 'Representantes' },
    { to: '/cuenta-bancaria', icon: CreditCard, label: 'Cuentas Bancarias' },
    { to: '/vigencia-poderes', icon: Scale, label: 'Vigencia Poderes' },
    { to: '/factura-negociar', icon: Receipt, label: 'Facturas' },
    { to: '/reporte-tributario', icon: FileBarChart, label: 'Reportes Tributarios' },
  ];

  return (
    <div className="w-64 bg-[#121212] border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <img src="https://img.freepik.com/premium-vector/upgrade-button_579710-53.jpg" alt="DocuMind AI Logo" className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-bold text-white">Upgrade AI</h1>
            <p className="text-xs text-gray-400">Análisis Inteligente</p>
          </div>
        </div>
      </div>

      {/* AI Status */}
      <div className="p-4 border-b border-gray-800">
        <div className="bg-[#00FF80]/10 border border-[#00FF80]/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-[#00FF80] animate-pulse" />
            <span className="text-sm text-[#00FF80] font-medium">IA Activa</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Procesando documentos automáticamente
          </p>
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
                      ? 'bg-[#00FF80]/10 text-[#00FF80] border border-[#00FF80]/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Powered by AI Upgrade
          </p>
          <p className="text-xs text-gray-600 mt-1">
            v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;