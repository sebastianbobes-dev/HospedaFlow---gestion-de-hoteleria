/**
 * HospedaFlow - Vista del Panel General / Recepción
 * Dashboard operativo para hoteles pequeños y medianos
 */

import React, { useState } from 'react';
import { DashboardStats, EstadoHabitacion, Habitacion, Reserva } from '../types/hotel.ts';
import {
  BedDouble,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface DashboardViewProps {
  stats: DashboardStats | null;
  habitaciones: Habitacion[];
  reservas: Reserva[];
  onCambiarEstadoHabitacion: (id: string, nuevoEstado: EstadoHabitacion) => Promise<void>;
  onIrAHabitaciones: () => void;
  onIrAReservas: () => void;
  onAbrirNuevaReserva: () => void;
  onConfirmarReserva: (id: string) => Promise<void>;
  onCancelarReserva: (id: string) => Promise<void>;
  onRecargar: () => void;
  cargando: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  habitaciones,
  reservas,
  onCambiarEstadoHabitacion,
  onIrAHabitaciones,
  onIrAReservas,
  onAbrirNuevaReserva,
  onConfirmarReserva,
  onCancelarReserva,
  onRecargar,
  cargando,
}) => {
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);

  const handleCambioRapidoEstado = async (id: string, estadoActual: EstadoHabitacion) => {
    try {
      setActualizandoId(id);
      let siguienteEstado: EstadoHabitacion = 'Disponible';
      if (estadoActual === 'Disponible') siguienteEstado = 'Ocupada';
      else if (estadoActual === 'Ocupada') siguienteEstado = 'Mantenimiento';
      else siguienteEstado = 'Disponible';

      await onCambiarEstadoHabitacion(id, siguienteEstado);
    } finally {
      setActualizandoId(null);
    }
  };

  const reservasPendientes = reservas.filter((r) => r.estado === 'Pendiente');
  const reservasConfirmadas = reservas.filter((r) => r.estado === 'Confirmada');

  return (
    <div className="space-y-8">
      {/* Hero Banner Posada Boutique */}
      <div className="relative overflow-hidden rounded-2xl bg-stone-900 text-white shadow-md">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/src/assets/images/hotel_posada_exterior_1794268257388.jpg"
            alt="Posada Boutique El Encanto"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />
        </div>

        <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-medium tracking-wide mb-2">
            <span>HospedaFlow</span>
            <span aria-hidden="true">·</span>
            <span>Sprint 1 Backend & Frontend</span>
            <span aria-hidden="true">·</span>
            <span>Sede Única Independiente</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2 text-balance">
            Gestión Operativa de Posada & Hotel
          </h1>
          <p className="text-stone-300 text-sm leading-relaxed mb-6 max-w-xl">
            Control centralizado de reservaciones, disponibilidad de habitaciones en tiempo real, catálogo de
            ofertas y perfiles de huéspedes con persistencia ligera en archivos JSON locales.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onAbrirNuevaReserva}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
            >
              Registrar Reserva Inmediata
            </button>
            <button
              onClick={onIrAHabitaciones}
              className="px-4 py-2 bg-stone-800/80 hover:bg-stone-700 text-white font-medium text-xs rounded-lg transition-colors border border-stone-700/60"
            >
              Consultar Disponibilidad por Fechas
            </button>
            <button
              onClick={onRecargar}
              disabled={cargando}
              className="p-2 bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg transition-colors border border-stone-700/60"
              title="Actualizar datos desde backend"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Franja de Indicadores Clave (KPIs con Tabular Numerals) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
            <span>Tasa de Ocupación</span>
            <TrendingUp className="w-4 h-4 text-stone-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono tabular-nums">
              {stats?.porcentajeOcupacion ?? 0}%
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            <span className="font-mono tabular-nums font-medium text-stone-800">{stats?.habitacionesOcupadas ?? 0}</span> de{' '}
            <span className="font-mono tabular-nums">{stats?.totalHabitaciones ?? 0}</span> habitaciones ocupadas
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
            <span>Habitaciones Libres</span>
            <BedDouble className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono tabular-nums">
              {stats?.habitacionesDisponibles ?? 0}
            </span>
            <span className="text-xs text-stone-400">disponibles hoy</span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            <span className="font-mono tabular-nums text-amber-700 font-medium">{stats?.habitacionesMantenimiento ?? 0}</span> en mantenimiento
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
            <span>Reservas Activas</span>
            <CalendarCheck className="w-4 h-4 text-stone-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono tabular-nums">
              {(stats?.reservasConfirmadas ?? 0) + (stats?.reservasPendientes ?? 0)}
            </span>
            <span className="text-xs text-stone-500">en sistema</span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            <span className="font-mono tabular-nums text-amber-600 font-medium">{stats?.reservasPendientes ?? 0}</span> pendientes por confirmar
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
            <span>Ingresos Informativos</span>
            <DollarSign className="w-4 h-4 text-stone-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-medium text-stone-500">Ref. $</span>
            <span className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono tabular-nums">
              {(stats?.ingresosTotalesInformativos ?? 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Registro manual sin pasarela bancaria
          </p>
        </div>
      </div>

      {/* Tablero Operativo de Habitaciones en Tiempo Real */}
      <div className="bg-white p-6 rounded-xl border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Estado de Habitaciones en Vivo</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Haz clic en cualquier habitación para alternar su estado operativo instantáneamente
            </p>
          </div>
          <button
            onClick={onIrAHabitaciones}
            className="text-xs font-medium text-stone-700 hover:text-stone-900 flex items-center gap-1 shrink-0"
          >
            <span>Ver detalle completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {habitaciones.map((hab) => {
            const isUpdating = actualizandoId === hab.id;
            const estadoBg =
              hab.estado === 'Disponible'
                ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300 text-emerald-950'
                : hab.estado === 'Ocupada'
                ? 'bg-rose-50 border-rose-200 hover:border-rose-300 text-rose-950'
                : 'bg-amber-50 border-amber-200 hover:border-amber-300 text-amber-950';

            const statusDot =
              hab.estado === 'Disponible'
                ? 'text-emerald-700'
                : hab.estado === 'Ocupada'
                ? 'text-rose-700'
                : 'text-amber-700';

            return (
              <button
                key={hab.id}
                onClick={() => handleCambioRapidoEstado(hab.id, hab.estado)}
                disabled={isUpdating}
                className={`p-3 rounded-lg border text-left transition-all ${estadoBg} ${
                  isUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer'
                }`}
                title={`Habitación ${hab.numero} (${hab.tipo}) - Clic para cambiar estado`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-base text-stone-900 tabular-nums">
                    #{hab.numero}
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono tabular-nums">
                    {hab.capacidad}p
                  </span>
                </div>
                <div className="text-[11px] font-medium truncate text-stone-700 mb-1">
                  {hab.tipo}
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className={`font-semibold ${statusDot}`}>{hab.estado}</span>
                  <span className="text-stone-600 font-mono tabular-nums">${hab.precioBase}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de 2 Columnas: Reservas Pendientes & Últimas Confirmadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reservas Pendientes por Confirmar */}
        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-stone-900">Reservaciones Pendientes</h3>
            </div>
            <span className="text-xs font-mono font-medium bg-amber-50 text-amber-800 px-2 py-0.5 rounded">
              {reservasPendientes.length}
            </span>
          </div>

          {reservasPendientes.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-500">
              No hay reservas pendientes en este momento. Todas las solicitudes están al día.
            </div>
          ) : (
            <div className="space-y-3">
              {reservasPendientes.slice(0, 4).map((res) => (
                <div
                  key={res.id}
                  className="p-3.5 rounded-lg border border-stone-200 hover:border-stone-300 transition-colors bg-stone-50/50 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-stone-900 truncate">
                        {res.huespedNombre}
                      </span>
                      <span className="text-[11px] font-mono text-stone-500 tabular-nums">
                        Hab. {res.habitacionNumero}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5 font-mono tabular-nums">
                      {res.fechaEntrada} · {res.numNoches} noche(s) · Ref. ${res.precioTotal}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onConfirmarReserva(res.id)}
                      className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                      title="Confirmar Reserva"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onCancelarReserva(res.id)}
                      className="p-1.5 text-rose-700 hover:bg-rose-50 rounded transition-colors"
                      title="Cancelar Reserva"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reservaciones Confirmadas Recientes */}
        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-stone-900">Reservas Confirmadas</h3>
            </div>
            <button
              onClick={onIrAReservas}
              className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {reservasConfirmadas.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-500">
              No hay reservaciones confirmadas registradas aún.
            </div>
          ) : (
            <div className="space-y-3">
              {reservasConfirmadas.slice(0, 4).map((res) => (
                <div
                  key={res.id}
                  className="p-3.5 rounded-lg border border-stone-200 hover:border-stone-300 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-stone-900 truncate">
                        {res.huespedNombre}
                      </span>
                      <span className="text-[11px] font-mono text-stone-500 tabular-nums">
                        Cod: {res.codigoReserva}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      <span>Habitación {res.habitacionNumero} ({res.habitacionTipo})</span>
                      <span className="mx-1.5">·</span>
                      <span className="font-mono tabular-nums">{res.fechaEntrada} al {res.fechaSalida}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-stone-900 font-mono tabular-nums">
                      ${res.precioTotal}
                    </div>
                    {res.descuentoAplicado > 0 && (
                      <div className="text-[10px] text-emerald-600 font-medium font-mono tabular-nums">
                        Desc. -${res.descuentoAplicado}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
