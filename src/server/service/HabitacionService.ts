/**
 * HospedaFlow - Servicio HabitacionService
 * Capa de Servicios / Lógica de Negocio (Sección 3.2 y US-2.1)
 */

import { EstadoHabitacion, Habitacion, HabitacionRequestDTO, TipoHabitacion } from '../../types/hotel.ts';
import { HabitacionJsonRepository } from '../repository/HabitacionJsonRepository.ts';
import { ReservaJsonRepository } from '../repository/ReservaJsonRepository.ts';

export class HabitacionService {
  /**
   * Obtiene todas las habitaciones con filtros opcionales
   */
  public static async listarTodas(filtros?: {
    estado?: EstadoHabitacion;
    tipo?: TipoHabitacion;
    capacidadMinima?: number;
  }): Promise<Habitacion[]> {
    let habitaciones = await HabitacionJsonRepository.findAll();

    if (filtros?.estado) {
      habitaciones = habitaciones.filter((h) => h.estado === filtros.estado);
    }
    if (filtros?.tipo) {
      habitaciones = habitaciones.filter((h) => h.tipo === filtros.tipo);
    }
    if (filtros?.capacidadMinima) {
      habitaciones = habitaciones.filter((h) => h.capacidad >= filtros.capacidadMinima!);
    }

    return habitaciones;
  }

  /**
   * Obtiene una habitación por su identificador
   */
  public static async obtenerPorId(id: string): Promise<Habitacion> {
    const habitacion = await HabitacionJsonRepository.findById(id);
    if (!habitacion) {
      throw new Error(`Habitación con ID '${id}' no encontrada`);
    }
    return habitacion;
  }

  /**
   * Registra una nueva habitación validando unicidad de número
   */
  public static async crearHabitacion(dto: HabitacionRequestDTO): Promise<Habitacion> {
    if (!dto.numero || !dto.tipo || !dto.precioBase || !dto.capacidad) {
      throw new Error('Todos los campos obligatorios deben estar presentes (número, tipo, precio, capacidad)');
    }

    if (dto.precioBase <= 0) {
      throw new Error('El precio base debe ser mayor a 0');
    }

    if (dto.capacidad <= 0) {
      throw new Error('La capacidad debe ser de al menos 1 huésped');
    }

    // Validar duplicado de número de habitación
    const existente = await HabitacionJsonRepository.findByNumero(dto.numero);
    if (existente) {
      throw new Error(`Ya existe una habitación registrada con el número ${dto.numero}`);
    }

    const nuevaHabitacion: Habitacion = {
      id: `hab-${Date.now()}`,
      numero: dto.numero.trim(),
      tipo: dto.tipo,
      precioBase: Number(dto.precioBase),
      capacidad: Number(dto.capacidad),
      estado: dto.estado || 'Disponible',
      descripcion: dto.descripcion || '',
      caracteristicas: dto.caracteristicas || ['Aire Acondicionado', 'Wifi', 'Baño Privado'],
      piso: dto.piso || 1,
    };

    return await HabitacionJsonRepository.save(nuevaHabitacion);
  }

  /**
   * Actualiza los datos de una habitación
   */
  public static async actualizarHabitacion(id: string, dto: Partial<HabitacionRequestDTO>): Promise<Habitacion> {
    const habitacion = await this.obtenerPorId(id);

    if (dto.numero && dto.numero.trim() !== habitacion.numero) {
      const repetida = await HabitacionJsonRepository.findByNumero(dto.numero);
      if (repetida && repetida.id !== id) {
        throw new Error(`Ya existe otra habitación con el número ${dto.numero}`);
      }
      habitacion.numero = dto.numero.trim();
    }

    if (dto.tipo) habitacion.tipo = dto.tipo;
    if (dto.precioBase !== undefined && dto.precioBase > 0) habitacion.precioBase = Number(dto.precioBase);
    if (dto.capacidad !== undefined && dto.capacidad > 0) habitacion.capacidad = Number(dto.capacidad);
    if (dto.estado) habitacion.estado = dto.estado;
    if (dto.descripcion !== undefined) habitacion.descripcion = dto.descripcion;
    if (dto.caracteristicas) habitacion.caracteristicas = dto.caracteristicas;
    if (dto.piso !== undefined) habitacion.piso = dto.piso;

    return await HabitacionJsonRepository.save(habitacion);
  }

  /**
   * Cambia el estado operativo de una habitación
   */
  public static async cambiarEstado(id: string, nuevoEstado: EstadoHabitacion): Promise<Habitacion> {
    const habitacion = await this.obtenerPorId(id);
    habitacion.estado = nuevoEstado;
    return await HabitacionJsonRepository.save(habitacion);
  }

  /**
   * Elimina una habitación si no tiene reservas activas
   */
  public static async eliminarHabitacion(id: string): Promise<boolean> {
    const habitacion = await this.obtenerPorId(id);

    const reservas = await ReservaJsonRepository.findByHabitacionId(id);
    const reservasActivas = reservas.filter((r) => r.estado === 'Confirmada' || r.estado === 'Pendiente');

    if (reservasActivas.length > 0) {
      throw new Error(`No se puede eliminar la habitación ${habitacion.numero} porque tiene ${reservasActivas.length} reserva(s) activa(s)`);
    }

    return await HabitacionJsonRepository.deleteById(id);
  }

  /**
   * Valida y consulta la disponibilidad real de habitaciones en un rango de fechas
   * Verifica solapamiento con reservas existentes y estado de mantenimiento
   */
  public static async consultarDisponibilidad(
    fechaEntrada: string,
    fechaSalida: string,
    tipo?: TipoHabitacion,
    numHuespedes?: number
  ): Promise<Habitacion[]> {
    if (!fechaEntrada || !fechaSalida) {
      throw new Error('Debe proporcionar fecha de entrada y salida');
    }

    const inicio = new Date(fechaEntrada);
    const fin = new Date(fechaSalida);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      throw new Error('Formato de fecha inválido. Utilice YYYY-MM-DD');
    }

    if (fin <= inicio) {
      throw new Error('La fecha de salida debe ser posterior a la fecha de entrada');
    }

    const todasHabitaciones = await HabitacionJsonRepository.findAll();
    const todasReservas = await ReservaJsonRepository.findAll();

    // Filtro inicial por tipo y capacidad
    let candidatas = todasHabitaciones.filter((h) => h.estado !== 'Mantenimiento');

    if (tipo) {
      candidatas = candidatas.filter((h) => h.tipo === tipo);
    }
    if (numHuespedes) {
      candidatas = candidatas.filter((h) => h.capacidad >= numHuespedes);
    }

    // Filtrar aquellas con solapamiento en reservas activas (Confirmada o Pendiente)
    const disponibles = candidatas.filter((hab) => {
      const reservasHab = todasReservas.filter(
        (r) => r.habitacionId === hab.id && (r.estado === 'Confirmada' || r.estado === 'Pendiente')
      );

      const hayConflicto = reservasHab.some((res) => {
        // Solapamiento: fechaEntrada < res.fechaSalida && fechaSalida > res.fechaEntrada
        return fechaEntrada < res.fechaSalida && fechaSalida > res.fechaEntrada;
      });

      return !hayConflicto;
    });

    return disponibles;
  }
}
