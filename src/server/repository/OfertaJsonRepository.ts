/**
 * HospedaFlow - Repositorio OfertaJsonRepository
 * Capa de Persistencia (Sección 3.1 del Documento Técnico)
 */

import { Oferta } from '../../types/hotel.ts';
import { JsonDatabase } from '../db/JsonDatabase.ts';

const ARCHIVO = 'ofertas.json';

const DATOS_INICIALES: Oferta[] = [
  {
    id: 'oft-001',
    titulo: 'Escapada de Fin de Semana',
    descripcion: 'Disfruta de un 15% de descuento en reservas de viernes a domingo en cualquier habitación.',
    codigo: 'ESCAPADA15',
    porcentajeDescuento: 15,
    fechaInicio: '2026-01-01',
    fechaFin: '2026-12-31',
    habitacionTipo: 'Todas',
    activa: true,
  },
  {
    id: 'oft-002',
    titulo: 'Temporada Colonial Relax',
    descripcion: '20% de descuento en estancias de 2 o más noches para recargar energías entre semana.',
    codigo: 'RELAX20',
    porcentajeDescuento: 20,
    fechaInicio: '2026-01-01',
    fechaFin: '2026-12-31',
    habitacionTipo: 'Todas',
    activa: true,
  },
  {
    id: 'oft-003',
    titulo: 'Promoción Suites de Lujo',
    descripcion: 'Descuento exclusivo del 25% reservando cualquiera de nuestras Suites Coloniales con balcón.',
    codigo: 'SUITE25',
    porcentajeDescuento: 25,
    fechaInicio: '2026-01-01',
    fechaFin: '2026-12-31',
    habitacionTipo: 'Suite Colonial',
    activa: true,
  },
];

export class OfertaJsonRepository {
  public static async findAll(): Promise<Oferta[]> {
    return await JsonDatabase.leerLista<Oferta>(ARCHIVO, DATOS_INICIALES);
  }

  public static async findById(id: string): Promise<Oferta | null> {
    const lista = await this.findAll();
    return lista.find((o) => o.id === id) || null;
  }

  public static async findByCodigo(codigo: string): Promise<Oferta | null> {
    const lista = await this.findAll();
    return lista.find((o) => o.codigo.toUpperCase().trim() === codigo.toUpperCase().trim()) || null;
  }

  public static async save(oferta: Oferta): Promise<Oferta> {
    const lista = await this.findAll();
    const index = lista.findIndex((o) => o.id === oferta.id);

    if (index >= 0) {
      lista[index] = oferta;
    } else {
      lista.push(oferta);
    }

    await JsonDatabase.guardarLista(ARCHIVO, lista);
    return oferta;
  }

  public static async deleteById(id: string): Promise<boolean> {
    const lista = await this.findAll();
    const filtrada = lista.filter((o) => o.id !== id);
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
