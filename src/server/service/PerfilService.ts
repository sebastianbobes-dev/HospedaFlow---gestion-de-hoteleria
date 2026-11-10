/**
 * HospedaFlow - Servicio PerfilService
 * Capa de Servicios / Lógica de Negocio (Sección 3.2 y US-2.3)
 */

import { RolUsuario, Usuario, UsuarioRequestDTO } from '../../types/hotel.ts';
import { UsuarioJsonRepository } from '../repository/UsuarioJsonRepository.ts';

export class PerfilService {
  /**
   * Obtiene la lista de usuarios, opcionalmente filtrada por rol
   */
  public static async listarUsuarios(rol?: RolUsuario): Promise<Usuario[]> {
    const usuarios = await UsuarioJsonRepository.findAll();
    if (rol) {
      return usuarios.filter((u) => u.rol === rol);
    }
    return usuarios;
  }

  /**
   * Obtiene un usuario por ID
   */
  public static async obtenerPorId(id: string): Promise<Usuario> {
    const usuario = await UsuarioJsonRepository.findById(id);
    if (!usuario) {
      throw new Error(`Usuario con ID '${id}' no encontrado`);
    }
    return usuario;
  }

  /**
   * Crea un nuevo perfil de usuario (Admin, Recepcionista o Huésped)
   */
  public static async crearUsuario(dto: UsuarioRequestDTO): Promise<Usuario> {
    if (!dto.nombre || !dto.email || !dto.telefono || !dto.rol) {
      throw new Error('Nombre, correo electrónico, teléfono y rol son obligatorios');
    }

    const emailLimpio = dto.email.trim().toLowerCase();
    const existente = await UsuarioJsonRepository.findByEmail(emailLimpio);
    if (existente) {
      throw new Error(`Ya existe un usuario registrado con el email '${emailLimpio}'`);
    }

    const nuevoUsuario: Usuario = {
      id: `usr-${dto.rol.toLowerCase()}-${Date.now()}`,
      nombre: dto.nombre.trim(),
      email: emailLimpio,
      password: dto.password || 'hospeda123',
      telefono: dto.telefono.trim(),
      rol: dto.rol,
      documentoIdentidad: dto.documentoIdentidad?.trim() || '',
      fechaRegistro: new Date().toISOString().split('T')[0],
    };

    return await UsuarioJsonRepository.save(nuevoUsuario);
  }

  /**
   * Autentica credenciales y devuelve el usuario
   */
  public static async autenticar(email: string, password?: string): Promise<Usuario> {
    if (!email) {
      throw new Error('Debe proporcionar un correo electrónico');
    }

    const usuario = await UsuarioJsonRepository.findByEmail(email.trim().toLowerCase());
    if (!usuario) {
      throw new Error('Credenciales inválidas: usuario no encontrado');
    }

    if (password && usuario.password && usuario.password !== password) {
      throw new Error('Contraseña incorrecta');
    }

    return usuario;
  }

  /**
   * Actualiza el perfil de un usuario
   */
  public static async actualizarUsuario(id: string, dto: Partial<UsuarioRequestDTO>): Promise<Usuario> {
    const usuario = await this.obtenerPorId(id);

    if (dto.email && dto.email.trim().toLowerCase() !== usuario.email) {
      const repetido = await UsuarioJsonRepository.findByEmail(dto.email.trim().toLowerCase());
      if (repetido && repetido.id !== id) {
        throw new Error(`El email '${dto.email}' ya pertenece a otro usuario`);
      }
      usuario.email = dto.email.trim().toLowerCase();
    }

    if (dto.nombre) usuario.nombre = dto.nombre.trim();
    if (dto.telefono) usuario.telefono = dto.telefono.trim();
    if (dto.rol) usuario.rol = dto.rol;
    if (dto.password) usuario.password = dto.password;
    if (dto.documentoIdentidad !== undefined) usuario.documentoIdentidad = dto.documentoIdentidad.trim();

    return await UsuarioJsonRepository.save(usuario);
  }

  /**
   * Elimina un usuario por ID
   */
  public static async eliminarUsuario(id: string): Promise<boolean> {
    await this.obtenerPorId(id);
    return await UsuarioJsonRepository.deleteById(id);
  }
}
