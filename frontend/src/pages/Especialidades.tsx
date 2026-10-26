import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit2, Trash2, Award, Users } from 'lucide-react';
import { api } from '../api/client.js';
import { Especialidad } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Modal } from '../components/common/Modal.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.js';
import { Table } from '../components/common/Table.js';

const especialidadSchema = z.object({
  nombre_especialidad: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(50),
});

type EspecialidadFormData = z.infer<typeof especialidadSchema>;

export const Especialidades: React.FC = () => {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<Especialidad | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EspecialidadFormData>({
    resolver: zodResolver(especialidadSchema),
  });

  const loadEspecialidades = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ search });
      const res = await api.get<Especialidad[]>(`/especialidades?${params.toString()}`);
      setEspecialidades(res);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar especialidades.');
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    loadEspecialidades();
  }, [loadEspecialidades]);

  const openCreateModal = () => {
    setSelectedEspecialidad(null);
    reset({ nombre_especialidad: '' });
    setIsFormModalOpen(true);
  };

  const openEditModal = (esp: Especialidad) => {
    setSelectedEspecialidad(esp);
    reset({ nombre_especialidad: esp.nombre_especialidad });
    setIsFormModalOpen(true);
  };

  const openDeleteDialog = (esp: Especialidad) => {
    setSelectedEspecialidad(esp);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: EspecialidadFormData) => {
    try {
      if (selectedEspecialidad) {
        await api.put(`/especialidades/${selectedEspecialidad.id_especialidad}`, data);
        toast.success('Especialidad actualizada correctamente.');
      } else {
        await api.post('/especialidades', data);
        toast.success('Especialidad registrada exitosamente.');
      }
      setIsFormModalOpen(false);
      loadEspecialidades();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar la especialidad.');
    }
  };

  const handleDelete = async () => {
    if (!selectedEspecialidad) return;
    try {
      setIsDeleting(true);
      await api.delete(`/especialidades/${selectedEspecialidad.id_especialidad}`);
      toast.success('Especialidad eliminada correctamente.');
      setIsDeleteDialogOpen(false);
      loadEspecialidades();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar la especialidad.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id_especialidad' as keyof Especialidad,
      className: 'w-16 font-mono text-xs text-slate-400',
    },
    {
      header: 'Nombre de la Especialidad',
      accessor: (row: Especialidad) => (
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
            <Award className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{row.nombre_especialidad}</span>
        </div>
      ),
    },
    {
      header: 'Médicos Vinculados',
      accessor: (row: Especialidad) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          <Users className="w-3 h-3 mr-1 text-indigo-600" />
          {row.total_veterinarios || 0} médico(s)
        </span>
      ),
    },
    {
      header: 'Acciones',
      accessor: (row: Especialidad) => (
        <div className="flex items-center space-x-1 justify-end">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="Editar especialidad"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteDialog(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Eliminar especialidad"
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Especialidades Médicas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Áreas de especialidad clínica veterinaria disponibles
          </p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Nueva Especialidad
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar especialidad médica..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      <Table columns={columns} data={especialidades} isLoading={loading} emptyMessage="No hay especialidades registradas." />

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedEspecialidad ? 'Editar Especialidad' : 'Registrar Nueva Especialidad'}
        subtitle="Defina el nombre oficial de la rama médica veterinaria"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre de la Especialidad"
            placeholder="Ej. Cardiología, Fisioterapia, Dermatología..."
            error={errors.nombre_especialidad?.message}
            required
            {...register('nombre_especialidad')}
          />

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsFormModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {selectedEspecialidad ? 'Guardar Cambios' : 'Registrar'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar Especialidad?"
        message={`¿Está seguro de eliminar la especialidad "${selectedEspecialidad?.nombre_especialidad}"? Esta acción será rechazada automáticamente si existen veterinarios vinculados a ella.`}
        confirmText="Sí, Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
};
