/**
 * HospedaFlow - Servicio ReservaService
 * Capa de Servicios / Lógica de Negocio (Sección 3.2 y US-2.2)
 */

import { DashboardStats, EstadoReserva, Reserva, ReservaRequestDTO } from '../../types/hotel.ts';
import { HabitacionJsonRepository } from '../repository/HabitacionJsonRepository.ts';
import { OfertaJsonRepository } from '../repository/OfertaJsonRepository.ts';
import { ReservaJsonRepository } from '../repository/ReservaJsonRepository.ts';
import { UsuarioJsonRepository } from '../repository/UsuarioJsonRepository.ts';
import { HabitacionService } from './HabitacionService.ts';
import { OfertaService } from './OfertaService.ts';

export class ReservaService {
  /**
   * Obtiene todas las reservas con filtros opcionales
   */
  public static async listarTodas(filtros?: {
    estado?: EstadoReserva;
    huespedId?: string;
    habitacionId?: string;
    fecha?: string;
  }): Promise<Reserva[]> {
    let reservas = await ReservaJsonRepository.findAll();

    if (filtros?.estado) {
      reservas = reservas.filter((r) => r.estado === filtros.estado);
    }
    if (filtros?.huespedId) {
      reservas = reservas.filter((r) => r.huespedId === filtros.huespedId);
    }
    if (filtros?.habitacionId) {
      reservas = reservas.filter((r) => r.habitacionId === filtros.habitacionId);
    }
    if (filtros?.fecha) {
      reservas = reservas.filter((r) => r.fechaEntrada <= filtros.fecha! && r.fechaSalida >= filtros.fecha!);
    }

    return reservas;
  }

  /**
   * Obtiene una reserva por identificador
   */
  public static async obtenerPorId(id: string): Promise<Reserva> {
    const reserva = await ReservaJsonRepository.findById(id);
    if (!reserva) {
      throw new Error(`Reserva con ID '${id}' no encontrada`);
    }
    return reserva;
  }

  /**
   * Registra una nueva reserva validando fechas, capacidad, solapamiento y tarifas
   */
  public static async registrarReserva(dto: ReservaRequestDTO): Promise<Reserva> {
    if (!dto.habitacionId || !dto.fechaEntrada || !dto.fechaSalida || !dto.huespedNombre) {
      throw new Error('Faltan datos obligatorios: habitación, fechas de estadía y nombre del huésped');
    }

    // 1. Validar fechas
    const inicio = new Date(dto.fechaEntrada);
    const fin = new Date(dto.fechaSalida);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      throw new Error('Formato de fecha no válido. Use YYYY-MM-DD');
    }

    if (fin <= inicio) {
      throw new Error('La fecha de salida debe ser posterior a la fecha de entrada');
    }

    const milisegundosPorDia = 1000 * 60 * 60 * 24;
    const numNoches = Math.max(1, Math.round((fin.getTime() - inicio.getTime()) / milisegundosPorDia));

    // 2. Obtener habitación
    const habitacion = await HabitacionService.obtenerPorId(dto.habitacionId);

    if (habitacion.estado === 'Mantenimiento') {
      throw new Error(`La habitación ${habitacion.numero} está actualmente en mantenimiento y no puede reservarse`);
    }

    // 3. Validar capacidad
    const numHuespedes = Number(dto.numHuespedes) || 1;
    if (numHuespedes > habitacion.capacidad) {
      throw new Error(
        `La habitación ${habitacion.numero} tiene capacidad máxima para ${habitacion.capacidad} personas (se solicitaron ${numHuespedes})`
      );
    }

    // 4. Validar solapamiento con reservas existentes
    const reservasExistentes = await ReservaJsonRepository.findByHabitacionId(habitacion.id);
    const hayConflicto = reservasExistentes.some((r) => {
      if (r.estado === 'Cancelada') return false;
      return dto.fechaEntrada < r.fechaSalida && dto.fechaSalida > r.fechaEntrada;
    });

