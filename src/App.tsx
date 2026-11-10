/**
 * HospedaFlow - Aplicación Principal
 * Sprint 1: Sistema de Gestión para Hoteles Pequeños y Medianos (Venezuela)
 * Control de Autenticación, Roles y Permisos Estrictos
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api/client.ts';
import {
  DashboardStats,
  EstadoHabitacion,
  Habitacion,
  HabitacionRequestDTO,
  Oferta,
  OfertaRequestDTO,
  Reserva,
  ReservaRequestDTO,
  RolUsuario,
  TipoHabitacion,
  Usuario,
  UsuarioRequestDTO,
} from './types/hotel.ts';
import { Header } from './components/Header.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { HabitacionesView } from './components/HabitacionesView.tsx';
import { ReservasView } from './components/ReservasView.tsx';
import { OfertasView } from './components/OfertasView.tsx';
import { PerfilesView } from './components/PerfilesView.tsx';
import { HuespedPortalView } from './components/HuespedPortalView.tsx';
import { LoginView } from './components/LoginView.tsx';
import { ArquitecturaModal } from './components/ArquitecturaModal.tsx';
import { Hotel, Layers, ShieldCheck, Heart } from 'lucide-react';

// Administrador por Default (admin@gmail.com / 123admin)
const ADMIN_DEFAULT: Usuario = {
  id: 'usr-admin-default',
  nombre: 'Administrador Principal',
  email: 'admin@gmail.com',
  password: '123admin',
  telefono: '+58 412-5550100',
  rol: 'Admin',
  documentoIdentidad: 'V-20123456',
  fechaRegistro: '2026-01-01',
};

export default function App() {
  // Estado de Usuario Autenticado
  const [usuarioAutenticado, setUsuarioAutenticado] = useState<Usuario | null>(() => {
    try {
      const guardado = localStorage.getItem('hospedaflow_user');
      return guardado ? JSON.parse(guardado) : ADMIN_DEFAULT;
    } catch {
      return ADMIN_DEFAULT;
    }
  });

  const [rolActual, setRolActual] = useState<RolUsuario>(usuarioAutenticado?.rol || 'Admin');

  const [vistaActual, setVistaActual] = useState<
    'dashboard' | 'habitaciones' | 'reservas' | 'ofertas' | 'perfiles' | 'portalHuesped' | 'login'
  >(() => {
    if (!usuarioAutenticado) return 'login';
    return usuarioAutenticado.rol === 'Huesped' ? 'portalHuesped' : 'dashboard';
  });

  // Estados de datos maestros
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [cargando, setCargando] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  // Estados de modales
  const [modalNuevaReservaAbierto, setModalNuevaReservaAbierto] = useState(false);
  const [habitacionPreseleccionada, setHabitacionPreseleccionada] = useState<Habitacion | null>(null);
  const [modalArquitecturaAbierto, setModalArquitecturaAbierto] = useState(false);

  // Cargar datos desde el backend REST
  const recargarTodo = useCallback(async () => {
    try {
      setCargando(true);
      setErrorGlobal(null);

      const [resHabitaciones, resReservas, resOfertas, resUsuarios, resStats] = await Promise.all([
        api.getHabitaciones(),
        api.getReservas(),
        api.getOfertas(),
        api.getUsuarios(),
        api.getStats(),
      ]);

      setHabitaciones(resHabitaciones);
      setReservas(resReservas);
      setOfertas(resOfertas);
      setUsuarios(resUsuarios);
      setStats(resStats);
    } catch (err: any) {
      console.error('[HospedaFlow] Error cargando datos:', err);
      setErrorGlobal(err.message || 'Error al conectar con la API del backend');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargarTodo();
  }, [recargarTodo]);

  // Manejo de Inicio y Cierre de Sesión
  const handleLoginExitoso = (usuario: Usuario) => {
    setUsuarioAutenticado(usuario);
    setRolActual(usuario.rol);
    try {
      localStorage.setItem('hospedaflow_user', JSON.stringify(usuario));
    } catch {}

    // El Huésped solo puede ver el portal huésped
    if (usuario.rol === 'Huesped') {
      setVistaActual('portalHuesped');
    } else {
      setVistaActual('dashboard');
    }
  };

  const handleCerrarSesion = () => {
    setUsuarioAutenticado(null);
    try {
      localStorage.removeItem('hospedaflow_user');
    } catch {}
    setVistaActual('login');
  };

  // Manejadores Habitaciones
  const handleCambiarEstadoHabitacion = async (id: string, nuevoEstado: EstadoHabitacion) => {
    try {
      await api.cambiarEstadoHabitacion(id, nuevoEstado);
      await recargarTodo();
    } catch (err: any) {
      alert(err.message || 'Error cambiando estado');
    }
  };

  const handleCrearHabitacion = async (dto: HabitacionRequestDTO) => {
    await api.crearHabitacion(dto);
    await recargarTodo();
  };

  const handleActualizarHabitacion = async (id: string, dto: Partial<HabitacionRequestDTO>) => {
    await api.actualizarHabitacion(id, dto);
    await recargarTodo();
  };

  const handleEliminarHabitacion = async (id: string) => {
    try {
      await api.eliminarHabitacion(id);
      await recargarTodo();
    } catch (err: any) {
      alert(err.message || 'Error eliminando habitación');
    }
  };

  const handleConsultarDisponibilidad = async (
    fechaEntrada: string,
    fechaSalida: string,
    tipo?: TipoHabitacion,
    numHuespedes?: number
  ) => {
    return await api.consultarDisponibilidad(fechaEntrada, fechaSalida, tipo, numHuespedes);
  };

  const handleAbrirReservaParaHabitacion = (hab: Habitacion) => {
    setHabitacionPreseleccionada(hab);
    setModalNuevaReservaAbierto(true);
  };

  // Manejadores Reservas
  const handleCrearReserva = async (dto: ReservaRequestDTO) => {
    await api.crearReserva(dto);
    await recargarTodo();
  };

  const handleModificarFechas = async (id: string, fechaEntrada: string, fechaSalida: string) => {
    await api.modificarFechasReserva(id, fechaEntrada, fechaSalida);
    await recargarTodo();
  };

  const handleConfirmarReserva = async (id: string) => {
    try {
      await api.confirmarReserva(id);
      await recargarTodo();
    } catch (err: any) {
      alert(err.message || 'Error confirmando reserva');
    }
  };

  const handleCancelarReserva = async (id: string, motivo?: string) => {
    try {
      await api.cancelarReserva(id, motivo);
      await recargarTodo();
    } catch (err: any) {
      alert(err.message || 'Error cancelando reserva');
    }
  };

  const handleAsignarHabitacion = async (id: string, nuevaHabitacionId: string) => {
    await api.asignarHabitacionReserva(id, nuevaHabitacionId);
    await recargarTodo();
  };

  const handleEliminarReserva = async (id: string) => {
    try {
      await api.eliminarReserva(id);
      await recargarTodo();
    } catch (err: any) {
      alert(err.message || 'Error eliminando reserva');
    }
  };

  // Manejadores Ofertas
  const handleCrearOferta = async (dto: OfertaRequestDTO) => {
    await api.crearOferta(dto);
    await recargarTodo();
  };

  const handleActualizarOferta = async (id: string, dto: Partial<OfertaRequestDTO>) => {
    await api.actualizarOferta(id, dto);
    await recargarTodo();
  };

  const handleEliminarOferta = async (id: string) => {
    try {
      await api.eliminarOferta(id);
      await recargarTodo();
    } catch (err: any) {
      alert(err.message || 'Error eliminando oferta');
    }
  };

  // Manejadores Usuarios
  const handleCrearUsuario = async (dto: UsuarioRequestDTO) => {
    await api.crearUsuario(dto);
    await recargarTodo();
  };

  const handleActualizarUsuario = async (id: string, dto: Partial<UsuarioRequestDTO>) => {
    await api.actualizarUsuario(id, dto);
    await recargarTodo();
  };

  const handleEliminarUsuario = async (id: string) => {
    try {
      await api.eliminarUsuario(id);
      await recargarTodo();
    } catch (err: any) {
      alert(err.message || 'Error eliminando usuario');
    }
  };

  // Validación estricta de vistas por rol
  const esAdmin = rolActual === 'Admin';
  const esHuesped = rolActual === 'Huesped';

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Bar Navigation */}
      <Header
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
        rolActual={rolActual}
        setRolActual={setRolActual}
        usuarioAutenticado={usuarioAutenticado}
        onCerrarSesion={handleCerrarSesion}
        onAbrirNuevaReserva={() => {
          setHabitacionPreseleccionada(null);
          setModalNuevaReservaAbierto(true);
        }}
        onAbrirArquitectura={() => setModalArquitecturaAbierto(true)}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorGlobal && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
            <span>{errorGlobal}</span>
            <button
              onClick={recargarTodo}
              className="font-semibold underline ml-2 hover:text-rose-950"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* 1. Módulo de Inicio de Sesión */}
        {vistaActual === 'login' && (
          <LoginView onLoginExitoso={handleLoginExitoso} />
        )}

        {/* 2. Restricción Estricta para Huésped: Únicamente Portal Huésped */}
        {esHuesped && vistaActual !== 'login' && (
          <HuespedPortalView
            habitaciones={habitaciones}
            ofertas={ofertas}
            reservas={reservas}
            onAbrirReservaParaHabitacion={handleAbrirReservaParaHabitacion}
          />
        )}

        {/* 3. Vistas para Personal Operativo (Admin y Recepción) */}
        {!esHuesped && vistaActual !== 'login' && (
          <>
            {vistaActual === 'dashboard' && (
              <DashboardView
                stats={stats}
                habitaciones={habitaciones}
                reservas={reservas}
                onCambiarEstadoHabitacion={handleCambiarEstadoHabitacion}
                onIrAHabitaciones={() => setVistaActual('habitaciones')}
                onIrAReservas={() => setVistaActual('reservas')}
                onAbrirNuevaReserva={() => {
                  setHabitacionPreseleccionada(null);
                  setModalNuevaReservaAbierto(true);
                }}
                onConfirmarReserva={handleConfirmarReserva}
                onCancelarReserva={handleCancelarReserva}
                onRecargar={recargarTodo}
                cargando={cargando}
              />
            )}

            {vistaActual === 'habitaciones' && (
              <HabitacionesView
                habitaciones={habitaciones}
                rolActual={rolActual}
                onCrearHabitacion={handleCrearHabitacion}
                onActualizarHabitacion={handleActualizarHabitacion}
                onCambiarEstado={handleCambiarEstadoHabitacion}
                onEliminarHabitacion={handleEliminarHabitacion}
                onConsultarDisponibilidad={handleConsultarDisponibilidad}
                onAbrirReservaParaHabitacion={handleAbrirReservaParaHabitacion}
              />
            )}

            {vistaActual === 'reservas' && (
              <ReservasView
                reservas={reservas}
                habitaciones={habitaciones}
                ofertas={ofertas}
                usuarios={usuarios}
                rolActual={rolActual}
                onCrearReserva={handleCrearReserva}
                onModificarFechas={handleModificarFechas}
                onConfirmarReserva={handleConfirmarReserva}
                onCancelarReserva={handleCancelarReserva}
                onAsignarHabitacion={handleAsignarHabitacion}
                onEliminarReserva={handleEliminarReserva}
                modalNuevaReservaAbierto={modalNuevaReservaAbierto}
                setModalNuevaReservaAbierto={setModalNuevaReservaAbierto}
                habitacionPreseleccionada={habitacionPreseleccionada}
                setHabitacionPreseleccionada={setHabitacionPreseleccionada}
              />
            )}

            {vistaActual === 'ofertas' && (
              <OfertasView
                ofertas={ofertas}
                rolActual={rolActual}
                onCrearOferta={handleCrearOferta}
                onActualizarOferta={handleActualizarOferta}
                onEliminarOferta={handleEliminarOferta}
              />
            )}

            {/* ÚNICAMENTE el Administrador puede ver Perfiles y Roles */}
            {vistaActual === 'perfiles' && esAdmin && (
              <PerfilesView
                usuarios={usuarios}
                rolActual={rolActual}
                setRolActual={setRolActual}
                onCrearUsuario={handleCrearUsuario}
                onActualizarUsuario={handleActualizarUsuario}
                onEliminarUsuario={handleEliminarUsuario}
              />
            )}

            {vistaActual === 'portalHuesped' && (
              <HuespedPortalView
                habitaciones={habitaciones}
                ofertas={ofertas}
                reservas={reservas}
                onAbrirReservaParaHabitacion={handleAbrirReservaParaHabitacion}
              />
            )}
          </>
        )}
      </main>

      {/* Modal de Arquitectura Backend y Persistencia JSON */}
      <ArquitecturaModal
        abierto={modalArquitecturaAbierto}
        onCerrar={() => setModalArquitecturaAbierto(false)}
        onDataReset={recargarTodo}
      />

      {/* Pie de Página */}
      <footer className="bg-white border-t border-stone-200 mt-16 py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Hotel className="w-4 h-4 text-stone-400" />
            <span className="font-semibold text-stone-700">HospedaFlow</span>
            <span>·</span>
            <span>Sprint 1 · Posada & Hotel Boutique</span>
          </div>

          <div className="flex items-center gap-4 text-stone-500">
            <button
              onClick={() => setModalArquitecturaAbierto(true)}
              className="hover:text-stone-900 underline flex items-center gap-1 font-medium"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ver Diagrama y Archivos JSON</span>
            </button>
            <span>·</span>
            <span>Solo Moneda Ref. $ Informativa</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
