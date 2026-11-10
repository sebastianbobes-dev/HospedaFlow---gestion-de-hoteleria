/**
 * HospedaFlow - Encabezado Principal y Barra de Navegación
 * Cumple con el Top Bar Contract y control estricto de roles (Admin, Recepcionista, Huésped)
 */

import React from 'react';
import { RolUsuario, Usuario } from '../types/hotel.ts';
import { Hotel, Layers, Plus, LogOut, User, Shield, CheckCircle } from 'lucide-react';

interface HeaderProps {
  vistaActual: 'dashboard' | 'habitaciones' | 'reservas' | 'ofertas' | 'perfiles' | 'portalHuesped' | 'login';
  setVistaActual: (vista: 'dashboard' | 'habitaciones' | 'reservas' | 'ofertas' | 'perfiles' | 'portalHuesped' | 'login') => void;
  rolActual: RolUsuario;
  setRolActual: (rol: RolUsuario) => void;
  usuarioAutenticado: Usuario | null;
  onCerrarSesion: () => void;
  onAbrirNuevaReserva: () => void;
  onAbrirArquitectura: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  vistaActual,
  setVistaActual,
  rolActual,
  setRolActual,
  usuarioAutenticado,
  onCerrarSesion,
  onAbrirNuevaReserva,
  onAbrirArquitectura,
}) => {
  const esAdmin = rolActual === 'Admin';
  const esRecepcionista = rolActual === 'Recepcionista';
  const esHuesped = rolActual === 'Huesped';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zona 1: Elemento de Marca (Wordmark de una sola línea) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setVistaActual(esHuesped ? 'portalHuesped' : 'dashboard')}
              className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-90"
            >
              <div className="w-9 h-9 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-lg shadow-sm">
                <Hotel className="w-5 h-5 text-amber-300" />
              </div>
              <span className="text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap">
                HospedaFlow
              </span>
            </button>
          </div>

          {/* Zona 2: Enlaces de Navegación Condicionados por Rol */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            {/* Si es Huésped, ÚNICAMENTE ve el Portal Huésped */}
            {esHuesped ? (
              <button
                onClick={() => setVistaActual('portalHuesped')}
                className="whitespace-nowrap shrink-0 transition-colors py-1 text-amber-900 font-bold border-b-2 border-amber-800"
              >
                Portal Huésped & Reservas
              </button>
            ) : (
              <>
                {/* Admin y Recepcionista pueden ver Dashboard, Reservas, Habitaciones y Ofertas */}
                <button
                  onClick={() => setVistaActual('dashboard')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                    vistaActual === 'dashboard'
                      ? 'text-stone-900 font-semibold border-b-2 border-stone-900'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Panel General
                </button>
                <button
                  onClick={() => setVistaActual('reservas')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                    vistaActual === 'reservas'
                      ? 'text-stone-900 font-semibold border-b-2 border-stone-900'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Reservaciones
                </button>
                <button
                  onClick={() => setVistaActual('habitaciones')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                    vistaActual === 'habitaciones'
                      ? 'text-stone-900 font-semibold border-b-2 border-stone-900'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Habitaciones
                </button>
                <button
                  onClick={() => setVistaActual('ofertas')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                    vistaActual === 'ofertas'
                      ? 'text-stone-900 font-semibold border-b-2 border-stone-900'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Ofertas
                </button>

                {/* ÚNICAMENTE el Administrador puede ver Perfiles & Roles */}
                {esAdmin && (
                  <button
                    onClick={() => setVistaActual('perfiles')}
                    className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                      vistaActual === 'perfiles'
                        ? 'text-purple-900 font-semibold border-b-2 border-purple-900'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Perfiles & Roles
                  </button>
                )}

                {/* Enlace directo a Portal Huésped para pruebas */}
                <button
                  onClick={() => setVistaActual('portalHuesped')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                    vistaActual === 'portalHuesped'
                      ? 'text-amber-800 font-semibold border-b-2 border-amber-800'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Vista Huésped
                </button>
              </>
            )}
          </nav>

          {/* Zona 3: Información de Sesión Activa & Acciones */}
          <div className="flex items-center gap-2.5 shrink-0">
            {usuarioAutenticado ? (
              <div className="flex items-center gap-2 bg-stone-100/90 py-1 px-2.5 rounded-xl border border-stone-200">
                <div className="w-6 h-6 rounded-lg bg-stone-900 text-white flex items-center justify-center text-xs font-bold">
                  {usuarioAutenticado.nombre.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[11px] font-bold text-stone-900 leading-tight truncate max-w-[110px]">
                    {usuarioAutenticado.nombre}
                  </div>
                  <div className="text-[10px] font-mono leading-none text-stone-500">
                    Rol: <span className="font-semibold text-stone-700">{usuarioAutenticado.rol}</span>
                  </div>
                </div>

                <button
                  onClick={onCerrarSesion}
                  className="p-1 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors ml-1"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setVistaActual('login')}
                className="px-3 py-1.5 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                Iniciar Sesión
              </button>
            )}

            <button
              onClick={onAbrirArquitectura}
              className="hidden lg:flex p-2 text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors text-xs font-medium items-center gap-1.5"
              title="Inspeccionar backend/ en Java y frontend/ en HTML/JS"
            >
              <Layers className="w-4 h-4 text-stone-500" />
              <span className="whitespace-nowrap">Código Java & HTML</span>
            </button>

            {!esHuesped && (
              <button
                onClick={onAbrirNuevaReserva}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Reserva</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