    if (hayConflicto) {
      throw new Error(
        `La habitación ${habitacion.numero} ya tiene una reserva activa en las fechas seleccionadas (${dto.fechaEntrada} a ${dto.fechaSalida})`
      );
    }

    // 5. Gestión del huésped (vincular o auto-registrar)
    let huespedId = dto.huespedId;
    if (!huespedId) {
      const emailLimpio = (dto.huespedEmail || `${Date.now()}@huesped.ve`).trim().toLowerCase();
      const usuarioExistente = await UsuarioJsonRepository.findByEmail(emailLimpio);
      if (usuarioExistente) {
        huespedId = usuarioExistente.id;
      } else {
        const nuevoHuesped = await UsuarioJsonRepository.save({
          id: `usr-huesped-${Date.now()}`,
          nombre: dto.huespedNombre.trim(),
          email: emailLimpio,
          telefono: dto.huespedTelefono || '+58 000-0000000',
          rol: 'Huesped',
          fechaRegistro: new Date().toISOString().split('T')[0],
        });
        huespedId = nuevoHuesped.id;
      }
    }

    // 6. Validar y calcular oferta promocional
    let ofertaId: string | null = null;
    let ofertaCodigo: string | null = null;
    let porcentajeDesc = 0;

    if (dto.ofertaCodigo && dto.ofertaCodigo.trim()) {
      const validacion = await OfertaService.validarOferta(
        dto.ofertaCodigo.trim().toUpperCase(),
        habitacion.tipo,
        dto.fechaEntrada
      );
      if (validacion.valida && validacion.oferta) {
        ofertaId = validacion.oferta.id;
        ofertaCodigo = validacion.oferta.codigo;
        porcentajeDesc = validacion.oferta.porcentajeDescuento;
      }
    }

    // 7. Cálculo de tarifas (informativo en USD Ref.)
    const precioNoche = habitacion.precioBase;
    const subtotal = precioNoche * numNoches;
    const descuentoAplicado = Math.round(((subtotal * porcentajeDesc) / 100) * 100) / 100;
    const precioTotal = Math.max(0, Math.round((subtotal - descuentoAplicado) * 100) / 100);

    const todasReservas = await ReservaJsonRepository.findAll();
    const numeroConsecutivo = String(todasReservas.length + 1).padStart(3, '0');
    const codigoReserva = `HF-${new Date().getFullYear()}-${numeroConsecutivo}`;

    const nuevaReserva: Reserva = {
      id: `res-${Date.now()}`,
      codigoReserva,
      huespedId,
      huespedNombre: dto.huespedNombre.trim(),
      huespedEmail: dto.huespedEmail.trim(),
      huespedTelefono: dto.huespedTelefono.trim(),
      habitacionId: habitacion.id,
      habitacionNumero: habitacion.numero,
      habitacionTipo: habitacion.tipo,
      fechaEntrada: dto.fechaEntrada,
      fechaSalida: dto.fechaSalida,
      numNoches,
      numHuespedes,
      precioNoche,
      ofertaId,
      ofertaCodigo,
      descuentoAplicado,
      precioTotal,
      estado: 'Confirmada',
      notas: dto.notas || '',
      fechaRegistro: new Date().toISOString().split('T')[0],
    };

    const guardada = await ReservaJsonRepository.save(nuevaReserva);

    // Si la reserva inicia hoy, marcar la habitación como ocupada
    const hoyStr = new Date().toISOString().split('T')[0];
    if (dto.fechaEntrada <= hoyStr && dto.fechaSalida > hoyStr) {
      await HabitacionService.cambiarEstado(habitacion.id, 'Ocupada');
    }

