/**
 * HospedaFlow - Módulo de Perfiles y Usuarios
 * Capa de Vistas (Sección 5.1 y US-2.3 / US-4.1)
 */

import React, { useState } from 'react';
import { RolUsuario, Usuario, UsuarioRequestDTO } from '../types/hotel.ts';
import { Users, Shield, UserCheck, Plus, Edit2, Trash2, Mail, Phone, IdCard, Check } from 'lucide-react';

interface PerfilesViewProps {
  usuarios: Usuario[];
  rolActual: RolUsuario;
  setRolActual: (rol: RolUsuario) => void;
  onCrearUsuario: (dto: UsuarioRequestDTO) => Promise<void>;
  onActualizarUsuario: (id: string, dto: Partial<UsuarioRequestDTO>) => Promise<void>;
  onEliminarUsuario: (id: string) => Promise<void>;
}

export const PerfilesView: React.FC<PerfilesViewProps> = ({
  usuarios,
  rolActual,
  setRolActual,
  onCrearUsuario,
  onActualizarUsuario,
  onEliminarUsuario,
}) => {
  const [filtroRol, setFiltroRol] = useState<string>('Todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioAEditar, setUsuarioAEditar] = useState<Usuario | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Formulario DTO
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState<RolUsuario>('Huesped');
  const [documentoIdentidad, setDocumentoIdentidad] = useState('');

  const abrirModalCrear = () => {
    setUsuarioAEditar(null);
    setNombre('');
    setEmail('');
    setTelefono('');
    setRol('Huesped');
    setDocumentoIdentidad('');
    setErrorForm(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (usr: Usuario) => {
    setUsuarioAEditar(usr);
    setNombre(usr.nombre);
    setEmail(usr.email);
    setTelefono(usr.telefono);
    setRol(usr.rol);
    setDocumentoIdentidad(usr.documentoIdentidad || '');
    setErrorForm(null);
    setModalAbierto(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);
    setGuardando(true);

    try {
      if (!nombre.trim() || !email.trim() || !telefono.trim()) {
        throw new Error('Todos los campos marcados son obligatorios');
      }

      const dto: UsuarioRequestDTO = {
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        rol,
        documentoIdentidad: documentoIdentidad.trim() || undefined,
      };

      if (usuarioAEditar) {
        await onActualizarUsuario(usuarioAEditar.id, dto);
      } else {
        await onCrearUsuario(dto);
      }

      setModalAbierto(false);
    } catch (err: any) {
      setErrorForm(err.message || 'Error al guardar el usuario');
    } finally {
      setGuardando(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    if (filtroRol !== 'Todos' && u.rol !== filtroRol) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            Perfiles de Usuario & Roles Operativos
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Administración del personal hotelero (Admin, Recepción) y huéspedes registrados (US-2.3)
          </p>
        </div>

        {rolActual === 'Admin' && (
          <button
            onClick={abrirModalCrear}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Usuario</span>
          </button>
        )}
      </div>

      {/* Segmented Filter por Rol */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-stone-200">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-stone-500" />
          <span className="text-xs font-semibold text-stone-700">Filtrar por Rol:</span>
        </div>

        <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
          {['Todos', 'Admin', 'Recepcionista', 'Huesped'].map((r) => (
            <button
              key={r}
              onClick={() => setFiltroRol(r)}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filtroRol === r ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {r === 'Admin' ? 'Administradores' : r === 'Huesped' ? 'Huéspedes' : 'Recepcionistas'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {usuariosFiltrados.map((usr) => {
          const badgeColor =
            usr.rol === 'Admin'
              ? 'bg-purple-50 text-purple-800 border-purple-200'
              : usr.rol === 'Recepcionista'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-stone-100 text-stone-700 border-stone-200';

          return (
            <div
              key={usr.id}
              className="bg-white rounded-xl border border-stone-200 p-5 space-y-3.5 hover:border-stone-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-stone-900">{usr.nombre}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border mt-1 ${badgeColor}`}>
                    {usr.rol}
                  </span>
                </div>

                <button
                  onClick={() => setRolActual(usr.rol)}
                  className={`text-[11px] font-medium px-2 py-1 rounded transition-colors ${
                    rolActual === usr.rol
                      ? 'bg-stone-900 text-white font-semibold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                  title="Simular vista con este rol"
                >
                  {rolActual === usr.rol ? '✓ Rol Activo' : 'Usar este Rol'}
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{usr.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="font-mono tabular-nums">{usr.telefono}</span>
                </div>
                {usr.documentoIdentidad && (
                  <div className="flex items-center gap-2">
                    <IdCard className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="font-mono">{usr.documentoIdentidad}</span>
                  </div>
                )}
              </div>

              {rolActual === 'Admin' && (
                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => abrirModalEditar(usr)}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded text-xs transition-colors"
                    title="Editar usuario"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar usuario ${usr.nombre}?`)) {
                        onEliminarUsuario(usr.id);
                      }
                    }}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded text-xs transition-colors"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Crear / Editar Usuario */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-base font-bold text-stone-900">
                {usuarioAEditar ? `Editar ${usuarioAEditar.nombre}` : 'Registrar Nuevo Perfil'}
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            {errorForm && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
                {errorForm}
              </div>
            )}

            <form onSubmit={handleGuardar} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Valentina Rivas"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="correo@hospedaflow.ve"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Teléfono *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+58 412-0000000"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Cédula / Identidad</label>
                  <input
                    type="text"
                    placeholder="V-00000000"
                    value={documentoIdentidad}
                    onChange={(e) => setDocumentoIdentidad(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Rol en el Sistema *</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as RolUsuario)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                >
                  <option value="Huesped">Huésped</option>
                  <option value="Recepcionista">Recepcionista</option>
                  <option value="Admin">Administrador / Gerente</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  {guardando ? 'Guardando...' : usuarioAEditar ? 'Guardar Cambios' : 'Registrar Perfil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
