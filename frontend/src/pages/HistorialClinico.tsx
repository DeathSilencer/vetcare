import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit2, Trash2, Eye, FileText, Calendar, User } from 'lucide-react';
import { api } from '../api/client.js';
import { HistorialClinico as HistorialType, Paciente } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';
import { formatDate } from '../utils/formatters.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Modal } from '../components/common/Modal.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.js';
import { Table } from '../components/common/Table.js';
import { Pagination } from '../components/common/Pagination.js';

const historialSchema = z.object({
  id_paciente: z.coerce.number().int().positive('Debe seleccionar un paciente'),
  fecha_registro: z.string().min(10, 'La fecha de registro es obligatoria'),
  diagnostico: z.string().min(3, 'El diagnóstico debe tener al menos 3 caracteres'),
  tratamiento: z.string().min(3, 'El tratamiento debe tener al menos 3 caracteres'),
});

type HistorialFormData = z.infer<typeof historialSchema>;

export const HistorialClinico: React.FC = () => {
  const [historiales, setHistoriales] = useState<HistorialType[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedHistorial, setSelectedHistorial] = useState<HistorialType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HistorialFormData>({
    resolver: zodResolver(historialSchema),
  });

  const loadHistoriales = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
      });
      const res = await api.get<{ items: HistorialType[]; total: number; totalPages: number }>(
        `/historiales?${params.toString()}`
      );
      setHistoriales(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar el historial clínico.');
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);

  const loadPacientesList = async () => {
    try {
      const res = await api.get<{ items: Paciente[] }>('/pacientes?limit=100');
      setPacientes(res.items || []);
    } catch {
      // Ignorar
    }
  };

  useEffect(() => {
    loadHistoriales();
    loadPacientesList();
  }, [loadHistoriales]);

  const openCreateModal = () => {
    setSelectedHistorial(null);
    const today = new Date().toISOString().split('T')[0];
    reset({
      id_paciente: pacientes[0]?.id_paciente || 1,
      fecha_registro: today,
      diagnostico: '',
      tratamiento: '',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (h: HistorialType) => {
    setSelectedHistorial(h);
    const dateFormatted = h.fecha_registro.includes('T')
      ? h.fecha_registro.split('T')[0]
      : h.fecha_registro;
    reset({
      id_paciente: h.id_paciente,
      fecha_registro: dateFormatted,
      diagnostico: h.diagnostico,
      tratamiento: h.tratamiento,
    });
    setIsFormModalOpen(true);
  };

  const openDetailModal = (h: HistorialType) => {
    setSelectedHistorial(h);
    setIsDetailModalOpen(true);
  };

  const openDeleteDialog = (h: HistorialType) => {
    setSelectedHistorial(h);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: HistorialFormData) => {
    try {
      if (selectedHistorial) {
        await api.put(`/historiales/${selectedHistorial.id_historial}`, data);
        toast.success('Nota clínica actualizada exitosamente.');
      } else {
        await api.post('/historiales', data);
        toast.success('Nota clínica guardada en el expediente.');
      }
      setIsFormModalOpen(false);
      loadHistoriales();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar la nota clínica.');
    }
  };

  const handleDelete = async () => {
    if (!selectedHistorial) return;
    try {
      setIsDeleting(true);
      await api.delete(`/historiales/${selectedHistorial.id_historial}`);
      toast.success('Registro clínico eliminado correctamente.');
      setIsDeleteDialogOpen(false);
      loadHistoriales();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el registro clínico.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id_historial' as keyof HistorialType,
      className: 'w-14 font-mono text-xs text-slate-400',
    },
    {
      header: 'Fecha Registro',
      accessor: (row: HistorialType) => (
        <span className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800">
          <Calendar className="w-3.5 h-3.5 text-brand-600" />
          <span>{formatDate(row.fecha_registro)}</span>
        </span>
      ),
    },
    {
      header: 'Paciente',
      accessor: (row: HistorialType) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">
            {row.nombre_paciente} <span className="text-slate-400 font-normal">({row.especie_paciente})</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Dueño: {row.nombre_propietario}</p>
        </div>
      ),
    },
    {
      header: 'Diagnóstico Clínico',
      accessor: (row: HistorialType) => (
        <p className="text-xs text-slate-700 font-medium line-clamp-1 max-w-xs">{row.diagnostico}</p>
      ),
    },
    {
      header: 'Tratamiento Prescrito',
      accessor: (row: HistorialType) => (
        <p className="text-xs text-slate-500 line-clamp-1 max-w-xs">{row.tratamiento}</p>
      ),
    },
    {
      header: 'Acciones',
      accessor: (row: HistorialType) => (
        <div className="flex items-center space-x-1 justify-end">
          <button
            onClick={() => openDetailModal(row)}
            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            title="Ver nota completa"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="Editar nota clínica"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteDialog(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Eliminar registro"
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Historial Clínico de Pacientes</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro médico de diagnósticos, evoluciones y tratamientos
          </p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Nueva Nota Clínica
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por diagnóstico, tratamiento, nombre del paciente o dueño..."
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
        <Table columns={columns} data={historiales} isLoading={loading} emptyMessage="No hay registros clínicos disponibles." />
        <Pagination page={page} totalPages={totalPages} total={total} limit={10} onPageChange={setPage} />
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedHistorial ? 'Editar Nota Clínica' : 'Registrar Nota Clínica'}
        subtitle="Capture el diagnóstico médico y el tratamiento prescrito"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Paciente <span className="text-rose-500">*</span>
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm py-2.5 px-3 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500"
                {...register('id_paciente')}
              >
                <option value="">Seleccione paciente...</option>
                {pacientes.map((p) => (
                  <option key={p.id_paciente} value={p.id_paciente}>
                    {p.nombre} ({p.especie}) — Dueño: {p.propietario_nombre}
                  </option>
                ))}
              </select>
              {errors.id_paciente && <p className="mt-1 text-xs text-rose-600">{errors.id_paciente.message}</p>}
            </div>

            <Input
              label="Fecha de Atención"
              type="date"
              error={errors.fecha_registro?.message}
              required
              {...register('fecha_registro')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Diagnóstico Médico <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describa el diagnóstico, síntomas y observaciones..."
              className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm p-3 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500"
              {...register('diagnostico')}
            />
            {errors.diagnostico && <p className="mt-1 text-xs text-rose-600">{errors.diagnostico.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tratamiento Prescrito <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Medicamentos, dosis, recomendaciones y próximos pasos..."
              className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm p-3 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500"
              {...register('tratamiento')}
            />
            {errors.tratamiento && <p className="mt-1 text-xs text-rose-600">{errors.tratamiento.message}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsFormModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {selectedHistorial ? 'Actualizar Nota' : 'Guardar en Historial'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalle de Consulta Clínica"
        maxWidth="md"
      >
        {selectedHistorial && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">{selectedHistorial.nombre_paciente}</p>
                <p className="text-slate-500">
                  {selectedHistorial.especie_paciente} • Dueño: {selectedHistorial.nombre_propietario}
                </p>
              </div>
              <span className="font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {formatDate(selectedHistorial.fecha_registro)}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div>
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-purple-700 mb-1">
                  Diagnóstico:
                </p>
                <p className="text-slate-700 leading-relaxed text-sm">{selectedHistorial.diagnostico}</p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-teal-700 mb-1">
                  Tratamiento:
                </p>
                <p className="text-slate-700 leading-relaxed text-sm">{selectedHistorial.tratamiento}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar Nota Clínica?"
        message="¿Está seguro de que desea eliminar permanentemente este registro clínico? Esta acción es irreversible."
        confirmText="Sí, Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
};
