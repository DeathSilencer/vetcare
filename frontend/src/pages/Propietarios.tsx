import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit2, Trash2, Eye, Users, Phone, Mail, PawPrint } from 'lucide-react';
import { api } from '../api/client.js';
import { Propietario } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Modal } from '../components/common/Modal.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.js';
import { Table } from '../components/common/Table.js';
import { Pagination } from '../components/common/Pagination.js';

const propietarioSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  telefono: z.string().min(7, 'El teléfono debe tener entre 7 y 15 dígitos').max(15),
  correo: z.string().email('Correo electrónico no válido').optional().or(z.literal('')),
});

type PropietarioFormData = z.infer<typeof propietarioSchema>;

export const Propietarios: React.FC = () => {
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPropietario, setSelectedPropietario] = useState<Propietario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchParams] = useSearchParams();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PropietarioFormData>({
    resolver: zodResolver(propietarioSchema),
  });

  const loadPropietarios = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
      });
      const res = await api.get<{ items: Propietario[]; total: number; totalPages: number }>(
        `/propietarios?${params.toString()}`
      );
      setPropietarios(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar propietarios.');
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);

  useEffect(() => {
    loadPropietarios();
  }, [loadPropietarios]);

  useEffect(() => {
    if (searchParams.get('nuevo') === 'true') {
      openCreateModal();
    }
  }, [searchParams]);

  const openCreateModal = () => {
    setSelectedPropietario(null);
    reset({ nombre: '', telefono: '', correo: '' });
    setIsFormModalOpen(true);
  };

  const openEditModal = (propietario: Propietario) => {
    setSelectedPropietario(propietario);
    reset({
      nombre: propietario.nombre,
      telefono: propietario.telefono,
      correo: propietario.correo || '',
    });
    setIsFormModalOpen(true);
  };

  const openDetailModal = async (propietario: Propietario) => {
    try {
      const full = await api.get<Propietario>(`/propietarios/${propietario.id_propietario}`);
      setSelectedPropietario(full);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Error al obtener los detalles del propietario.');
    }
  };

  const openDeleteDialog = (propietario: Propietario) => {
    setSelectedPropietario(propietario);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: PropietarioFormData) => {
    try {
      if (selectedPropietario) {
        await api.put(`/propietarios/${selectedPropietario.id_propietario}`, data);
        toast.success('Propietario actualizado correctamente.');
      } else {
        await api.post('/propietarios', data);
        toast.success('Propietario registrado exitosamente.');
      }
      setIsFormModalOpen(false);
      loadPropietarios();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar el propietario.');
    }
  };

  const handleDelete = async () => {
    if (!selectedPropietario) return;
    try {
      setIsDeleting(true);
      await api.delete(`/propietarios/${selectedPropietario.id_propietario}`);
      toast.success('Propietario eliminado correctamente.');
      setIsDeleteDialogOpen(false);
      loadPropietarios();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el propietario.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id_propietario' as keyof Propietario,
      className: 'w-16 font-mono text-xs text-slate-400',
    },
    {
      header: 'Nombre del Propietario',
      accessor: (row: Propietario) => (
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xs">
            {row.nombre.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{row.nombre}</p>
            <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
              <Mail className="w-3 h-3" />
              <span>{row.correo || 'Sin correo registrado'}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Teléfono',
      accessor: (row: Propietario) => (
        <span className="flex items-center space-x-1.5 text-slate-600 font-mono text-xs">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.telefono}</span>
        </span>
      ),
    },
    {
      header: 'Pacientes',
      accessor: (row: Propietario) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          <PawPrint className="w-3 h-3 mr-1 text-brand-600" />
          {row.total_pacientes || 0} mascota(s)
        </span>
      ),
    },
    {
      header: 'Acciones',
      accessor: (row: Propietario) => (
        <div className="flex items-center space-x-1 justify-end">
          <button
            onClick={() => openDetailModal(row)}
            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            title="Ver ficha y mascotas"
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
            title="Eliminar propietario"
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Directorio de Propietarios</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión y seguimiento de dueños de mascotas en la clínica
          </p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Nuevo Propietario
        </Button>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o correo electrónico..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="space-y-4">
        <Table columns={columns} data={propietarios} isLoading={loading} emptyMessage="No hay propietarios registrados." />
        <Pagination page={page} totalPages={totalPages} total={total} limit={10} onPageChange={setPage} />
      </div>

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedPropietario ? 'Editar Propietario' : 'Registrar Nuevo Propietario'}
        subtitle="Complete los datos de contacto del titular"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre Completo"
            placeholder="Ej. Juan Pérez García"
            error={errors.nombre?.message}
            required
            {...register('nombre')}
          />

          <Input
            label="Teléfono de Contacto"
            placeholder="Ej. 5512345678"
            error={errors.telefono?.message}
            required
            {...register('telefono')}
          />

          <Input
            label="Correo Electrónico (Opcional)"
            type="email"
            placeholder="ejemplo@correo.com"
            error={errors.correo?.message}
            {...register('correo')}
          />

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsFormModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {selectedPropietario ? 'Actualizar Propietario' : 'Guardar Propietario'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalle de Propietario y Mascotas */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Ficha del Propietario"
        maxWidth="lg"
      >
        {selectedPropietario && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-bold text-lg flex items-center justify-center">
                {selectedPropietario.nombre.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedPropietario.nombre}</h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Tel: {selectedPropietario.telefono}</p>
                <p className="text-xs text-slate-500 mt-0.5">Correo: {selectedPropietario.correo || 'No registrado'}</p>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
                <PawPrint className="w-4 h-4 text-brand-600" />
                <span>Mascotas Registradas</span>
              </h5>

              {selectedPropietario.pacientes && selectedPropietario.pacientes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPropietario.pacientes.map((p) => (
                    <div key={p.id_paciente} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                      <p className="font-bold text-sm text-slate-900">{p.nombre}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Especie: <span className="font-medium text-slate-700">{p.especie}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Raza: <span className="font-medium text-slate-700">{p.raza || 'Mestizo / Sin raza'}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic p-4 text-center bg-slate-50 rounded-xl">
                  Este propietario no tiene mascotas vinculadas actualmente.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Cerrar Ficha
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Diálogo de Confirmación de Eliminación */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar Propietario?"
        message={`¿Está seguro de que desea eliminar a "${selectedPropietario?.nombre}"? Esta acción no se puede deshacer y fallará si el propietario tiene pacientes asociados en la base de datos.`}
        confirmText="Sí, Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
};
