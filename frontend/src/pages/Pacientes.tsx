import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit2, Trash2, Eye, HeartHandshake, FileText, CalendarCheck, User } from 'lucide-react';
import { api } from '../api/client.js';
import { Paciente, Propietario } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Modal } from '../components/common/Modal.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.js';
import { Table } from '../components/common/Table.js';
import { Pagination } from '../components/common/Pagination.js';
import { EstadoCitaBadge } from '../components/common/Badge.js';
import { formatDate, formatDateTime } from '../utils/formatters.js';

const pacienteSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  especie: z.string().min(2, 'La especie es obligatoria').max(50),
  raza: z.string().max(50).optional().or(z.literal('')),
  id_propietario: z.coerce.number().int().positive('Debe seleccionar un propietario'),
});

type PacienteFormData = z.infer<typeof pacienteSchema>;

export const Pacientes: React.FC = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [especieFilter, setEspecieFilter] = useState('todas');
  const [loading, setLoading] = useState(true);

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchParams] = useSearchParams();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
  });

  const loadPacientes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        especie: especieFilter,
      });
      const res = await api.get<{ items: Paciente[]; total: number; totalPages: number }>(
        `/pacientes?${params.toString()}`
      );
      setPacientes(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar pacientes.');
    } finally {
      setLoading(false);
    }
  }, [page, search, especieFilter, toast]);

  const loadPropietariosList = async () => {
    try {
      const res = await api.get<{ items: Propietario[] }>('/propietarios?limit=100');
      setPropietarios(res.items || []);
    } catch {
      // Ignorar
    }
  };

  useEffect(() => {
    loadPacientes();
    loadPropietariosList();
  }, [loadPacientes]);

  useEffect(() => {
    if (searchParams.get('nuevo') === 'true') {
      openCreateModal();
    }
  }, [searchParams]);

  const openCreateModal = () => {
    setSelectedPaciente(null);
    reset({ nombre: '', especie: 'Perro', raza: '', id_propietario: 1 });
    setIsFormModalOpen(true);
  };

  const openEditModal = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    reset({
      nombre: paciente.nombre,
      especie: paciente.especie,
      raza: paciente.raza || '',
      id_propietario: paciente.id_propietario || 1,
    });
    setIsFormModalOpen(true);
  };

  const openDetailModal = async (paciente: Paciente) => {
    try {
      const full = await api.get(`/pacientes/${paciente.id_paciente}`);
      setSelectedPaciente(full);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Error al obtener la ficha médica del paciente.');
    }
  };

  const openDeleteDialog = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: PacienteFormData) => {
    try {
      if (selectedPaciente?.id_paciente) {
        await api.put(`/pacientes/${selectedPaciente.id_paciente}`, data);
        toast.success('Paciente actualizado correctamente.');
      } else {
        await api.post('/pacientes', data);
        toast.success('Paciente registrado exitosamente.');
      }
      setIsFormModalOpen(false);
      loadPacientes();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar el paciente.');
    }
  };

  const handleDelete = async () => {
    if (!selectedPaciente) return;
    try {
      setIsDeleting(true);
      await api.delete(`/pacientes/${selectedPaciente.id_paciente}`);
      toast.success('Paciente eliminado correctamente.');
      setIsDeleteDialogOpen(false);
      loadPacientes();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el paciente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id_paciente' as keyof Paciente,
      className: 'w-16 font-mono text-xs text-slate-400',
    },
    {
      header: 'Paciente',
      accessor: (row: Paciente) => (
        <div>
          <p className="font-bold text-slate-900 text-sm">{row.nombre}</p>
          <p className="text-xs text-slate-500">
            {row.especie} • <span className="text-slate-400">{row.raza || 'Mestizo'}</span>
          </p>
        </div>
      ),
    },
    {
      header: 'Propietario Asociado',
      accessor: (row: Paciente) => (
        <div>
          <p className="font-medium text-slate-800 text-xs">{row.propietario_nombre || 'Sin propietario'}</p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{row.propietario_telefono}</p>
        </div>
      ),
    },
    {
      header: 'Acciones',
      accessor: (row: Paciente) => (
        <div className="flex items-center space-x-1 justify-end">
          <button
            onClick={() => openDetailModal(row)}
            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            title="Ver expediente clínico"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="Editar datos"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteDialog(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Eliminar paciente"
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
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Expediente de Pacientes</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro y control de las mascotas atendidas en VetCare
          </p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Registrar Paciente
        </Button>
      </div>

      {/* Filtros y Buscador */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de mascota, raza o nombre del dueño..."
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
            value={especieFilter}
            onChange={(e) => {
              setEspecieFilter(e.target.value);
              setPage(1);
            }}
            className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700"
          >
            <option value="todas">Todas las Especies</option>
            <option value="Perro">Perros</option>
            <option value="Gato">Gatos</option>
            <option value="Ave">Aves</option>
            <option value="Roedor">Roedores</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="space-y-4">
        <Table columns={columns} data={pacientes} isLoading={loading} emptyMessage="No hay pacientes registrados con ese criterio." />
        <Pagination page={page} totalPages={totalPages} total={total} limit={10} onPageChange={setPage} />
      </div>

      {/* Modal Formulario Crear / Editar */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedPaciente?.id_paciente ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
        subtitle="Asigne los datos del paciente y su propietario responsable"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre del Paciente"
            placeholder="Ej. Max, Luna, Toby..."
            error={errors.nombre?.message}
            required
            {...register('nombre')}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Especie <span className="text-rose-500">*</span>
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm py-2.5 px-3 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500"
                {...register('especie')}
              >
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Ave">Ave</option>
                <option value="Roedor">Roedor</option>
                <option value="Exótico">Exótico</option>
              </select>
              {errors.especie && <p className="mt-1 text-xs text-rose-600">{errors.especie.message}</p>}
            </div>

            <Input
              label="Raza (Opcional)"
              placeholder="Ej. Labrador, Siamés..."
              error={errors.raza?.message}
              {...register('raza')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Propietario Responsable <span className="text-rose-500">*</span>
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm py-2.5 px-3 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500"
              {...register('id_propietario')}
            >
              <option value="">Seleccione un propietario...</option>
              {propietarios.map((p) => (
                <option key={p.id_propietario} value={p.id_propietario}>
                  {p.nombre} ({p.telefono})
                </option>
              ))}
            </select>
            {errors.id_propietario && (
              <p className="mt-1 text-xs text-rose-600">{errors.id_propietario.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsFormModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {selectedPaciente?.id_paciente ? 'Guardar Cambios' : 'Registrar Paciente'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalle Clínico Completo */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Expediente Clínico de la Mascota"
        maxWidth="xl"
      >
        {selectedPaciente && (
          <div className="space-y-6">
            {/* Header del Paciente */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedPaciente.nombre}</h3>
                <p className="text-xs text-slate-500">
                  {selectedPaciente.especie} • Raza: {selectedPaciente.raza || 'Mestizo'}
                </p>
                <p className="text-xs text-slate-600 mt-1 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Propietario: {selectedPaciente.propietario_nombre} ({selectedPaciente.propietario_telefono})</span>
                </p>
              </div>
            </div>

            {/* Historial Clínico */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Historial Clínico ({selectedPaciente.historiales?.length || 0})</span>
              </h4>

              {selectedPaciente.historiales && selectedPaciente.historiales.length > 0 ? (
                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {selectedPaciente.historiales.map((h: any) => (
                    <div key={h.id_historial} className="p-3 rounded-xl border border-slate-200 bg-white text-xs">
                      <div className="flex justify-between font-semibold text-slate-800 mb-1">
                        <span>Registro Clínico</span>
                        <span className="text-slate-400 font-normal">{formatDate(h.fecha_registro)}</span>
                      </div>
                      <p className="text-slate-700">
                        <span className="font-semibold text-slate-800">Diagnóstico:</span> {h.diagnostico}
                      </p>
                      <p className="text-slate-600 mt-0.5">
                        <span className="font-semibold text-slate-800">Tratamiento:</span> {h.tratamiento}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic p-3 text-center bg-slate-50 rounded-xl">
                  Sin notas clínicas registradas aún.
                </p>
              )}
            </div>

            {/* Citas Agendadas */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
                <CalendarCheck className="w-4 h-4 text-brand-600" />
                <span>Citas del Paciente ({selectedPaciente.citas?.length || 0})</span>
              </h4>

              {selectedPaciente.citas && selectedPaciente.citas.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedPaciente.citas.map((c: any) => (
                    <div key={c.id_cita} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-800">{formatDateTime(c.fecha_hora)}</span>
                          <EstadoCitaBadge estado={c.estado} />
                        </div>
                        <p className="text-slate-500 mt-0.5">Motivo: {c.motivo}</p>
                      </div>
                      <span className="text-slate-500 text-[11px] font-medium">{c.nombre_veterinario}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic p-3 text-center bg-slate-50 rounded-xl">
                  Sin citas agendadas registradas.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Cerrar Expediente
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
        title="¿Eliminar Paciente?"
        message={`¿Está seguro de que desea eliminar a "${selectedPaciente?.nombre}"? Esta operación será bloqueada por la base de datos si el paciente tiene citas o registros en su historial clínico.`}
        confirmText="Sí, Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
};
