import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, ShieldCheck, Mail, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../api/client.js';
import { User, Role, Veterinario } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { formatDate, formatDateTime } from '../utils/formatters.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Modal } from '../components/common/Modal.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.js';
import { Table } from '../components/common/Table.js';
import { RoleBadge } from '../components/common/Badge.js';

const usuarioSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  correo: z.string().email('Debe ingresar un correo electrónico válido'),
  password: z.string().optional().or(z.literal('')),
  rol: z.enum(['ADMIN', 'RECEPCION', 'VETERINARIO']),
  id_veterinario: z.coerce.number().optional().nullable(),
  activo: z.boolean().default(true),
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

export const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user: currentUser } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
  });

  const selectedRol = watch('rol');

  const loadUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<User[]>('/usuarios');
      setUsuarios(res);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar usuarios.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadVeterinariosList = async () => {
    try {
      const res = await api.get<{ items: Veterinario[] }>('/veterinarios?limit=100');
      setVeterinarios(res.items || []);
    } catch {
      // Ignorar
    }
  };

  useEffect(() => {
    loadUsuarios();
    loadVeterinariosList();
  }, [loadUsuarios]);

  const openCreateModal = () => {
    setSelectedUsuario(null);
    reset({
      nombre: '',
      correo: '',
      password: '',
      rol: 'RECEPCION',
      id_veterinario: null,
      activo: true,
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setSelectedUsuario(u);
    reset({
      nombre: u.nombre,
      correo: u.correo,
      password: '',
      rol: u.rol,
      id_veterinario: u.id_veterinario,
      activo: u.activo !== false,
    });
    setIsFormModalOpen(true);
  };

  const openDeleteDialog = (u: User) => {
    if (u.id_usuario === currentUser?.id_usuario) {
      toast.warning('No puede eliminar su propia cuenta activa de administrador.');
      return;
    }
    setSelectedUsuario(u);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      if (!selectedUsuario && (!data.password || data.password.length < 6)) {
        toast.warning('La contraseña inicial debe tener al menos 6 caracteres.');
        return;
      }

      if (selectedUsuario) {
        await api.put(`/usuarios/${selectedUsuario.id_usuario}`, data);
        toast.success('Usuario actualizado exitosamente.');
      } else {
        await api.post('/usuarios', data);
        toast.success('Usuario creado exitosamente.');
      }
      setIsFormModalOpen(false);
      loadUsuarios();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar el usuario.');
    }
  };

  const handleDelete = async () => {
    if (!selectedUsuario) return;
    try {
      setIsDeleting(true);
      await api.delete(`/usuarios/${selectedUsuario.id_usuario}`);
      toast.success('Usuario eliminado del sistema.');
      setIsDeleteDialogOpen(false);
      loadUsuarios();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el usuario.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id_usuario' as keyof User,
      className: 'w-14 font-mono text-xs text-slate-400',
    },
    {
      header: 'Nombre y Correo',
      accessor: (row: User) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
            {row.nombre.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{row.nombre}</p>
            <p className="text-xs text-slate-400">{row.correo}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Rol',
      accessor: (row: User) => (
        <div className="flex flex-col space-y-1">
          <RoleBadge rol={row.rol} />
          {row.nombre_veterinario && (
            <span className="text-[10px] text-slate-500">Dr. asignado: {row.nombre_veterinario}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Estado',
      accessor: (row: User) =>
        row.activo !== false ? (
          <span className="inline-flex items-center space-x-1 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Activo</span>
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1 text-rose-700 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Inactivo</span>
          </span>
        ),
    },
    {
      header: 'Último Acceso',
      accessor: (row: User) => (
        <span className="text-xs text-slate-500">
          {row.ultimo_login ? formatDateTime(row.ultimo_login) : 'Nunca'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      accessor: (row: User) => (
        <div className="flex items-center space-x-1 justify-end">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="Editar usuario"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteDialog(row)}
            disabled={row.id_usuario === currentUser?.id_usuario}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Eliminar usuario"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Administración de Usuarios y Roles</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de cuentas, perfiles de seguridad y permisos de acceso (Módulo Exclusivo ADMIN)
          </p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Crear Usuario
        </Button>
      </div>

      <Table columns={columns} data={usuarios} isLoading={loading} emptyMessage="No hay usuarios registrados." />

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedUsuario ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        subtitle="Configure los accesos y credenciales del usuario"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre Completo"
            placeholder="Ej. Dra. Carmen Mendoza"
            error={errors.nombre?.message}
            required
            {...register('nombre')}
          />

          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="usuario@vetcare.com"
            error={errors.correo?.message}
            required
            {...register('correo')}
          />

          <Input
            label={selectedUsuario ? 'Nueva Contraseña (dejar en blanco para no cambiarla)' : 'Contraseña Inicial'}
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            required={!selectedUsuario}
            {...register('password')}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Rol del Usuario <span className="text-rose-500">*</span>
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm py-2.5 px-3 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500"
              {...register('rol')}
            >
              <option value="ADMIN">ADMIN — Acceso total y gestión de usuarios</option>
              <option value="RECEPCION">RECEPCION — Gestión de citas, propietarios y pacientes</option>
              <option value="VETERINARIO">VETERINARIO — Agenda médica e historial clínico</option>
            </select>
            {errors.rol && <p className="mt-1 text-xs text-rose-600">{errors.rol.message}</p>}
          </div>

          {selectedRol === 'VETERINARIO' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Vincular a Médico Veterinario (Opcional)
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm py-2.5 px-3 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500"
                {...register('id_veterinario')}
              >
                <option value="">Ninguno / Usuario genérico</option>
                {veterinarios.map((v) => (
                  <option key={v.id_veterinario} value={v.id_veterinario}>
                    {v.nombre} ({v.nombre_especialidad})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="activo-check"
              className="rounded text-brand-600 focus:ring-brand-500"
              {...register('activo')}
            />
            <label htmlFor="activo-check" className="text-sm font-medium text-slate-700 cursor-pointer">
              Cuenta de usuario activa (permite inicio de sesión)
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsFormModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {selectedUsuario ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar Usuario?"
        message={`¿Está seguro de que desea eliminar la cuenta de "${selectedUsuario?.nombre}"? Esta persona ya no podrá ingresar al sistema.`}
        confirmText="Sí, Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
};
