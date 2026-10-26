import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  CalendarCheck,
  Clock,
  User,
  Stethoscope,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { api } from '../api/client.js';
import { Cita, Paciente, Veterinario, Servicio } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';
import { formatCurrency, formatDateTime, formatForDateTimeInput } from '../utils/formatters.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Modal } from '../components/common/Modal.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.js';
import { Table } from '../components/common/Table.js';
import { Pagination } from '../components/common/Pagination.js';
import { EstadoCitaBadge } from '../components/common/Badge.js';

const citaFormSchema = z.object({
  fecha_hora: z.string().min(10, 'La fecha y hora son obligatorias'),
  motivo: z.string().min(3, 'El motivo debe tener al menos 3 caracteres').max(255),
  id_paciente: z.coerce.number().int().positive('Debe seleccionar un paciente'),
  id_veterinario: z.coerce.number().int().positive('Debe seleccionar un médico veterinario'),
  estado: z.enum(['pendiente', 'completada', 'cancelada']),
});

type CitaFormData = z.infer<typeof citaFormSchema>;

export const Citas: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [serviciosList, setServiciosList] = useState<Servicio[]>([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [loading, setLoading] = useState(true);

  // Multi-servicio seleccionado en el formulario
  const [selectedServicios, setSelectedServicios] = useState<number[]>([]);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchParams] = useSearchParams();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CitaFormData>({
    resolver: zodResolver(citaFormSchema),
  });

  const loadCitas = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        estado: estadoFilter,
      });
      const res = await api.get<{ items: Cita[]; total: number; totalPages: number }>(
        `/citas?${params.toString()}`
      );
      setCitas(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar citas.');
    } finally {
      setLoading(false);
    }
  }, [page, search, estadoFilter, toast]);

  const loadAuxiliaryData = async () => {
    try {
      const [pRes, vRes, sRes] = await Promise.all([
        api.get<{ items: Paciente[] }>('/pacientes?limit=100'),
        api.get<{ items: Veterinario[] }>('/veterinarios?limit=100'),
        api.get<Servicio[]>('/servicios'),
      ]);
      setPacientes(pRes.items || []);
      setVeterinarios(vRes.items || []);
      setServiciosList(sRes || []);
    } catch {
      // Ignorar
    }
  };

  useEffect(() => {
    loadCitas();
    loadAuxiliaryData();
  }, [loadCitas]);

  useEffect(() => {
    if (searchParams.get('nueva') === 'true') {
      openCreateModal();
    }
  }, [searchParams]);

  const openCreateModal = () => {
    setSelectedCita(null);
    setConflictWarning(null);
    setSelectedServicios([1]); // Servicio de consulta general por defecto
    const now = new Date();
    now.setMinutes(now.getMinutes() + 60);
    reset({
      fecha_hora: formatForDateTimeInput(now.toISOString()),
      motivo: 'Consulta General',
      id_paciente: pacientes[0]?.id_paciente || 1,
      id_veterinario: veterinarios[0]?.id_veterinario || 1,
      estado: 'pendiente',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (cita: Cita) => {
    setSelectedCita(cita);
    setConflictWarning(null);
    setSelectedServicios(cita.servicios ? cita.servicios.map((s) => s.id_servicio) : [1]);
    reset({
      fecha_hora: formatForDateTimeInput(cita.fecha_hora),
      motivo: cita.motivo,
      id_paciente: cita.id_paciente,
      id_veterinario: cita.id_veterinario,
      estado: cita.estado,
    });
    setIsFormModalOpen(true);
  };

  const openDetailModal = async (cita: Cita) => {
    try {
      const full = await api.get<Cita>(`/citas/${cita.id_cita}`);
      setSelectedCita(full);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Error al obtener detalle de la cita.');
    }
  };

  const openDeleteDialog = (cita: Cita) => {
    setSelectedCita(cita);
    setIsDeleteDialogOpen(true);
  };

  const toggleServicio = (id: number) => {
    setSelectedServicios((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((s) => s !== id) : prev) : [...prev, id]
    );
  };

  const calculateTotalPreview = () => {
    return serviciosList
      .filter((s) => selectedServicios.includes(s.id_servicio))
      .reduce((acc, curr) => acc + Number(curr.costo), 0);
  };

  const onSubmit = async (data: CitaFormData) => {
    if (selectedServicios.length === 0) {
      toast.warning('Debe seleccionar al menos un servicio para la cita.');
      return;
    }

    try {
      setConflictWarning(null);
      const payload = {
        ...data,
        servicios: selectedServicios,
      };

      if (selectedCita) {
        await api.put(`/citas/${selectedCita.id_cita}`, payload);
        toast.success('Cita y servicios asociados actualizados.');
      } else {
        await api.post('/citas', payload);
        toast.success('Cita programada exitosamente.');
      }
      setIsFormModalOpen(false);
      loadCitas();
    } catch (err: any) {
      if (err.code === 'SCHEDULE_CONFLICT') {
        setConflictWarning(err.message);
      } else {
        toast.error(err.message || 'Error al guardar la cita.');
      }
    }
  };

  const handleQuickStatusChange = async (citaId: number, nuevoEstado: string) => {
    try {
      await api.patch(`/citas/${citaId}/estado`, { estado: nuevoEstado });
      toast.success(`Cita marcada como '${nuevoEstado}'.`);
      loadCitas();
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar estado.');
    }
  };

  const handleDelete = async () => {
    if (!selectedCita) return;
    try {
      setIsDeleting(true);
      await api.delete(`/citas/${selectedCita.id_cita}`);
      toast.success('Cita eliminada correctamente.');
      setIsDeleteDialogOpen(false);
      loadCitas();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar la cita.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id_cita' as keyof Cita,
      className: 'w-14 font-mono text-xs text-slate-400',
    },
    {
      header: 'Fecha y Hora',
      accessor: (row: Cita) => (
        <div>
          <span className="font-semibold text-slate-900 text-xs block">
            {formatDateTime(row.fecha_hora)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium italic">“{row.motivo}”</span>
        </div>
      ),
    },
    {
      header: 'Paciente y Dueño',
      accessor: (row: Cita) => (
        <div>
          <p className="font-bold text-slate-800 text-xs">
            {row.nombre_paciente}{' '}
            <span className="text-slate-400 font-normal">({row.especie_paciente})</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Dueño: {row.nombre_propietario} ({row.telefono_propietario})
          </p>
        </div>
      ),
    },
    {
      header: 'Médico Veterinario',
      accessor: (row: Cita) => (
        <span className="flex items-center space-x-1.5 text-xs font-medium text-slate-700">
          <Stethoscope className="w-3.5 h-3.5 text-brand-600" />
          <span>{row.nombre_veterinario}</span>
        </span>
      ),
    },
    {
      header: 'Servicios Asignados',
      accessor: (row: Cita) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.servicios && row.servicios.length > 0 ? (
            row.servicios.map((s) => (
              <span
                key={s.id_servicio}
                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
              >
                {s.descripcion}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">Sin servicios</span>
          )}
        </div>
      ),
    },
    {
      header: 'Costo Total',
      accessor: (row: Cita) => (
        <span className="font-bold text-slate-900 font-mono text-xs">
          {formatCurrency(row.costo_total || 0)}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessor: (row: Cita) => <EstadoCitaBadge estado={row.estado} />,
    },
    {
      header: 'Acciones',
      accessor: (row: Cita) => (
        <div className="flex items-center space-x-1 justify-end">
          {/* Botones de acción rápida de estado */}
          {row.estado === 'pendiente' && (
            <button
              onClick={() => handleQuickStatusChange(row.id_cita, 'completada')}
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Marcar como Completada"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

          {row.estado === 'pendiente' && (
            <button
              onClick={() => handleQuickStatusChange(row.id_cita, 'cancelada')}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Cancelar Cita"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => openDetailModal(row)}
            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            title="Ver detalles de la cita"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="Editar cita y servicios"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteDialog(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Eliminar cita"
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Agenda de Citas y Consultas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Programación y control de citas con servicios médicos asociados
          </p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Agendar Cita
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por paciente, dueño, veterinario o motivo..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={estadoFilter}
            onChange={(e) => {
              setEstadoFilter(e.target.value);
              setPage(1);
            }}
            className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700"
          >
            <option value="todos">Todos los Estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <Table columns={columns} data={citas} isLoading={loading} emptyMessage="No hay citas que coincidan con los filtros seleccionados." />
        <Pagination page={page} totalPages={totalPages} total={total} limit={10} onPageChange={setPage} />
      </div>

      {/* Modal Crear / Editar Cita */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedCita ? 'Modificar Cita' : 'Agendar Nueva Cita'}
        subtitle="Seleccione paciente, médico, fecha y los servicios requeridos"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {conflictWarning && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{conflictWarning}</span>
            </div>
          )}

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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Veterinario Asignado <span className="text-rose-500">*</span>
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm py-2.5 px-3 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500"
                {...register('id_veterinario')}
              >
                <option value="">Seleccione médico...</option>
                {veterinarios.map((v) => (
                  <option key={v.id_veterinario} value={v.id_veterinario}>
                    {v.nombre} ({v.nombre_especialidad})
                  </option>
                ))}
              </select>
              {errors.id_veterinario && (
                <p className="mt-1 text-xs text-rose-600">{errors.id_veterinario.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Fecha y Hora de la Cita"
              type="datetime-local"
              error={errors.fecha_hora?.message}
              required
              {...register('fecha_hora')}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Estado de la Cita <span className="text-rose-500">*</span>
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm py-2.5 px-3 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500"
                {...register('estado')}
              >
                <option value="pendiente">Pendiente</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <Input
            label="Motivo de la Cita"
            placeholder="Ej. Vacunación anual, revisión bucal, cojea de pata izquierda..."
            error={errors.motivo?.message}
            required
            {...register('motivo')}
          />

          {/* Selector de Servicios Múltiples */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Servicios a Realizar <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-semibold text-brand-600">
                Total Estimado: {formatCurrency(calculateTotalPreview())}
              </span>
            </div>

            <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl p-2.5 space-y-1.5 bg-slate-50/50">
              {serviciosList.map((serv) => {
                const isChecked = selectedServicios.includes(serv.id_servicio);
                return (
                  <label
                    key={serv.id_servicio}
                    onClick={() => toggleServicio(serv.id_servicio)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                      isChecked
                        ? 'bg-brand-50 border border-brand-300 text-brand-900 font-semibold'
                        : 'hover:bg-slate-100 border border-transparent text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Manejado por onClick en label
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />
                      <span>{serv.descripcion}</span>
                    </div>
                    <span className="font-mono text-slate-600">{formatCurrency(serv.costo)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsFormModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {selectedCita ? 'Actualizar Cita' : 'Agendar Cita'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalle de Cita */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalles de la Cita Médica"
        maxWidth="md"
      >
        {selectedCita && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">
                  {formatDateTime(selectedCita.fecha_hora)}
                </span>
                <EstadoCitaBadge estado={selectedCita.estado} />
              </div>
              <p className="text-slate-600">
                <span className="font-semibold text-slate-700">Motivo:</span> {selectedCita.motivo}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800 text-xs mb-1">Paciente</p>
                <p className="font-medium text-slate-900">{selectedCita.nombre_paciente}</p>
                <p className="text-slate-500">{selectedCita.especie_paciente}</p>
                <p className="text-slate-400 mt-1">Dueño: {selectedCita.nombre_propietario}</p>
                <p className="text-slate-400 font-mono">Tel: {selectedCita.telefono_propietario}</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800 text-xs mb-1">Veterinario</p>
                <p className="font-medium text-slate-900">{selectedCita.nombre_veterinario}</p>
                <p className="text-slate-500">{selectedCita.nombre_especialidad}</p>
              </div>
            </div>

            <div>
              <p className="font-bold text-xs uppercase text-slate-500 mb-2">Servicios y Costos</p>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs">
                {selectedCita.servicios && selectedCita.servicios.length > 0 ? (
                  selectedCita.servicios.map((s) => (
                    <div key={s.id_servicio} className="p-2.5 flex justify-between bg-white">
                      <span className="text-slate-700">{s.descripcion}</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatCurrency(s.costo)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-center text-slate-400 italic">Sin servicios asignados</p>
                )}
                <div className="p-3 bg-slate-50 flex justify-between font-bold text-slate-900">
                  <span>Costo Total de la Cita:</span>
                  <span className="font-mono text-brand-700 text-sm">
                    {formatCurrency(selectedCita.costo_total || 0)}
                  </span>
                </div>
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

      {/* Confirmación Eliminación */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar Cita?"
        message={`¿Está seguro de que desea eliminar la cita programada para "${selectedCita?.nombre_paciente}"? Esta acción cancelará la cita y eliminará sus servicios vinculados mediante una transacción segura.`}
        confirmText="Sí, Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
};
