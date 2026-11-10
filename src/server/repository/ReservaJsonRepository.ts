/**
 * HospedaFlow - Repositorio ReservaJsonRepository
 * Capa de Persistencia (Sección 3.1 del Documento Técnico)
 */

import { Reserva } from '../../types/hotel.ts';
import { JsonDatabase } from '../db/JsonDatabase.ts';

const ARCHIVO = 'reservas.json';

// Fechas dinámicas para que los datos de demostración siempre se vean relevantes
const hoy = new Date();
const fechaHoy = hoy.toISOString().split('T')[0];

const en3Dias = new Date();
en3Dias.setDate(hoy.getDate() + 3);
const fechaEn3Dias = en3Dias.toISOString().split('T')[0];

const en5Dias = new Date();
en5Dias.setDate(hoy.getDate() + 5);
const fechaEn5Dias = en5Dias.toISOString().split('T')[0];

const en8Dias = new Date();
en8Dias.setDate(hoy.getDate() + 8);
const fechaEn8Dias = en8Dias.toISOString().split('T')[0];

const DATOS_INICIALES: Reserva[] = [
  {
    id: 'res-001',
    codigoReserva: 'HF-2026-001',
    huespedId: 'usr-huesped-1',
    huespedNombre: 'Carlos Mendoza',
    huespedEmail: 'carlos.mendoza@gmail.com',
    huespedTelefono: '+58 414-3214567',
    habitacionId: 'hab-102',
    habitacionNumero: '102',
    habitacionTipo: 'Doble',
    fechaEntrada: fechaHoy,
    fechaSalida: fechaEn3Dias,
    numNoches: 3,
    numHuespedes: 2,
    precioNoche: 55,
    ofertaId: 'oft-001',
    ofertaCodigo: 'ESCAPADA15',
    descuentoAplicado: 24.75, // 15% de (55 * 3 = 165)
    precioTotal: 140.25,
    estado: 'Confirmada',
    notas: 'Huésped solicita cama adicional para equipaje y llegada a las 3:00 PM.',
    fechaRegistro: fechaHoy,
  },
  {
    id: 'res-002',
    codigoReserva: 'HF-2026-002',
    huespedId: 'usr-huesped-2',
    huespedNombre: 'Mariana Silva',
    huespedEmail: 'mariana.silva@hotmail.com',
    huespedTelefono: '+58 416-8765432',
    habitacionId: 'hab-201',
    habitacionNumero: '201',
    habitacionTipo: 'Suite Colonial',
    fechaEntrada: fechaEn5Dias,
    fechaSalida: fechaEn8Dias,
    numNoches: 3,
    numHuespedes: 2,
    precioNoche: 110,
    ofertaId: 'oft-003',
    ofertaCodigo: 'SUITE25',
    descuentoAplicado: 82.5, // 25% de 330
    precioTotal: 247.5,
    estado: 'Pendiente',
    notas: 'Celebración de aniversario. Solicitan arreglo de flores en la suite.',
    fechaRegistro: fechaHoy,
  },
  {
    id: 'res-003',
    codigoReserva: 'HF-2026-003',
    huespedId: 'usr-huesped-3',
    huespedNombre: 'Andrés Azuaje',
    huespedEmail: 'andres.azuaje@gmail.com',
    huespedTelefono: '+58 412-7778899',
    habitacionId: 'hab-104',
    habitacionNumero: '104',
    habitacionTipo: 'Familiar',
    fechaEntrada: '2026-03-10',
    fechaSalida: '2026-03-14',
    numNoches: 4,
    numHuespedes: 4,
    precioNoche: 95,
    ofertaId: null,
    ofertaCodigo: null,
    descuentoAplicado: 0,
    precioTotal: 380,
    estado: 'Confirmada',
    notas: 'Familia con dos niños pequeños. Requieren cuna de bebé.',
    fechaRegistro: '2026-02-25',
  },
];

export class ReservaJsonRepository {
  public static async findAll(): Promise<Reserva[]> {
    return await JsonDatabase.leerLista<Reserva>(ARCHIVO, DATOS_INICIALES);
  }

  public static async findById(id: string): Promise<Reserva | null> {
    const lista = await this.findAll();
    return lista.find((r) => r.id === id) || null;
  }

  public static async findByCodigo(codigo: string): Promise<Reserva | null> {
    const lista = await this.findAll();
    return lista.find((r) => r.codigoReserva.toLowerCase().trim() === codigo.toLowerCase().trim()) || null;
  }

  public static async findByHabitacionId(habitacionId: string): Promise<Reserva[]> {
    const lista = await this.findAll();
    return lista.filter((r) => r.habitacionId === habitacionId);
  }

  public static async save(reserva: Reserva): Promise<Reserva> {
    const lista = await this.findAll();
    const index = lista.findIndex((r) => r.id === reserva.id);

    if (index >= 0) {
      lista[index] = reserva;
    } else {
      lista.unshift(reserva);
    }

    await JsonDatabase.guardarLista(ARCHIVO, lista);
    return reserva;
  }

  public static async deleteById(id: string): Promise<boolean> {
    const lista = await this.findAll();
    const filtrada = lista.filter((r) => r.id !== id);
    if (filtrada.length === lista.length) {
      return false;
    }
    await JsonDatabase.guardarLista(ARCHIVO, filtrada);
    return true;
  }

  public static async reset(): Promise<void> {
    await JsonDatabase.guardarLista(ARCHIVO, DATOS_INICIALES);
  }
}
