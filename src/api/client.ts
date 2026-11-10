/**
 * HospedaFlow - Cliente API para Comunicación Asíncrona (Fetch API)
 * Cumple con Sección 5.2 del Documento Técnico: peticiones HTTP con async/await y DTOs
 */

import {
  ApiResponse,
  DashboardStats,
  EstadoHabitacion,
  Habitacion,
  HabitacionRequestDTO,
  Oferta,
  OfertaRequestDTO,
  Reserva,
  ReservaRequestDTO,
  RolUsuario,
  TipoHabitacion,
  Usuario,
  UsuarioRequestDTO,
} from '../types/hotel.ts';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || `Error en la petición: ${res.status}`);
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // --- Estadísticas ---
  async getStats(): Promise<DashboardStats> {
    return await fetchJson<DashboardStats>(`${API_BASE}/stats`);
  },

  // --- Habitaciones ---
  async getHabitaciones(filtros?: {
    estado?: EstadoHabitacion;
    tipo?: TipoHabitacion;
    capacidadMinima?: number;
  }): Promise<Habitacion[]> {
    const params = new URLSearchParams();
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.tipo) params.append('tipo', filtros.tipo);
    if (filtros?.capacidadMinima) params.append('capacidadMinima', String(filtros.capacidadMinima));
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await fetchJson<Habitacion[]>(`${API_BASE}/habitaciones${qs}`);
  },

  async consultarDisponibilidad(
    fechaEntrada: string,
    fechaSalida: string,
    tipo?: TipoHabitacion,
    numHuespedes?: number
  ): Promise<Habitacion[]> {
    const params = new URLSearchParams({ fechaEntrada, fechaSalida });
    if (tipo) params.append('tipo', tipo);
    if (numHuespedes) params.append('numHuespedes', String(numHuespedes));
    return await fetchJson<Habitacion[]>(`${API_BASE}/habitaciones/disponibilidad?${params.toString()}`);
  },

  async crearHabitacion(dto: HabitacionRequestDTO): Promise<Habitacion> {
    return await fetchJson<Habitacion>(`${API_BASE}/habitaciones`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async actualizarHabitacion(id: string, dto: Partial<HabitacionRequestDTO>): Promise<Habitacion> {
    return await fetchJson<Habitacion>(`${API_BASE}/habitaciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  async cambiarEstadoHabitacion(id: string, estado: EstadoHabitacion): Promise<Habitacion> {
    return await fetchJson<Habitacion>(`${API_BASE}/habitaciones/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  },

  async eliminarHabitacion(id: string): Promise<void> {
    await fetchJson<void>(`${API_BASE}/habitaciones/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Reservas ---
  async getReservas(filtros?: {
    estado?: string;
    huespedId?: string;
    habitacionId?: string;
    fecha?: string;
  }): Promise<Reserva[]> {
    const params = new URLSearchParams();
    if (filtros?.estado && filtros.estado !== 'Todas') params.append('estado', filtros.estado);
    if (filtros?.huespedId) params.append('huespedId', filtros.huespedId);
    if (filtros?.habitacionId) params.append('habitacionId', filtros.habitacionId);
    if (filtros?.fecha) params.append('fecha', filtros.fecha);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await fetchJson<Reserva[]>(`${API_BASE}/reservas${qs}`);
  },

  async crearReserva(dto: ReservaRequestDTO): Promise<Reserva> {
    return await fetchJson<Reserva>(`${API_BASE}/reservas`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async modificarFechasReserva(id: string, fechaEntrada: string, fechaSalida: string): Promise<Reserva> {
    return await fetchJson<Reserva>(`${API_BASE}/reservas/${id}/fechas`, {
      method: 'PUT',
      body: JSON.stringify({ fechaEntrada, fechaSalida }),
    });
  },

  async confirmarReserva(id: string): Promise<Reserva> {
    return await fetchJson<Reserva>(`${API_BASE}/reservas/${id}/confirmar`, {
      method: 'PATCH',
    });
  },

  async cancelarReserva(id: string, motivo?: string): Promise<Reserva> {
    return await fetchJson<Reserva>(`${API_BASE}/reservas/${id}/cancelar`, {
      method: 'PATCH',
      body: JSON.stringify({ motivo }),
    });
  },

  async asignarHabitacionReserva(id: string, habitacionId: string): Promise<Reserva> {
    return await fetchJson<Reserva>(`${API_BASE}/reservas/${id}/asignar`, {
      method: 'PATCH',
      body: JSON.stringify({ habitacionId }),
    });
  },

  async eliminarReserva(id: string): Promise<void> {
    await fetchJson<void>(`${API_BASE}/reservas/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Ofertas ---
  async getOfertas(activas: boolean = false): Promise<Oferta[]> {
    return await fetchJson<Oferta[]>(`${API_BASE}/ofertas?activas=${activas}`);
  },

  async crearOferta(dto: OfertaRequestDTO): Promise<Oferta> {
    return await fetchJson<Oferta>(`${API_BASE}/ofertas`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async actualizarOferta(id: string, dto: Partial<OfertaRequestDTO>): Promise<Oferta> {
    return await fetchJson<Oferta>(`${API_BASE}/ofertas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  async eliminarOferta(id: string): Promise<void> {
    await fetchJson<void>(`${API_BASE}/ofertas/${id}`, {
      method: 'DELETE',
    });
  },

  async validarCodigoOferta(
    codigo: string,
    tipoHabitacion?: TipoHabitacion,
    fecha?: string
  ): Promise<{ valida: boolean; oferta?: Oferta; motivo?: string }> {
    return await fetchJson<{ valida: boolean; oferta?: Oferta; motivo?: string }>(`${API_BASE}/ofertas/validar`, {
      method: 'POST',
      body: JSON.stringify({ codigo, tipoHabitacion, fecha }),
    });
  },

  // --- Usuarios y Perfiles ---
  async getUsuarios(rol?: RolUsuario): Promise<Usuario[]> {
    const qs = rol ? `?rol=${rol}` : '';
    return await fetchJson<Usuario[]>(`${API_BASE}/usuarios${qs}`);
  },

  async crearUsuario(dto: UsuarioRequestDTO): Promise<Usuario> {
    return await fetchJson<Usuario>(`${API_BASE}/usuarios`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async actualizarUsuario(id: string, dto: Partial<UsuarioRequestDTO>): Promise<Usuario> {
    return await fetchJson<Usuario>(`${API_BASE}/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  async eliminarUsuario(id: string): Promise<void> {
    await fetchJson<void>(`${API_BASE}/usuarios/${id}`, {
      method: 'DELETE',
    });
  },

  async login(email: string, password?: string): Promise<Usuario> {
    return await fetchJson<Usuario>(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // --- Utilidades de Arquitectura ---
  async getArchivoJson(nombre: string): Promise<{ archivo: string; contenido: string }> {
    const res = await fetch(`${API_BASE}/archivos-json/${nombre}`);
    return await res.json();
  },

  async resetData(): Promise<void> {
    await fetchJson<void>(`${API_BASE}/reset-data`, {
      method: 'POST',
    });
  },
};
