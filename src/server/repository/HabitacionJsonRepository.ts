/**
 * HospedaFlow - Repositorio HabitacionJsonRepository
 * Capa de Persistencia (Sección 3.1 del Documento Técnico)
 */

import { Habitacion } from '../../types/hotel.ts';
import { JsonDatabase } from '../db/JsonDatabase.ts';

const ARCHIVO = 'habitaciones.json';

const DATOS_INICIALES: Habitacion[] = [
  {
    id: 'hab-101',
    numero: '101',
    tipo: 'Suite Colonial',
    precioBase: 85,
    capacidad: 2,
    estado: 'Disponible',
    descripcion: 'Espaciosa suite con cama king, balcón colonial con vista a los jardines y baño privado de piedra.',
    caracteristicas: ['Cama King', 'Aire Acondicionado', 'Balcón Colonial', 'Wifi 100Mbps', 'Baño Privado'],
    piso: 1,
  },
  {
    id: 'hab-102',
    numero: '102',
    tipo: 'Doble',
    precioBase: 55,
    capacidad: 2,
    estado: 'Ocupada',
    descripcion: 'Dos camas individuales confortables, techo de tejas a la vista y armario empotrado de cedro.',
    caracteristicas: ['2 Camas Individuales', 'Aire Acondicionado', 'Wifi', 'Ducha de Agua Caliente'],
    piso: 1,
  },
  {
    id: 'hab-103',
    numero: '103',
    tipo: 'Matrimonial',
    precioBase: 65,
    capacidad: 2,
    estado: 'Disponible',
    descripcion: 'Cama queen artesanal, lencería de algodón fresco y acceso directo al corredor principal.',
    caracteristicas: ['Cama Queen', 'Aire Acondicionado', 'Wifi', 'Ventilador de Techo Colonial'],
    piso: 1,
  },
  {
    id: 'hab-104',
    numero: '104',
    tipo: 'Familiar',
    precioBase: 95,
    capacidad: 4,
    estado: 'Disponible',
    descripcion: 'Habitación amplia para familias con 1 cama matrimonial y 2 individuales, espacio para equipaje.',
    caracteristicas: ['1 Matrimonial + 2 Individuales', 'Nevera Ejecutiva', 'Aire Acondicionado', 'Smart TV'],
    piso: 1,
  },
  {
    id: 'hab-105',
    numero: '105',
    tipo: 'Individual',
    precioBase: 40,
    capacidad: 1,
    estado: 'Mantenimiento',
    descripcion: 'Acogedora habitación individual para viajeros solos o estancias cortas. En renovación de pintura.',
    caracteristicas: ['1 Cama Individual', 'Escritorio de Trabajo', 'Aire Acondicionado', 'Wifi'],
    piso: 1,
  },
  {
    id: 'hab-201',
    numero: '201',
    tipo: 'Suite Colonial',
    precioBase: 110,
    capacidad: 3,
    estado: 'Disponible',
    descripcion: 'Master Suite con techos altos de madera caoba, sala de estar independiente y hamaca tradicional.',
    caracteristicas: ['Cama King + Sofá Cama', 'Sala de Estar', 'Hamaca Artesanal', 'Frigobar', 'Wifi Premium'],
    piso: 2,
  },
  {
    id: 'hab-202',
    numero: '202',
    tipo: 'Doble',
    precioBase: 60,
    capacidad: 2,
    estado: 'Disponible',
    descripcion: 'Habitación doble en segunda planta con vista panorámica a la serranía y gran luminosidad.',
    caracteristicas: ['2 Camas Individuales', 'Balcón Superior', 'Aire Acondicionado', 'Caja Fuerte'],
    piso: 2,
  },
  {
    id: 'hab-203',
    numero: '203',
    tipo: 'Familiar',
    precioBase: 120,
    capacidad: 5,
    estado: 'Disponible',
    descripcion: 'Gran suite familiar de 2 ambientes con capacidad para 5 personas y vista a la piscina.',
    caracteristicas: ['2 Ambientes', 'Cama King + 3 Individuales', 'Desayunador', 'Aire Acondicionado'],
    piso: 2,
  },
];

export class HabitacionJsonRepository {
  public static async findAll(): Promise<Habitacion[]> {
    return await JsonDatabase.leerLista<Habitacion>(ARCHIVO, DATOS_INICIALES);
  }

  public static async findById(id: string): Promise<Habitacion | null> {
    const lista = await this.findAll();
    return lista.find((h) => h.id === id) || null;
  }

  public static async findByNumero(numero: string): Promise<Habitacion | null> {
    const lista = await this.findAll();
    return lista.find((h) => h.numero.trim() === numero.trim()) || null;
  }

  public static async save(habitacion: Habitacion): Promise<Habitacion> {
    const lista = await this.findAll();
    const index = lista.findIndex((h) => h.id === habitacion.id);

    if (index >= 0) {
      lista[index] = habitacion;
    } else {
      lista.push(habitacion);
    }

    await JsonDatabase.guardarLista(ARCHIVO, lista);
    return habitacion;
  }

  public static async deleteById(id: string): Promise<boolean> {
    const lista = await this.findAll();
    const filtrada = lista.filter((h) => h.id !== id);
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
