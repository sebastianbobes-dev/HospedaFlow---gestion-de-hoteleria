/**
 * HospedaFlow - Servicio OfertaService
 * Capa de Servicios / Lógica de Negocio (Sección 3.2 y US-2.3)
 */

import { Oferta, OfertaRequestDTO, TipoHabitacion } from '../../types/hotel.ts';
import { OfertaJsonRepository } from '../repository/OfertaJsonRepository.ts';

export class OfertaService {
  /**
   * Obtiene todas las ofertas
   */
  public static async listarTodas(soloActivas: boolean = false): Promise<Oferta[]> {
    const ofertas = await OfertaJsonRepository.findAll();
    if (soloActivas) {
      const hoy = new Date().toISOString().split('T')[0];
      return ofertas.filter((o) => o.activa && o.fechaInicio <= hoy && o.fechaFin >= hoy);
    }
    return ofertas;
  }

  /**
   * Obtiene una oferta por su identificador
   */
  public static async obtenerPorId(id: string): Promise<Oferta> {
    const oferta = await OfertaJsonRepository.findById(id);
    if (!oferta) {
      throw new Error(`Oferta con ID '${id}' no encontrada`);
    }
    return oferta;
  }

  /**
   * Crea una nueva oferta comercial
   */
  public static async crearOferta(dto: OfertaRequestDTO): Promise<Oferta> {
    if (!dto.titulo || !dto.codigo || dto.porcentajeDescuento === undefined) {
      throw new Error('El título, código promocional y porcentaje de descuento son obligatorios');
    }

    if (dto.porcentajeDescuento <= 0 || dto.porcentajeDescuento > 100) {
      throw new Error('El porcentaje de descuento debe estar entre 1% y 100%');
    }

    const codigoLimpio = dto.codigo.trim().toUpperCase();
    const existente = await OfertaJsonRepository.findByCodigo(codigoLimpio);
    if (existente) {
      throw new Error(`El código promocional '${codigoLimpio}' ya se encuentra en uso`);
    }

    if (dto.fechaFin < dto.fechaInicio) {
      throw new Error('La fecha de fin de vigencia debe ser posterior a la fecha de inicio');
    }

    const nuevaOferta: Oferta = {
      id: `oft-${Date.now()}`,
      titulo: dto.titulo.trim(),
      descripcion: dto.descripcion || '',
      codigo: codigoLimpio,
      porcentajeDescuento: Number(dto.porcentajeDescuento),
      fechaInicio: dto.fechaInicio,
      fechaFin: dto.fechaFin,
      habitacionTipo: dto.habitacionTipo || 'Todas',
      activa: dto.activa !== undefined ? dto.activa : true,
    };

    return await OfertaJsonRepository.save(nuevaOferta);
  }

  /**
   * Actualiza una oferta existente
   */
  public static async actualizarOferta(id: string, dto: Partial<OfertaRequestDTO>): Promise<Oferta> {
    const oferta = await this.obtenerPorId(id);

    if (dto.codigo && dto.codigo.trim().toUpperCase() !== oferta.codigo) {
      const repetida = await OfertaJsonRepository.findByCodigo(dto.codigo.trim().toUpperCase());
      if (repetida && repetida.id !== id) {
        throw new Error(`El código promocional '${dto.codigo}' ya existe`);
      }
      oferta.codigo = dto.codigo.trim().toUpperCase();
    }

    if (dto.titulo) oferta.titulo = dto.titulo.trim();
    if (dto.descripcion !== undefined) oferta.descripcion = dto.descripcion;
    if (dto.porcentajeDescuento !== undefined) {
      if (dto.porcentajeDescuento <= 0 || dto.porcentajeDescuento > 100) {
        throw new Error('El porcentaje de descuento debe estar entre 1% y 100%');
      }
      oferta.porcentajeDescuento = Number(dto.porcentajeDescuento);
    }
    if (dto.fechaInicio) oferta.fechaInicio = dto.fechaInicio;
    if (dto.fechaFin) oferta.fechaFin = dto.fechaFin;
    if (dto.habitacionTipo) oferta.habitacionTipo = dto.habitacionTipo;
    if (dto.activa !== undefined) oferta.activa = dto.activa;

    return await OfertaJsonRepository.save(oferta);
  }

  /**
   * Elimina una oferta por identificador
   */
  public static async eliminarOferta(id: string): Promise<boolean> {
    await this.obtenerPorId(id);
    return await OfertaJsonRepository.deleteById(id);
  }

  /**
   * Valida un código de oferta para un tipo de habitación y fecha
   */
  public static async validarOferta(
    codigo: string,
    tipoHabitacion: TipoHabitacion,
    fecha: string
  ): Promise<{ valida: boolean; oferta?: Oferta; motivo?: string }> {
    if (!codigo) return { valida: false, motivo: 'Código no proporcionado' };

    const oferta = await OfertaJsonRepository.findByCodigo(codigo);
    if (!oferta) {
      return { valida: false, motivo: `El código promocional '${codigo}' no existe` };
    }

    if (!oferta.activa) {
      return { valida: false, motivo: 'Esta oferta se encuentra inactiva actualmente' };
    }

    if (fecha < oferta.fechaInicio || fecha > oferta.fechaFin) {
      return { valida: false, motivo: `Oferta fuera de vigencia (${oferta.fechaInicio} a ${oferta.fechaFin})` };
    }

    if (oferta.habitacionTipo && oferta.habitacionTipo !== 'Todas' && oferta.habitacionTipo !== tipoHabitacion) {
      return {
        valida: false,
        motivo: `Esta oferta solo es válida para habitaciones de tipo '${oferta.habitacionTipo}'`,
      };
    }

    return { valida: true, oferta };
  }
}
