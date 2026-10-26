import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  HeartHandshake,
  CalendarCheck,
  Activity,
  Stethoscope,
  PlusCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { api } from '../api/client.js';
import { formatDateTime, formatDate } from '../utils/formatters.js';
import { EstadoCitaBadge } from '../components/common/Badge.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';

const SPECIES_COLORS = ['#0d9488', '#0284c7', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/stats');
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Error al cargar las estadísticas del dashboard.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <LoadingSpinner message="Consultando métricas en tiempo real de MySQL..." />;
  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
        <p className="font-semibold">Error al conectar con la base de datos:</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const { resumen, distribucionEspecies, proximasCitas, actividadReciente, distribucionEstados } = data;

  const kpis = [
    {
      title: 'Total Pacientes',
      value: resumen.total_pacientes,
      icon: HeartHandshake,
      color: 'from-teal-500 to-emerald-600',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
      link: '/pacientes',
    },
    {
      title: 'Propietarios Registrados',
      value: resumen.total_propietarios,
      icon: Users,
      color: 'from-sky-500 to-blue-600',
      textColor: 'text-sky-600',
      bgColor: 'bg-sky-50',
      link: '/propietarios',
    },
    {
      title: 'Citas Pendientes',
      value: resumen.citas_pendientes,
      icon: CalendarCheck,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      link: '/citas?estado=pendiente',
    },
    {
      title: 'Citas Completadas',
      value: resumen.citas_completadas,
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-700',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      link: '/citas?estado=completada',
    },
    {
      title: 'Equipo Veterinario',
      value: resumen.total_veterinarios,
      icon: Stethoscope,
      color: 'from-purple-500 to-indigo-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/veterinarios',
    },
    {
      title: 'Servicios en Catálogo',
      value: resumen.total_servicios,
      icon: Activity,
      color: 'from-rose-500 to-pink-600',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      link: '/servicios',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado y Accesos Rápidos */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Panel de Control Clínico</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Métricas de la base de datos <span className="font-semibold text-slate-700">vetcare</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/citas?nueva=true"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Cita</span>
          </Link>
          <Link
            to="/pacientes?nuevo=true"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Paciente</span>
          </Link>
          <Link
            to="/propietarios?nuevo=true"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Propietario</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={idx}
              to={kpi.link}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`p-2 rounded-xl ${kpi.bgColor} ${kpi.textColor}`}>
                  <Icon className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{kpi.value}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-1">{kpi.title}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Gráficos de Datos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Especie */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Distribución de Pacientes por Especie</h3>
            <span className="text-xs text-slate-400 font-medium">Base de Datos</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribucionEspecies}
                  dataKey="cantidad"
                  nameKey="especie"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ especie, porcentaje }) => `${especie} (${porcentaje}%)`}
                >
                  {distribucionEspecies.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={SPECIES_COLORS[index % SPECIES_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Citas por Estado */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Estado de las Citas Agendadas</h3>
            <span className="text-xs text-slate-400 font-medium">Total: {resumen.total_citas || 20}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribucionEstados} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="estado" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="total" fill="#0d9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Próximas Citas y Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas Citas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarCheck className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-slate-900 text-base">Próximas Citas Programadas</h3>
            </div>
            <Link
              to="/citas"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {proximasCitas.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-400">No hay citas registradas.</p>
            ) : (
              proximasCitas.map((cita: any) => (
                <div key={cita.id_cita} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-slate-900">{cita.nombre_paciente}</span>
                      <span className="text-xs text-slate-500">({cita.especie_paciente})</span>
                      <EstadoCitaBadge estado={cita.estado} />
                    </div>
                    <p className="text-xs text-slate-500">
                      Dueño: <span className="text-slate-700 font-medium">{cita.nombre_propietario}</span> • Tel:{' '}
                      <span className="text-slate-700">{cita.telefono_propietario}</span>
                    </p>
                    <p className="text-xs text-slate-600 italic">“{cita.motivo}”</p>
                  </div>

                  <div className="text-right">
                    <span className="block text-xs font-bold text-slate-800">
                      {formatDateTime(cita.fecha_hora)}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{cita.nombre_veterinario}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actividad Clínica Reciente */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-base">Historial Clínico Reciente</h3>
            </div>

            <div className="space-y-3.5">
              {actividadReciente.map((h: any) => (
                <div key={h.id_historial} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                    <span>{h.nombre_paciente} ({h.especie_paciente})</span>
                    <span className="text-slate-400 font-normal">{formatDate(h.fecha_registro)}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-1">
                    <span className="font-medium text-slate-700">Diag:</span> {h.diagnostico}
                  </p>
                  <p className="text-slate-500 line-clamp-1 mt-0.5">
                    <span className="font-medium text-slate-700">Trat:</span> {h.tratamiento}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/historial"
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center justify-between"
          >
            <span>Consultar todos los historiales</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
