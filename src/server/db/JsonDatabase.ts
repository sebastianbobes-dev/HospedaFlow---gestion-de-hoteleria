/**
 * HospedaFlow - Motor de Persistencia Plano JSON
 * Capa de Utilidades de Base de Datos (Sección 3.1 del Documento Técnico)
 */

import fs from 'fs/promises';
import path from 'path';

export class JsonDatabase {
  private static baseDir = path.resolve(process.cwd(), 'data');

  /**
   * Garantiza que el directorio de almacenamiento exista
   */
  public static async asegurarDirectorio(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (error) {
      console.error('[JsonDatabase] Error creando directorio data:', error);
    }
  }

  /**
   * Obtiene la ruta física completa para un archivo JSON
   */
  public static getRutaArchivo(nombreArchivo: string): string {
    const filename = nombreArchivo.endsWith('.json') ? nombreArchivo : `${nombreArchivo}.json`;
    return path.join(this.baseDir, filename);
  }

  /**
   * Lee una lista de elementos genéricos desde un archivo plano JSON en disco
   * Equivale a leerLista(String rutaArchivo, TypeReference<List<T>> tipo)
   */
  public static async leerLista<T>(nombreArchivo: string, defaultData: T[] = []): Promise<T[]> {
    await this.asegurarDirectorio();
    const ruta = this.getRutaArchivo(nombreArchivo);

    try {
      const data = await fs.readFile(ruta, 'utf-8');
      if (!data.trim()) {
        return defaultData;
      }
      return JSON.parse(data) as T[];
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // El archivo no existe aún, inicializar con defaultData y guardar
        await this.guardarLista(nombreArchivo, defaultData);
        return defaultData;
      }
      console.error(`[JsonDatabase] Error al leer archivo ${ruta}:`, error);
      return defaultData;
    }
  }

  /**
   * Guarda una lista completa de entidades hacia un archivo físico plano en disco
   * Equivale a guardarLista(String rutaArchivo, List<T> lista)
   */
  public static async guardarLista<T>(nombreArchivo: string, lista: T[]): Promise<void> {
    await this.asegurarDirectorio();
    const ruta = this.getRutaArchivo(nombreArchivo);

    try {
      const jsonContent = JSON.stringify(lista, null, 2);
      await fs.writeFile(ruta, jsonContent, 'utf-8');
    } catch (error) {
      console.error(`[JsonDatabase] Error al guardar archivo ${ruta}:`, error);
      throw new Error(`Error de persistencia I/O en ${nombreArchivo}`);
    }
  }

  /**
   * Lee el contenido crudo en formato texto de un archivo de datos
   * (Útil para el Visor de Arquitectura)
   */
  public static async obtenerContenidoCrudo(nombreArchivo: string): Promise<string> {
    const ruta = this.getRutaArchivo(nombreArchivo);
    try {
      return await fs.readFile(ruta, 'utf-8');
    } catch {
      return '[]';
    }
  }
}
