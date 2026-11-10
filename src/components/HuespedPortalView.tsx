/**
 * HospedaFlow - Portal del Huésped
 * Vista pública y de auto-reserva para huéspedes del hotel / posada
 */

import React, { useState } from 'react';
import { Habitacion, Oferta, Reserva, ReservaRequestDTO } from '../types/hotel.ts';
import {
  Bed,
  Calendar,
  Users,
  Tag,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  ShieldCheck,
  Coffee,
} from 'lucide-react';

interface HuespedPortalViewProps {
  habitaciones: Habitacion[];
  ofertas: Oferta[];
  reservas: Reserva[];
  onAbrirReservaParaHabitacion: (hab: Habitacion) => void;
}

export const HuespedPortalView: React.FC<HuespedPortalViewProps> = ({
  habitaciones,
  ofertas,
  reservas,
  onAbrirReservaParaHabitacion,
}) => {
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [reservaEncontrada, setReservaEncontrada] = useState<Reserva | null>(null);
  const [busquedaEjecutada, setBusquedaEjecutada] = useState(false);

  const ofertasActivas = ofertas.filter((o) => o.activa);
  const habitacionesDisponibles = habitaciones.filter((h) => h.estado !== 'Mantenimiento');

  const handleBuscarReserva = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoBusqueda.trim()) return;

    const encontrada = reservas.find(
      (r) =>
        r.codigoReserva.toLowerCase().trim() === codigoBusqueda.toLowerCase().trim() ||
        r.huespedEmail.toLowerCase().trim() === codigoBusqueda.toLowerCase().trim()
    );

    setReservaEncontrada(encontrada || null);
    setBusquedaEjecutada(true);
  };

  return (
    <div className="space-y-10">
      {/* Portada de Bienvenida al Huésped */}
      <div className="relative overflow-hidden rounded-2xl bg-stone-900 text-white p-8 sm:p-12">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/src/assets/images/hotel_reception_lobby_1794268258111.jpg"
            alt="Recepción HospedaFlow"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300">
            <MapPin className="w-4 h-4" />
            <span>Posada Boutique El Encanto · Venezuela</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Descansa en una experiencia colonial única
          </h1>

          <p className="text-stone-300 text-sm leading-relaxed">
            Reserva directamente tu estadía en nuestras cómodas habitaciones coloniales con atención
            personalizada. Consulta tarifas, promociones vigentes y el estado de tu reservación.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs text-stone-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Tarifa garantizada sin cargos ocultos
            </span>
            <span className="flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-amber-400" />
              Café artesanal de cortesía
            </span>
          </div>
        </div>
      </div>

      {/* Franja de Consulta de Mi Reserva */}
      <div className="bg-stone-100 p-6 rounded-2xl border border-stone-200">
        <div className="max-w-xl mx-auto space-y-3 text-center sm:text-left">
          <h2 className="text-base font-bold text-stone-900 flex items-center justify-center sm:justify-start gap-2">
            <Search className="w-4 h-4 text-stone-700" />
            <span>¿Ya tienes una reservación con nosotros?</span>
          </h2>
          <p className="text-xs text-stone-600">
            Ingresa tu código de reserva (ej. HF-2026-001) o tu correo para verificar el estatus de tu estancia.
          </p>

          <form onSubmit={handleBuscarReserva} className="flex gap-2">
            <input
              type="text"
              placeholder="Código o email del huésped..."
              value={codigoBusqueda}
              onChange={(e) => setCodigoBusqueda(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors"
            >
              Consultar
            </button>
          </form>

          {busquedaEjecutada && (
            <div className="pt-3">
              {reservaEncontrada ? (
                <div className="p-4 bg-white rounded-xl border border-emerald-200 text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-stone-900 text-sm">
                      {reservaEncontrada.codigoReserva}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                        reservaEncontrada.estado === 'Confirmada'
                          ? 'bg-emerald-50 text-emerald-800'
                          : reservaEncontrada.estado === 'Pendiente'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {reservaEncontrada.estado}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-stone-700 pt-1">
                    <div>
                      Huésped: <strong>{reservaEncontrada.huespedNombre}</strong>
                    </div>
                    <div>
                      Habitación: <strong>#{reservaEncontrada.habitacionNumero} ({reservaEncontrada.habitacionTipo})</strong>
                    </div>
                    <div>
                      Estadía: <strong className="font-mono">{reservaEncontrada.fechaEntrada} → {reservaEncontrada.fechaSalida}</strong>
                    </div>
                    <div>
                      Total a pagar: <strong className="font-mono text-emerald-700">Ref. ${reservaEncontrada.precioTotal}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white rounded-lg border border-rose-200 text-rose-700 text-xs text-center">
                  No se encontró ninguna reserva asociada al código o email ingresado.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Promociones Activas para el Huésped */}
      {ofertasActivas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-bold text-stone-900">Promociones y Cupones Vigentes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ofertasActivas.map((oft) => (
              <div
                key={oft.id}
                className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <strong className="text-amber-950 font-bold text-sm">{oft.titulo}</strong>
                  <span className="font-mono font-bold text-amber-800">{oft.porcentajeDescuento}% OFF</span>
                </div>
                <p className="text-stone-700 text-[11px] leading-relaxed">{oft.descripcion}</p>
                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-stone-500 font-mono">Cupón: <strong className="text-stone-900">{oft.codigo}</strong></span>
                  <span className="text-stone-500 font-mono">Hasta: {oft.fechaFin}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Catálogo de Habitaciones Disponibles */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-stone-900">Nuestras Habitaciones</h2>
          <p className="text-xs text-stone-500">Selecciona tu espacio preferido para iniciar tu reserva</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {habitacionesDisponibles.map((hab) => (
            <div
              key={hab.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-stone-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 bg-stone-100 overflow-hidden">
                  <img
                    src="/src/assets/images/hotel_suite_room_1794268257926.jpg"
                    alt={hab.tipo}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/80 text-white px-2.5 py-1 rounded text-xs font-mono font-bold">
                    Hab. {hab.numero}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/95 text-stone-900 px-3 py-1 rounded-lg text-xs font-bold font-mono shadow-sm">
                    ${hab.precioBase} <span className="text-[10px] font-normal text-stone-500">/ noche</span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-stone-900 text-sm">{hab.tipo}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <span>Capacidad: hasta {hab.capacidad} personas</span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {hab.descripcion}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => onAbrirReservaParaHabitacion(hab)}
                  className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Solicitar Reserva
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
