import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCircle, Shield, KeyRound, Mail, User as UserIcon } from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { RoleBadge } from '../components/common/Badge.js';
import { formatDateTime } from '../utils/formatters.js';

const perfilSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  correo: z.string().email('Debe ingresar un correo electrónico válido'),
  passwordActual: z.string().optional().or(z.literal('')),
  passwordNuevo: z.string().optional().or(z.literal('')),
});

type PerfilFormData = z.infer<typeof perfilSchema>;

export const Perfil: React.FC = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nombre: user?.nombre || '',
      correo: user?.correo || '',
      passwordActual: '',
      passwordNuevo: '',
    },
  });

  const onSubmit = async (data: PerfilFormData) => {
    try {
      const payload: any = {
        nombre: data.nombre,
        correo: data.correo,
      };

      if (data.passwordNuevo && data.passwordNuevo.trim() !== '') {
        if (!data.passwordActual || data.passwordActual.trim() === '') {
          toast.warning('Debe proporcionar su contraseña actual para establecer una nueva.');
          return;
        }
        if (data.passwordNuevo.length < 6) {
          toast.warning('La nueva contraseña debe tener al menos 6 caracteres.');
          return;
        }
        payload.passwordActual = data.passwordActual;
        payload.passwordNuevo = data.passwordNuevo;
      }

      const res = await api.put<{ user: any }>('/auth/perfil', payload);
      updateUser(res.user);
      reset({
        nombre: res.user.nombre,
        correo: res.user.correo,
        passwordActual: '',
        passwordNuevo: '',
      });
      toast.success('Perfil actualizado correctamente.');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar el perfil.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Configuración de Cuenta</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Gestione su información personal y credenciales de acceso al sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de Resumen */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold text-2xl shadow-md mb-4">
            {user?.nombre.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-base font-bold text-slate-900">{user?.nombre}</h3>
          <p className="text-xs text-slate-500 mb-3">{user?.correo}</p>
          <RoleBadge rol={user?.rol || 'RECEPCION'} />

          <div className="w-full pt-6 mt-6 border-t border-slate-100 text-left text-xs space-y-2 text-slate-600">
            {user?.nombre_veterinario && (
              <p>
                <span className="font-semibold text-slate-800">Médico asignado:</span> {user.nombre_veterinario}
              </p>
            )}
            <p>
              <span className="font-semibold text-slate-800">Último acceso:</span>{' '}
              {user?.ultimo_login ? formatDateTime(user.ultimo_login) : 'Sesión activa actual'}
            </p>
          </div>
        </div>

        {/* Formulario de Modificación */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Actualizar Información</h3>
          <p className="text-xs text-slate-500 mb-6">Modifique su nombre, correo o contraseña de acceso</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nombre Completo"
              leftIcon={<UserIcon className="w-4 h-4" />}
              error={errors.nombre?.message}
              required
              {...register('nombre')}
            />

            <Input
              label="Correo Electrónico"
              type="email"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.correo?.message}
              required
              {...register('correo')}
            />

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center space-x-1.5">
                <KeyRound className="w-4 h-4 text-brand-600" />
                <span>Cambio de Contraseña (Opcional)</span>
              </h4>

              <div className="space-y-3">
                <Input
                  label="Contraseña Actual"
                  type="password"
                  placeholder="Ingrese contraseña actual para autorizar cambios"
                  error={errors.passwordActual?.message}
                  {...register('passwordActual')}
                />

                <Input
                  label="Nueva Contraseña"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  error={errors.passwordNuevo?.message}
                  {...register('passwordNuevo')}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" isLoading={isSubmitting}>
                Guardar Cambios de Cuenta
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
