import React from 'react';
import { Menu, Database, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { RoleBadge } from '../common/Badge.js';

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, title }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>}
      </div>

      <div className="flex items-center space-x-4">
        {/* Indicador de conexión con MySQL */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Database className="w-3.5 h-3.5" />
          <span>MySQL Conectado</span>
        </div>

        {/* Información del Usuario */}
        {user && (
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-semibold text-slate-800 leading-tight">
                  {user.nombre}
                </span>
                <RoleBadge rol={user.rol} />
              </div>
              <span className="text-xs text-slate-500">{user.correo}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
