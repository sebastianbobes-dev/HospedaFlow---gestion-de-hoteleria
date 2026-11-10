/**
 * HospedaFlow - Tipos y Modelos de Dominio
 * Sprint 1: Arquitectura y Diseño Técnico
 */

// Enumeraciones de Apoyo (Sección 3.4 del Documento Técnico)
export type RolUsuario = 'Admin' | 'Recepcionista' | 'Huesped';

export type EstadoHabitacion = 'Disponible' | 'Ocupada' | 'Mantenimiento';

export type EstadoReserva = 'Pendiente' | 'Confirmada' | 'Cancelada';

export type TipoHabitacion = 'Individual' | 'Doble' | 'Matrimonial' | 'Familiar' | 'Suite Colonial';

// Entidad Base Usuario (Clase Abstracta)
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  password?: string;
  telefono: string;
  rol: RolUsuario;
  documentoIdentidad?: string; // Cédula o Pasaporte
  fechaRegistro: string;
}

// Especializaciones de Usuario
export interface Gerente extends Usuario {
  rol: 'Admin';
  departamento?: string;
}

export interface Recepcionista extends Usuario {
  rol: 'Recepcionista';
  turno?: string;
}

export interface Huesped extends Usuario {
  rol: 'Huesped';
  ciudadOrigen?: string;
  preferencias?: string;
}

// Entidad Habitación
export interface Habitacion {
  id: string;
  numero: string;
  tipo: TipoHabitacion;
  precioBase: number; // En USD Ref.
  capacidad: number;
  estado: EstadoHabitacion;
  descripcion?: string;
  caracteristicas?: string[]; // Ej: Wifi, Aire Acondicionado, Vista al Jardín, Baño Privado
  piso?: number;
}

// Entidad Oferta
export interface Oferta {
  id: string;
  titulo: string;
  descripcion: string;
  codigo: string;
  porcentajeDescuento: number; // Por ejemplo 15 para 15%
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  habitacionTipo?: TipoHabitacion | 'Todas';
  activa: boolean;
}

// Entidad Reserva
export interface Reserva {
  id: string;
  codigoReserva: string;
  huespedId: string;
  huespedNombre: string;
  huespedEmail: string;
  huespedTelefono: string;
  habitacionId: string;
  habitacionNumero: string;
  habitacionTipo: TipoHabitacion;
  fechaEntrada: string; // YYYY-MM-DD
  fechaSalida: string; // YYYY-MM-DD
  numNoches: number;
  numHuespedes: number;
  precioNoche: number;
  ofertaId?: string | null;
  ofertaCodigo?: string | null;
  descuentoAplicado: number; // Monto descontado
  precioTotal: number; // Total a cobrar (Ref. $)
  estado: EstadoReserva;
  notas?: string;
  fechaRegistro: string;
}

// DTOs (Data Transfer Objects - Sección 5.3 del Documento Técnico)
export interface HabitacionRequestDTO {
  numero: string;
  tipo: TipoHabitacion;
  precioBase: number;
  capacidad: number;
  estado?: EstadoHabitacion;
  descripcion?: string;
  caracteristicas?: string[];
  piso?: number;
}

export interface ReservaRequestDTO {
  huespedId?: string;
  huespedNombre: string;
  huespedEmail: string;
  huespedTelefono: string;
  habitacionId: string;
  fechaEntrada: string;
  fechaSalida: string;
  numHuespedes: number;
  ofertaCodigo?: string;
  notas?: string;
}

export interface OfertaRequestDTO {
  titulo: string;
  descripcion: string;
  codigo: string;
  porcentajeDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  habitacionTipo?: TipoHabitacion | 'Todas';
  activa?: boolean;
}

export interface UsuarioRequestDTO {
  nombre: string;
  email: string;
  password?: string;
  telefono: string;
  rol: RolUsuario;
  documentoIdentidad?: string;
  preferencias?: string;
}

// Respuestas de API estándar
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardStats {
  totalHabitaciones: number;
  habitacionesDisponibles: number;
  habitacionesOcupadas: number;
  habitacionesMantenimiento: number;
  porcentajeOcupacion: number;
  totalReservas: number;
  reservasConfirmadas: number;
  reservasPendientes: number;
  reservasCanceladas: number;
  ingresosTotalesInformativos: number;
  ofertasActivas: number;
  totalHuespedes: number;
}