    return guardada;
  }

  /**
   * Modifica las fechas de una reserva existente y recalcula el precio
   */
  public static async modificarFechas(
    id: string,
    nuevaFechaEntrada: string,
    nuevaFechaSalida: string
  ): Promise<Reserva> {
    const reserva = await this.obtenerPorId(id);

    const inicio = new Date(nuevaFechaEntrada);
    const fin = new Date(nuevaFechaSalida);
    if (fin <= inicio) {
      throw new Error('La fecha de salida debe ser posterior a la fecha de entrada');
    }

    // Verificar solapamiento con otras reservas de la misma habitación
    const reservasHab = await ReservaJsonRepository.findByHabitacionId(reserva.habitacionId);
    const conflicto = reservasHab.some((r) => {
      if (r.id === id || r.estado === 'Cancelada') return false;
      return nuevaFechaEntrada < r.fechaSalida && nuevaFechaSalida > r.fechaEntrada;
    });

    if (conflicto) {
      throw new Error(`La habitación ya tiene una reserva en el nuevo rango solicitado`);
    }

    const milisegundosPorDia = 1000 * 60 * 60 * 24;
    const numNoches = Math.max(1, Math.round((fin.getTime() - inicio.getTime()) / milisegundosPorDia));

    // Recalcular precio
    const subtotal = reserva.precioNoche * numNoches;
    let porcentajeDesc = 0;
    if (reserva.ofertaId) {
      const oferta = await OfertaJsonRepository.findById(reserva.ofertaId);
      if (oferta) porcentajeDesc = oferta.porcentajeDescuento;
    }

    const descuentoAplicado = Math.round(((subtotal * porcentajeDesc) / 100) * 100) / 100;
    const precioTotal = Math.max(0, Math.round((subtotal - descuentoAplicado) * 100) / 100);

    reserva.fechaEntrada = nuevaFechaEntrada;
    reserva.fechaSalida = nuevaFechaSalida;
    reserva.numNoches = numNoches;
    reserva.descuentoAplicado = descuentoAplicado;
    reserva.precioTotal = precioTotal;

    return await ReservaJsonRepository.save(reserva);
  }

  /**
   * Confirma una reserva
   */
  public static async confirmarReserva(id: string): Promise<Reserva> {
    const reserva = await this.obtenerPorId(id);
    reserva.estado = 'Confirmada';

    const hoyStr = new Date().toISOString().split('T')[0];
    if (reserva.fechaEntrada <= hoyStr && reserva.fechaSalida > hoyStr) {
      await HabitacionService.cambiarEstado(reserva.habitacionId, 'Ocupada');
    }

    return await ReservaJsonRepository.save(reserva);
  }

  /**
   * Cancela una reserva y libera la habitación
   */
  public static async cancelarReserva(id: string, motivo?: string): Promise<Reserva> {
    const reserva = await this.obtenerPorId(id);
    reserva.estado = 'Cancelada';
    if (motivo) {
      reserva.notas = reserva.notas ? `${reserva.notas} | Motivo cancelación: ${motivo}` : `Motivo cancelación: ${motivo}`;
    }

    // Verificar si la habitación debe volver a Disponible
    const habitacion = await HabitacionJsonRepository.findById(reserva.habitacionId);
    if (habitacion && habitacion.estado === 'Ocupada') {
      const otrasReservas = await ReservaJsonRepository.findByHabitacionId(habitacion.id);
      const hoyStr = new Date().toISOString().split('T')[0];
      const hayOtraActivaHoy = otrasReservas.some(
        (r) => r.id !== id && r.estado === 'Confirmada' && r.fechaEntrada <= hoyStr && r.fechaSalida > hoyStr
      );
      if (!hayOtraActivaHoy) {
        await HabitacionService.cambiarEstado(habitacion.id, 'Disponible');
      }
    }

    return await ReservaJsonRepository.save(reserva);
  }

  /**
   * Reasigna una reserva a otra habitación
   */
  public static async asignarHabitacion(id: string, nuevaHabitacionId: string): Promise<Reserva> {
    const reserva = await this.obtenerPorId(id);
    const nuevaHabitacion = await HabitacionService.obtenerPorId(nuevaHabitacionId);

    if (nuevaHabitacion.capacidad < reserva.numHuespedes) {
      throw new Error(
        `La nueva habitación tiene capacidad para ${nuevaHabitacion.capacidad} personas (reserva tiene ${reserva.numHuespedes})`
      );
    }

    // Verificar disponibilidad
    const reservasNuevaHab = await ReservaJsonRepository.findByHabitacionId(nuevaHabitacion.id);
    const conflicto = reservasNuevaHab.some((r) => {
      if (r.id === id || r.estado === 'Cancelada') return false;
      return reserva.fechaEntrada < r.fechaSalida && reserva.fechaSalida > r.fechaEntrada;
    });

    if (conflicto) {
      throw new Error(`La habitación ${nuevaHabitacion.numero} no está disponible en las fechas de esta reserva`);
    }

    reserva.habitacionId = nuevaHabitacion.id;
    reserva.habitacionNumero = nuevaHabitacion.numero;
    reserva.habitacionTipo = nuevaHabitacion.tipo;
    reserva.precioNoche = nuevaHabitacion.precioBase;

    // Recalcular tarifa
    const subtotal = reserva.precioNoche * reserva.numNoches;
    let porcentajeDesc = 0;
    if (reserva.ofertaId) {
      const oferta = await OfertaJsonRepository.findById(reserva.ofertaId);
      if (oferta) porcentajeDesc = oferta.porcentajeDescuento;
    }
    reserva.descuentoAplicado = Math.round(((subtotal * porcentajeDesc) / 100) * 100) / 100;
    reserva.precioTotal = Math.max(0, Math.round((subtotal - reserva.descuentoAplicado) * 100) / 100);

    return await ReservaJsonRepository.save(reserva);
  }

  /**
   * Elimina una reserva
   */
  public static async eliminarReserva(id: string): Promise<boolean> {
    await this.obtenerPorId(id);
    return await ReservaJsonRepository.deleteById(id);
  }

  /**
   * Obtiene estadísticas globales para el panel gerencial
   */
  public static async obtenerEstadisticas(): Promise<DashboardStats> {
    const habitaciones = await HabitacionJsonRepository.findAll();
    const reservas = await ReservaJsonRepository.findAll();
    const ofertas = await OfertaJsonRepository.findAll();
    const usuarios = await UsuarioJsonRepository.findAll();

    const totalHabitaciones = habitaciones.length;
    const habitacionesDisponibles = habitaciones.filter((h) => h.estado === 'Disponible').length;
    const habitacionesOcupadas = habitaciones.filter((h) => h.estado === 'Ocupada').length;
    const habitacionesMantenimiento = habitaciones.filter((h) => h.estado === 'Mantenimiento').length;

    const porcentajeOcupacion =
      totalHabitaciones > 0 ? Math.round((habitacionesOcupadas / totalHabitaciones) * 100) : 0;

    const reservasConfirmadas = reservas.filter((r) => r.estado === 'Confirmada').length;
    const reservasPendientes = reservas.filter((r) => r.estado === 'Pendiente').length;
    const reservasCanceladas = reservas.filter((r) => r.estado === 'Cancelada').length;

    const ingresosTotalesInformativos = reservas
      .filter((r) => r.estado === 'Confirmada')
      .reduce((sum, r) => sum + (r.precioTotal || 0), 0);

    const hoyStr = new Date().toISOString().split('T')[0];
    const ofertasActivas = ofertas.filter((o) => o.activa && o.fechaInicio <= hoyStr && o.fechaFin >= hoyStr).length;
    const totalHuespedes = usuarios.filter((u) => u.rol === 'Huesped').length;

    return {
      totalHabitaciones,
      habitacionesDisponibles,
      habitacionesOcupadas,
      habitacionesMantenimiento,
      porcentajeOcupacion,
      totalReservas: reservas.length,
      reservasConfirmadas,
      reservasPendientes,
      reservasCanceladas,
      ingresosTotalesInformativos: Math.round(ingresosTotalesInformativos * 100) / 100,
      ofertasActivas,
      totalHuespedes,
    };
  }
}
