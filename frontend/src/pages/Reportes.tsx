import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  HelpCircle,
  TrendingUp,
  Stethoscope,
  Activity,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../api/client.js';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';
import { useToast } from '../context/ToastContext.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Table } from '../components/common/Table.js';
import { EstadoCitaBadge } from '../components/common/Badge.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';

export const Reportes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rango' | 'servicios' | 'veterinarios' | 'academicas'>('academicas');
  const [loading, setLoading] = useState(false);
  const [toast] = [useToast()];

  // Reporte 1: Rango de Fechas
  const [fechaInicio, setFechaInicio] = useState('2026-10-01');
  const [fechaFin, setFechaFin] = useState('2026-10-31');
  const [citasRango, setCitasRango] = useState<any[]>([]);

  // Reporte 2: Servicios
  const [serviciosDemanda, setServiciosDemanda] = useState<any[]>([]);

  // Reporte 3: Veterinarios
  const [citasVet, setCitasVet] = useState<any[]>([]);

  // Reporte 4: Preguntas Académicas
  const [preguntasAcademicas, setPreguntasAcademicas] = useState<any[]>([]);
  const [expandedPregunta, setExpandedPregunta] = useState<number | null>(1);

  const loadCitasRango = async () => {
    try {
      setLoading(true);
      const res = await api.get<any[]>(
        `/reportes/citas-rango?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin} 23:59:59`
      );
      setCitasRango(res || []);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar reporte de citas.');
    } finally {
      setLoading(false);
    }
  };

  const loadServiciosReport = async () => {
    try {
      setLoading(true);
      const res = await api.get<any[]>('/reportes/servicios-demanda');
      setServiciosDemanda(res || []);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar reporte de servicios.');
    } finally {
      setLoading(false);
    }
  };

  const loadVeterinariosReport = async () => {
    try {
      setLoading(true);
      const res = await api.get<any[]>('/reportes/citas-veterinario');
      setCitasVet(res || []);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar reporte de veterinarios.');
    } finally {
      setLoading(false);
    }
  };

  const loadAcademicasReport = async () => {
    try {
      setLoading(true);
      const res = await api.get<any[]>('/reportes/academicas');
      setPreguntasAcademicas(res || []);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar preguntas académicas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'rango') loadCitasRango();
    if (activeTab === 'servicios') loadServiciosReport();
    if (activeTab === 'veterinarios') loadVeterinariosReport();
    if (activeTab === 'academicas') loadAcademicasReport();
  }, [activeTab]);

  const handleDownloadCsv = (tipo: 'citas' | 'pacientes') => {
    window.open(`/api/reportes/export-csv?tipo=${tipo}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reportes y Consultas SQL del Sistema</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analítica de negocio y resolución de preguntas académicas de la Entrega 2
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            onClick={() => handleDownloadCsv('citas')}
          >
            Exportar Citas (CSV)
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4 text-brand-600" />}
            onClick={() => handleDownloadCsv('pacientes')}
          >
            Exportar Pacientes (CSV)
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('academicas')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'academicas'
              ? 'border-brand-600 text-brand-700 bg-brand-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Preguntas de Negocio (Proyecto 2)</span>
        </button>

        <button
          onClick={() => setActiveTab('rango')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'rango'
              ? 'border-brand-600 text-brand-700 bg-brand-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Citas por Rango de Fechas</span>
        </button>

        <button
          onClick={() => setActiveTab('servicios')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'servicios'
              ? 'border-brand-600 text-brand-700 bg-brand-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Demanda de Servicios</span>
        </button>

        <button
          onClick={() => setActiveTab('veterinarios')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'veterinarios'
              ? 'border-brand-600 text-brand-700 bg-brand-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Citas por Veterinario</span>
        </button>
      </div>

      {/* Contenido de Tabs */}
      {loading ? (
        <LoadingSpinner message="Ejecutando consultas relacionales sobre MySQL..." />
      ) : (
        <>
          {/* TAB 1: PREGUNTAS ACADÉMICAS */}
          {activeTab === 'academicas' && (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-800">
                <p className="font-bold text-sm text-teal-900 mb-1">
                  🎓 Requisito 8.10: 5 Preguntas que el sistema resuelve mediante SQL
                </p>
                <p>
                  Estas consultas utilizan funciones de agregación (COUNT, SUM, AVG, MAX, MIN), agrupamiento
                  (GROUP BY), filtros de condición (WHERE, HAVING) y uniones multi-tabla (JOIN) ejecutadas
                  directamente en MySQL/MariaDB sobre la base de datos <span className="font-semibold">vetcare</span>.
                </p>
              </div>

              <div className="space-y-3">
                {preguntasAcademicas.map((item) => {
                  const isExpanded = expandedPregunta === item.id;
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedPregunta(isExpanded ? null : item.id)}
                        className="w-full p-4.5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                            #{item.id}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{item.pregunta}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.justificacion}</p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-slate-100 pt-3 space-y-3 bg-slate-50/50">
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Resultado Devuelto por la Base de Datos:
                          </p>
                          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                            <pre className="p-3 text-xs text-slate-800 font-mono overflow-auto max-h-56">
                              {JSON.stringify(item.resultado, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CITAS POR RANGO */}
          {activeTab === 'rango' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <Input
                    label="Fecha Inicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                  <Input
                    label="Fecha Fin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
                <div className="self-end pb-1 w-full sm:w-auto">
                  <Button onClick={loadCitasRango} className="w-full">
                    Filtrar Citas
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Fecha y Hora</th>
                        <th className="px-4 py-3">Paciente</th>
                        <th className="px-4 py-3">Dueño</th>
                        <th className="px-4 py-3">Veterinario</th>
                        <th className="px-4 py-3">Motivo</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3 text-right">Costo Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {citasRango.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center p-6 text-slate-400">
                            No se encontraron citas en el rango seleccionado.
                          </td>
                        </tr>
                      ) : (
                        citasRango.map((c) => (
                          <tr key={c.id_cita} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono text-slate-400">{c.id_cita}</td>
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {formatDateTime(c.fecha_hora)}
                            </td>
                            <td className="px-4 py-3">
                              {c.paciente} ({c.especie})
                            </td>
                            <td className="px-4 py-3">
                              {c.propietario} ({c.telefono_propietario})
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-700">{c.veterinario}</td>
                            <td className="px-4 py-3 italic text-slate-600">{c.motivo}</td>
                            <td className="px-4 py-3">
                              <EstadoCitaBadge estado={c.estado} />
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(c.total_servicios)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICIOS */}
          {activeTab === 'servicios' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">
                  Servicios Veterinarios Ordenados por Frecuencia de Uso
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Procedimiento / Consulta</th>
                      <th className="px-4 py-3 text-right">Costo Unitario</th>
                      <th className="px-4 py-3 text-center">Veces Contratado</th>
                      <th className="px-4 py-3 text-right">Ingresos Acumulados</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {serviciosDemanda.map((s) => (
                      <tr key={s.id_servicio} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-slate-400">{s.id_servicio}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{s.servicio}</td>
                        <td className="px-4 py-3 text-right font-mono">{formatCurrency(s.costo)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700">
                            {s.veces_solicitado}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(s.ingresos_generados)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: VETERINARIOS */}
          {activeTab === 'veterinarios' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm">
                  Carga de Trabajo y Citas por Médico Veterinario
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Médico Veterinario</th>
                      <th className="px-4 py-3">Especialidad</th>
                      <th className="px-4 py-3 text-center">Total Citas</th>
                      <th className="px-4 py-3 text-center">Completadas</th>
                      <th className="px-4 py-3 text-center">Pendientes</th>
                      <th className="px-4 py-3 text-center">Canceladas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {citasVet.map((v) => (
                      <tr key={v.id_veterinario} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-slate-400">{v.id_veterinario}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{v.veterinario}</td>
                        <td className="px-4 py-3 font-medium text-indigo-700">{v.especialidad}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-900">{v.total_citas}</td>
                        <td className="px-4 py-3 text-center text-emerald-700 font-medium">
                          {v.citas_completadas}
                        </td>
                        <td className="px-4 py-3 text-center text-amber-700 font-medium">
                          {v.citas_pendientes}
                        </td>
                        <td className="px-4 py-3 text-center text-rose-700 font-medium">
                          {v.citas_canceladas}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
