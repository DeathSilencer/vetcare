import React from 'react';
import { Role, CitaEstado } from '../../types/index.js';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'rose' | 'slate' | 'sky' | 'indigo';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
}) => {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200/80',
    sky: 'bg-sky-50 text-sky-700 border-sky-200/80',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
};

export const EstadoCitaBadge: React.FC<{ estado: CitaEstado | string }> = ({ estado }) => {
  switch (estado) {
    case 'completada':
      return <Badge variant="emerald">Completada</Badge>;
    case 'pendiente':
      return <Badge variant="amber">Pendiente</Badge>;
    case 'cancelada':
      return <Badge variant="rose">Cancelada</Badge>;
    default:
      return <Badge variant="slate">{estado}</Badge>;
  }
};

export const RoleBadge: React.FC<{ rol: Role | string }> = ({ rol }) => {
  switch (rol) {
    case 'ADMIN':
      return <Badge variant="indigo">Administrador</Badge>;
    case 'RECEPCION':
      return <Badge variant="sky">Recepción</Badge>;
    case 'VETERINARIO':
      return <Badge variant="emerald">Veterinario</Badge>;
    default:
      return <Badge variant="slate">{rol}</Badge>;
  }
};
