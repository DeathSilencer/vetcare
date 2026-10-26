export type Role = 'ADMIN' | 'RECEPCION' | 'VETERINARIO';

export interface User {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: Role;
  activo?: boolean;
  id_veterinario: number | null;
  nombre_veterinario?: string | null;
  fecha_creacion?: string;
  ultimo_login?: string | null;
}

export interface Propietario {
  id_propietario: number;
  nombre: string;
  telefono: string;
  correo: string | null;
  total_pacientes?: number;
  pacientes?: Paciente[];
}

export interface Paciente {
  id_paciente: number;
  nombre: string;
  especie: string;
  raza: string | null;
  id_propietario: number | null;
  propietario_nombre?: string;
  propietario_telefono?: string;
  propietario_correo?: string | null;
}

export interface Especialidad {
  id_especialidad: number;
  nombre_especialidad: string;
  total_veterinarios?: number;
}

export interface Veterinario {
  id_veterinario: number;
  nombre: string;
  telefono: string | null;
  id_especialidad: number | null;
  nombre_especialidad?: string;
  total_citas?: number;
}

export type CitaEstado = 'pendiente' | 'completada' | 'cancelada';

export interface Servicio {
  id_servicio: number;
  descripcion: string;
  costo: number;
  veces_solicitado?: number;
}

export interface Cita {
  id_cita: number;
  fecha_hora: string;
  motivo: string;
  estado: CitaEstado;
  id_paciente: number;
  id_veterinario: number;
  nombre_paciente?: string;
  especie_paciente?: string;
  id_propietario?: number;
  nombre_propietario?: string;
  telefono_propietario?: string;
  nombre_veterinario?: string;
  nombre_especialidad?: string;
  servicios?: Servicio[];
  costo_total?: number;
}

export interface HistorialClinico {
  id_historial: number;
  id_paciente: number;
  fecha_registro: string;
  diagnostico: string;
  tratamiento: string;
  nombre_paciente?: string;
  especie_paciente?: string;
  raza_paciente?: string;
  nombre_propietario?: string;
  telefono_propietario?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
