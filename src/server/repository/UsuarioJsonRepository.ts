/**
 * HospedaFlow - Repositorio UsuarioJsonRepository
 * Capa de Persistencia (Sección 3.1 del Documento Técnico)
 */

import { Usuario } from '../../types/hotel.ts';
import { JsonDatabase } from '../db/JsonDatabase.ts';

const ARCHIVO = 'usuarios.json';

const DATOS_INICIALES: Usuario[] = [
  {
    id: 'usr-admin-default',
    nombre: 'Administrador Principal',
    email: 'admin@gmail.com',
    password: '123admin',
    telefono: '+58 412-5550100',
    rol: 'Admin',
    documentoIdentidad: 'V-20123456',
    fechaRegistro: '2026-01-01',
  },
  {
    id: 'usr-admin-1',
    nombre: 'Sebastián Bobes',
    email: 'admin@hospedaflow.ve',
    password: 'admin123',
    telefono: '+58 412-5550101',
    rol: 'Admin',
    documentoIdentidad: 'V-25890123',
    fechaRegistro: '2026-01-10',
  },
  {
    id: 'usr-recep-1',
    nombre: 'Valentina Rivas',
    email: 'recepcion@hospedaflow.ve',
    password: 'recep123',
    telefono: '+58 424-9988776',
    rol: 'Recepcionista',
    documentoIdentidad: 'V-27412890',
    fechaRegistro: '2026-01-15',
  },
  {
    id: 'usr-huesped-1',
    nombre: 'Carlos Mendoza',
    email: 'carlos.mendoza@gmail.com',
    password: 'guest123',
    telefono: '+58 414-3214567',
    rol: 'Huesped',
    documentoIdentidad: 'V-20112345',
    fechaRegistro: '2026-02-01',
  },
  {
    id: 'usr-huesped-2',
    nombre: 'Mariana Silva',
    email: 'mariana.silva@hotmail.com',
    password: 'guest123',
    telefono: '+58 416-8765432',
    rol: 'Huesped',
    documentoIdentidad: 'V-22445566',
    fechaRegistro: '2026-02-14',
  },
  {
    id: 'usr-huesped-3',
    nombre: 'Andrés Azuaje',
    email: 'andres.azuaje@gmail.com',
    password: 'guest123',
    telefono: '+58 412-7778899',
    rol: 'Huesped',
    documentoIdentidad: 'V-24667788',
    fechaRegistro: '2026-02-20',
  },
];

export class UsuarioJsonRepository {
  public static async findAll(): Promise<Usuario[]> {
    return await JsonDatabase.leerLista<Usuario>(ARCHIVO, DATOS_INICIALES);
  }

  public static async findById(id: string): Promise<Usuario | null> {
    const lista = await this.findAll();
    return lista.find((u) => u.id === id) || null;
  }

  public static async findByEmail(email: string): Promise<Usuario | null> {
    const lista = await this.findAll();
    return lista.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()) || null;
  }

  public static async save(usuario: Usuario): Promise<Usuario> {
    const lista = await this.findAll();
    const index = lista.findIndex((u) => u.id === usuario.id);

    if (index >= 0) {
      lista[index] = usuario;
    } else {
      lista.push(usuario);
    }

    await JsonDatabase.guardarLista(ARCHIVO, lista);
    return usuario;
  }

  public static async deleteById(id: string): Promise<boolean> {
    const lista = await this.findAll();
    const filtrada = lista.filter((u) => u.id !== id);
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
