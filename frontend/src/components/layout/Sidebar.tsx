import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  HeartHandshake,
  Stethoscope,
  Award,
  Activity,
  FileText,
  ShieldCheck,
  BarChart3,
  UserCircle,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Ha cerrado sesión exitosamente.');
      navigate('/login');
    } catch {
      toast.error('Error al cerrar sesión.');
    }
  };

  const menuItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/citas', label: 'Citas', icon: CalendarCheck },
    { to: '/propietarios', label: 'Propietarios', icon: Users },
    { to: '/pacientes', label: 'Pacientes', icon: HeartHandshake },
    { to: '/veterinarios', label: 'Veterinarios', icon: Stethoscope },
    { to: '/especialidades', label: 'Especialidades', icon: Award },
    { to: '/servicios', label: 'Servicios', icon: Activity },
    { to: '/historial', label: 'Historial Clínico', icon: FileText },
    ...(user?.rol === 'ADMIN'
      ? [{ to: '/usuarios', label: 'Usuarios', icon: ShieldCheck, badge: 'Admin' }]
      : []),
    { to: '/reportes', label: 'Reportes y Estadísticas', icon: BarChart3 },
    { to: '/perfil', label: 'Configuración de Cuenta', icon: UserCircle },
  ];

  return (
    <>
      {/* Backdrop para móviles */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Encabezado del Menú con Logotipo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">VetCare</span>
              <span className="block text-[10px] text-brand-400 font-semibold tracking-wider uppercase -mt-1">
                Gestión Integral
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Navegación con Scroll */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Módulos del Sistema
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Pie del Menú con Cerrar Sesión */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
