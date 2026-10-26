import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit2, Trash2, Activity, DollarSign, CheckCircle } from 'lucide-react';
import { api } from '../api/client.js';
import { Servicio } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';
import { formatCurrency } from '../utils/formatters.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Modal } from '../components/common/Modal.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.js';
import { Table } from '../components/common/Table.js';

const servicioSchema = z.object({
  descripcion: z.string().min(3, 'La descripción debe tener al menos 3 caracteres').max(100),
  costo: z.coerce.number().min(0, 'El costo no puede ser negativo'),
});

type ServicioFormData = z.infer<typeof servicioSchema>;

export const Servicios: React.FC = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServicioFormData>({
    resolver: zodResolver(servicioSchema),
  });

  const loadServicios = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ search });
      const res = await api.get<Servicio[]>(`/servicios?${params.toString()}`);
      setServicios(res);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar servicios.');
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    loadServicios();
  }, [loadServicios]);

  const openCreateModal = () => {
    setSelectedServicio(null);
    reset({ descripcion: '', costo: 0 });
    setIsFormModalOpen(true);
  };

  const openEditModal = (s: Servicio) => {
    setSelectedServicio(s);
    reset({ descripcion: s.descripcion, costo: s.costo });
    setIsFormModalOpen(true);
  };

  const openDeleteDialog = (s: Servicio) => {
    setSelectedServicio(s);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: ServicioFormData) => {
    try {
      if (selectedServicio) {
        await api.put(`/servicios/${selectedServicio.id_servicio}`, data);
        toast.success('Servicio actualizado correctamente.');
      } else {
        await api.post('/servicios', data);
        toast.success('Servicio registrado exitosamente.');
      }
      setIsFormModalOpen(false);
      loadServicios();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar el servicio.');
    }
  };

  const handleDelete = async () => {
    if (!selectedServicio) return;
    try {
      setIsDeleting(true);
      await api.delete(`/servicios/${selectedServicio.id_servicio}`);
      toast.success('Servicio eliminado correctamente.');
      setIsDeleteDialogOpen(false);
      loadServicios();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el servicio.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id_servicio' as keyof Servicio,
      className: 'w-16 font-mono text-xs text-slate-400',
    },
    {
      header: 'Descripción del Servicio',
      accessor: (row: Servicio) => (
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{row.descripcion}</span>
        </div>
      ),
    },
    {
      header: 'Costo Unitario',
      accessor: (row: Servicio) => (
        <span className="font-bold text-slate-900 font-mono text-sm">
          {formatCurrency(row.costo)}
        </span>
      ),
    },
    {
      header: 'Demanda Registrada',
      accessor: (row: Servicio) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
          {row.veces_solicitado || 0} cita(s)
        </span>
      ),
    },
    {
      header: 'Acciones',
      accessor: (row: Servicio) => (
        <div className="flex items-center space-x-1 justify-end">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="Editar servicio"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteDialog(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Eliminar servicio"
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Catálogo de Servicios</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tarifas y catálogo médico de procedimientos y consultas veterinarias
          </p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Nuevo Servicio
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar procedimiento o consulta por descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      <Table columns={columns} data={servicios} isLoading={loading} emptyMessage="No hay servicios registrados." />

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedServicio ? 'Editar Servicio' : 'Registrar Nuevo Servicio'}
        subtitle="Defina la descripción del procedimiento y su costo en MXN"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Descripción del Servicio"
            placeholder="Ej. Vacuna Rabia, Limpieza Dental..."
            error={errors.descripcion?.message}
            required
            {...register('descripcion')}
          />

          <Input
            label="Costo ($ MXN)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            leftIcon={<DollarSign className="w-4 h-4" />}
            error={errors.costo?.message}
            required
            {...register('costo')}
          />

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsFormModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {selectedServicio ? 'Guardar Cambios' : 'Registrar Servicio'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar Servicio?"
        message={`¿Está seguro de eliminar el servicio "${selectedServicio?.descripcion}"? Si ya ha sido asignado a citas previas, el sistema bloqueará la eliminación para proteger el historial contable.`}
        confirmText="Sí, Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
};
