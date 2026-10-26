import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit2, Trash2, Stethoscope, Phone, Award } from 'lucide-react';
import { api } from '../api/client.js';
import { Veterinario, Especialidad } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Modal } from '../components/common/Modal.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.js';
import { Table } from '../components/common/Table.js';
import { Pagination } from '../components/common/Pagination.js';

const veterinarioSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  telefono: z.string().max(15).optional().or(z.literal('')),
  id_especialidad: z.coerce.number().int().positive('Debe seleccionar una especialidad'),
});

type VeterinarioFormData = z.infer<typeof veterinarioSchema>;

export const Veterinarios: React.FC = () => {
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVeterinario, setSelectedVeterinario] = useState<Veterinario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VeterinarioFormData>({
    resolver: zodResolver(veterinarioSchema),
  });

  const loadVeterinarios = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
      });
      const res = await api.get<{ items: Veterinario[]; total: number; totalPages: number }>(
        `/veterinarios?${params.toString()}`
      );
      setVeterinarios(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar veterinarios.');
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);

  const loadEspecialidades = async () => {
    try {
      const res = await api.get<Especialidad[]>('/especialidades');
      setEspecialidades(res || []);
    } catch {
      // Ignorar
    }
  };

  useEffect(() => {
    loadVeterinarios();
    loadEspecialidades();
  }, [loadVeterinarios]);

  const openCreateModal = () => {
    setSelectedVeterinario(null);
    reset({ nombre: '', telefono: '', id_especialidad: 1 });
    setIsFormModalOpen(true);
  };

  const openEditModal = (vet: Veterinario) => {
    setSelectedVeterinario(vet);
    reset({
      nombre: vet.nombre,
      telefono: vet.telefono || '',
      id_especialidad: vet.id_especialidad || 1,
    });
    setIsFormModalOpen(true);
  };

  const openDeleteDialog = (vet: Veterinario) => {
    setSelectedVeterinario(vet);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: VeterinarioFormData) => {
    try {
      if (selectedVeterinario) {
        await api.put(`/veterinarios/${selectedVeterinario.id_veterinario}`, data);
        toast.success('Veterinario actualizado correctamente.');
      } else {
        await api.post('/veterinarios', data);
        toast.success('Veterinario registrado exitosamente.');
      }
      setIsFormModalOpen(false);
      loadVeterinarios();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar veterinario.');
    }
  };

  const handleDelete = async () => {
    if (!selectedVeterinario) return;
    try {
      setIsDeleting(true);
      await api.delete(`/veterinarios/${selectedVeterinario.id_veterinario}`);
      toast.success('Veterinario eliminado correctamente.');
      setIsDeleteDialogOpen(false);
      loadVeterinarios();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el veterinario.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id_veterinario' as keyof Veterinario,
      className: 'w-16 font-mono text-xs text-slate-400',
    },
    {
      header: 'Médico Veterinario',
      accessor: (row: Veterinario) => (
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">{row.nombre}</p>
            <p className="text-xs text-slate-400 font-mono flex items-center space-x-1 mt-0.5">
              <Phone className="w-3 h-3" />
              <span>{row.telefono || 'Sin teléfono'}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Especialidad',
      accessor: (row: Veterinario) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Award className="w-3 h-3 mr-1" />
          {row.nombre_especialidad || 'General'}
        </span>
      ),
    },
    {
      header: 'Citas Atendidas',
      accessor: (row: Veterinario) => (
        <span className="text-xs font-medium text-slate-600">
          {row.total_citas || 0} cita(s)
        </span>
      ),
    },
    {
      header: 'Acciones',
      accessor: (row: Veterinario) => (
        <div className="flex items-center space-x-1 justify-end">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="Editar veterinario"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteDialog(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Eliminar veterinario"
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cuerpo Médico Veterinario</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Especialistas médicos y doctores adscritos a la clínica
          </p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Nuevo Veterinario
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, especialidad o teléfono..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Table columns={columns} data={veterinarios} isLoading={loading} emptyMessage="No hay veterinarios registrados." />
        <Pagination page={page} totalPages={totalPages} total={total} limit={10} onPageChange={setPage} />
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedVeterinario ? 'Editar Veterinario' : 'Registrar Nuevo Veterinario'}
        subtitle="Asigne los datos del médico y su especialidad"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre Completo"
            placeholder="Ej. Dr. Roberto Gómez"
            error={errors.nombre?.message}
            required
            {...register('nombre')}
          />

          <Input
            label="Teléfono Móvil (Opcional)"
            placeholder="Ej. 5551239874"
            error={errors.telefono?.message}
            {...register('telefono')}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Especialidad Médica <span className="text-rose-500">*</span>
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm py-2.5 px-3 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500"
              {...register('id_especialidad')}
            >
              <option value="">Seleccione especialidad...</option>
              {especialidades.map((e) => (
                <option key={e.id_especialidad} value={e.id_especialidad}>
                  {e.nombre_especialidad}
                </option>
              ))}
            </select>
            {errors.id_especialidad && (
              <p className="mt-1 text-xs text-rose-600">{errors.id_especialidad.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsFormModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {selectedVeterinario ? 'Actualizar Médico' : 'Guardar Veterinario'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar Veterinario?"
        message={`¿Está seguro de eliminar al veterinario "${selectedVeterinario?.nombre}"? Esta acción será denegada si el médico tiene citas asignadas.`}
        confirmText="Sí, Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
};
