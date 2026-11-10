/**
 * HospedaFlow - Módulo de Gestión de Reservas
 * Capa de Vistas (Sección 5.1 y US-2.2 / US-4.1)
 */

import React, { useState } from 'react';
import {
  EstadoReserva,
  Habitacion,
  Oferta,
  Reserva,
  ReservaRequestDTO,
  RolUsuario,
  Usuario,
} from '../types/hotel.ts';
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  Plus,
  ArrowRight,
  FileText,
  User,
  Bed,
  Tag,
  AlertCircle,
  Eye,
  RefreshCw,
  Printer,
} from 'lucide-react';

interface ReservasViewProps {
  reservas: Reserva[];
  habitaciones: Habitacion[];
  ofertas: Oferta[];
  usuarios: Usuario[];
  rolActual: RolUsuario;
  onCrearReserva: (dto: ReservaRequestDTO) => Promise<void>;
  onModificarFechas: (id: string, fechaEntrada: string, fechaSalida: string) => Promise<void>;
  onConfirmarReserva: (id: string) => Promise<void>;
  onCancelarReserva: (id: string, motivo?: string) => Promise<void>;
  onAsignarHabitacion: (id: string, habitacionId: string) => Promise<void>;
  onEliminarReserva: (id: string) => Promise<void>;
  modalNuevaReservaAbierto: boolean;
  setModalNuevaReservaAbierto: (abierto: boolean) => void;
  habitacionPreseleccionada?: Habitacion | null;
  setHabitacionPreseleccionada?: (hab: Habitacion | null) => void;
}

export const ReservasView: React.FC<ReservasViewProps> = ({
  reservas,
  habitaciones,
  ofertas,
  usuarios,
  rolActual,
  onCrearReserva,
  onModificarFechas,
  onConfirmarReserva,
  onCancelarReserva,
  onAsignarHabitacion,
  onEliminarReserva,
  modalNuevaReservaAbierto,
  setModalNuevaReservaAbierto,
  habitacionPreseleccionada,
  setHabitacionPreseleccionada,
}) => {
  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<string>('Todas');
  const [busqueda, setBusqueda] = useState<string>('');

  // Modales secundarios
  const [reservaParaComprobante, setReservaParaComprobante] = useState<Reserva | null>(null);
  const [reservaParaFechas, setReservaParaFechas] = useState<Reserva | null>(null);
  const [nuevaEntrada, setNuevaEntrada] = useState<string>('');
  const [nuevaSalida, setNuevaSalida] = useState<string>('');

  const [reservaParaAsignar, setReservaParaAsignar] = useState<Reserva | null>(null);
  const [nuevaHabId, setNuevaHabId] = useState<string>('');

  // Formulario de Nueva Reserva
  const [huespedNombre, setHuespedNombre] = useState('');
  const [huespedEmail, setHuespedEmail] = useState('');
  const [huespedTelefono, setHuespedTelefono] = useState('');
  const [habitacionId, setHabitacionId] = useState(habitacionPreseleccionada?.id || '');
  const [fechaEntrada, setFechaEntrada] = useState(() => new Date().toISOString().split('T')[0]);
  const [fechaSalida, setFechaSalida] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [numHuespedes, setNumHuespedes] = useState(2);
  const [ofertaCodigo, setOfertaCodigo] = useState('');
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Al abrir para una habitación preseleccionada
  React.useEffect(() => {
    if (habitacionPreseleccionada) {
      setHabitacionId(habitacionPreseleccionada.id);
      setNumHuespedes(Math.min(2, habitacionPreseleccionada.capacidad));
    }
  }, [habitacionPreseleccionada]);

  // Cálculo en vivo del precio estimado
  const habitacionSeleccionada = habitaciones.find((h) => h.id === habitacionId);
  const calcularNoches = () => {
    if (!fechaEntrada || !fechaSalida) return 1;
    const ini = new Date(fechaEntrada);
    const fin = new Date(fechaSalida);
    const msPorDia = 1000 * 60 * 60 * 24;
    return Math.max(1, Math.round((fin.getTime() - ini.getTime()) / msPorDia));
  };

  const nochesEstimadas = calcularNoches();
  const subtotalEstimado = habitacionSeleccionada ? habitacionSeleccionada.precioBase * nochesEstimadas : 0;

  // Oferta seleccionada o ingresada
  const ofertaAplicable = ofertas.find(
    (o) => o.codigo.toUpperCase().trim() === ofertaCodigo.toUpperCase().trim() && o.activa
  );
  const descuentoEstimado = ofertaAplicable
    ? Math.round(((subtotalEstimado * ofertaAplicable.porcentajeDescuento) / 100) * 100) / 100
    : 0;
  const totalEstimado = Math.max(0, subtotalEstimado - descuentoEstimado);

  const handleCrearReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);
    setGuardando(true);

    try {
      if (!huespedNombre.trim() || !habitacionId || !fechaEntrada || !fechaSalida) {
        throw new Error('Por favor complete todos los datos requeridos');
      }

      const dto: ReservaRequestDTO = {
        huespedNombre: huespedNombre.trim(),
        huespedEmail: huespedEmail.trim(),
        huespedTelefono: huespedTelefono.trim(),
        habitacionId,
        fechaEntrada,
        fechaSalida,
        numHuespedes: Number(numHuespedes),
        ofertaCodigo: ofertaCodigo.trim() || undefined,
        notas: notas.trim() || undefined,
      };

      await onCrearReserva(dto);
      setModalNuevaReservaAbierto(false);
      // Reset form
      setHuespedNombre('');
      setHuespedEmail('');
      setHuespedTelefono('');
      setOfertaCodigo('');
      setNotas('');
      if (setHabitacionPreseleccionada) setHabitacionPreseleccionada(null);
    } catch (err: any) {
      setErrorForm(err.message || 'Error al procesar reserva');
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarNuevasFechas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservaParaFechas || !nuevaEntrada || !nuevaSalida) return;
    try {
      await onModificarFechas(reservaParaFechas.id, nuevaEntrada, nuevaSalida);
      setReservaParaFechas(null);
    } catch (err: any) {
      alert(err.message || 'Error modificando fechas');
    }
  };

  const handleGuardarNuevaHabitacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservaParaAsignar || !nuevaHabId) return;
    try {
      await onAsignarHabitacion(reservaParaAsignar.id, nuevaHabId);
      setReservaParaAsignar(null);
    } catch (err: any) {
      alert(err.message || 'Error reasignando habitación');
    }
  };

  // Filtrado de reservas
  const reservasFiltradas = reservas.filter((r) => {
    if (filtroEstado !== 'Todas' && r.estado !== filtroEstado) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      return (
        r.codigoReserva.toLowerCase().includes(q) ||
        r.huespedNombre.toLowerCase().includes(q) ||
        r.habitacionNumero.toLowerCase().includes(q) ||
        (r.huespedEmail && r.huespedEmail.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            Control de Reservaciones
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Registro, modificación de fechas, confirmación, asignación y cálculo de tarifas informativas
          </p>
        </div>

        <button
          onClick={() => setModalNuevaReservaAbierto(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Reservación</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 shrink-0 ml-1" />
          <input
            type="text"
            placeholder="Buscar por código, huésped o habitación..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-transparent text-xs text-stone-900 placeholder-stone-400 focus:outline-none"
          />
        </div>

        {/* Segmented Filter Estados */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
          {['Todas', 'Confirmada', 'Pendiente', 'Cancelada'].map((st) => (
            <button
              key={st}
              onClick={() => setFiltroEstado(st)}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filtroEstado === st
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Lista / Tabla de Reservaciones */}
      {reservasFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-stone-900">No hay reservas que coincidan</h3>
          <p className="text-xs text-stone-500 mt-1">
            Puedes cambiar los filtros o crear una nueva reserva para tu posada.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Huésped</th>
                  <th className="px-4 py-3">Habitación</th>
                  <th className="px-4 py-3">Estadía</th>
                  <th className="px-4 py-3 text-right">Tarifa (Ref. $)</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {reservasFiltradas.map((res) => (
                  <tr key={res.id} className="hover:bg-stone-50/60 transition-colors">
                    {/* Código */}
                    <td className="px-4 py-3.5 font-mono font-medium text-stone-900 whitespace-nowrap">
                      {res.codigoReserva}
                    </td>

                    {/* Huésped */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-stone-900">{res.huespedNombre}</div>
                      <div className="text-[11px] text-stone-500 font-mono tabular-nums">
                        {res.huespedTelefono}
                      </div>
                    </td>

                    {/* Habitación */}
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-stone-900">
                        Habitación {res.habitacionNumero}
                      </div>
                      <div className="text-[11px] text-stone-500">{res.habitacionTipo}</div>
                    </td>

                    {/* Fechas */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono tabular-nums text-stone-900 font-medium">
                        {res.fechaEntrada} → {res.fechaSalida}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono tabular-nums">
                        {res.numNoches} noche(s) · {res.numHuespedes} huésped(es)
                      </div>
                    </td>

                    {/* Tarifa */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="font-mono font-bold text-stone-900 tabular-nums">
                        ${res.precioTotal}
                      </div>
                      {res.descuentoAplicado > 0 ? (
                        <div className="text-[10px] text-emerald-600 font-mono tabular-nums">
                          -{res.descuentoAplicado} ({res.ofertaCodigo})
                        </div>
                      ) : (
                        <div className="text-[10px] text-stone-400 font-mono tabular-nums">
                          ${res.precioNoche}/noche
                        </div>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          res.estado === 'Confirmada'
                            ? 'bg-emerald-50 text-emerald-800'
                            : res.estado === 'Pendiente'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-rose-50 text-rose-800'
                        }`}
                      >
                        {res.estado}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setReservaParaComprobante(res)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                          title="Ver Comprobante / Voucher"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {res.estado !== 'Cancelada' && (
                          <>
                            {res.estado === 'Pendiente' && (
                              <button
                                onClick={() => onConfirmarReserva(res.id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition-colors"
                                title="Confirmar Reserva"
                              >
                                Confirmar
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setReservaParaFechas(res);
                                setNuevaEntrada(res.fechaEntrada);
                                setNuevaSalida(res.fechaSalida);
                              }}
                              className="px-2 py-1 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded text-[11px] font-medium transition-colors"
                              title="Modificar Fechas"
                            >
                              Fechas
                            </button>

                            <button
                              onClick={() => {
                                setReservaParaAsignar(res);
                                setNuevaHabId(res.habitacionId);
                              }}
                              className="px-2 py-1 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded text-[11px] font-medium transition-colors"
                              title="Reasignar Habitación"
                            >
                              Hab.
                            </button>

                            <button
                              onClick={() => {
                                const motivo = prompt('Motivo de la cancelación (opcional):');
                                if (motivo !== null) {
                                  onCancelarReserva(res.id, motivo);
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Cancelar Reserva"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Registrar Nueva Reserva (ReservaRequestDTO) */}
      {modalNuevaReservaAbierto && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-stone-200 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h2 className="text-base font-bold text-stone-900">Registrar Nueva Reservación</h2>
                <p className="text-xs text-stone-500">
                  Sprint 1: Valida disponibilidad real, calcula tarifas y aplica ofertas
                </p>
              </div>
              <button
                onClick={() => setModalNuevaReservaAbierto(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {errorForm && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
                {errorForm}
              </div>
            )}

            <form onSubmit={handleCrearReserva} className="space-y-4 text-xs">
              {/* Datos del Huésped */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                  <User className="w-4 h-4 text-stone-500" />
                  <span>Datos del Huésped Titular</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-1">
                    <label className="block font-medium text-stone-700 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Gabriel Fuentes"
                      value={huespedNombre}
                      onChange={(e) => setHuespedNombre(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      value={huespedEmail}
                      onChange={(e) => setHuespedEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Teléfono Móvil *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+58 414-0000000"
                      value={huespedTelefono}
                      onChange={(e) => setHuespedTelefono(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Fechas de Estancia y Habitación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Fecha de Entrada (Check-in) *</label>
                  <input
                    type="date"
                    required
                    value={fechaEntrada}
                    onChange={(e) => setFechaEntrada(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Fecha de Salida (Check-out) *</label>
                  <input
                    type="date"
                    required
                    value={fechaSalida}
                    onChange={(e) => setFechaSalida(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Seleccionar Habitación *</label>
                  <select
                    required
                    value={habitacionId}
                    onChange={(e) => setHabitacionId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                  >
                    <option value="">Seleccione una habitación...</option>
                    {habitaciones
                      .filter((h) => h.estado !== 'Mantenimiento')
                      .map((h) => (
                        <option key={h.id} value={h.id}>
                          Hab. {h.numero} - {h.tipo} (${h.precioBase}/noche, max {h.capacidad}p)
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Número de Huéspedes</label>
                  <input
                    type="number"
                    min="1"
                    max={habitacionSeleccionada ? habitacionSeleccionada.capacidad : 10}
                    value={numHuespedes}
                    onChange={(e) => setNumHuespedes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Oferta y Código Promocional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Código Promocional / Oferta</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Ej. ESCAPADA15, RELAX20"
                      value={ofertaCodigo}
                      onChange={(e) => setOfertaCodigo(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono uppercase focus:outline-none"
                    />
                  </div>
                  {ofertaAplicable && (
                    <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                      ✓ Descuento del {ofertaAplicable.porcentajeDescuento}% aplicado ({ofertaAplicable.titulo})
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Notas Especiales</label>
                  <input
                    type="text"
                    placeholder="Hora de llegada, camas extras..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Resumen Tarifario Informativo */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5">
                <div className="flex justify-between text-stone-600">
                  <span>Noches de estadía:</span>
                  <span className="font-mono tabular-nums font-medium">{nochesEstimadas} noche(s)</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({nochesEstimadas} x ${habitacionSeleccionada?.precioBase || 0}):</span>
                  <span className="font-mono tabular-nums font-medium">${subtotalEstimado}</span>
                </div>
                {descuentoEstimado > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Descuento aplicado:</span>
                    <span className="font-mono tabular-nums">-${descuentoEstimado}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-900 font-bold text-sm pt-2 border-t border-stone-200">
                  <span>Total Estimado Informativo:</span>
                  <span className="font-mono tabular-nums text-base">Ref. ${totalEstimado}</span>
                </div>
                <p className="text-[10px] text-stone-400 text-right">
                  Monto informativo para cobro directo en recepción (sin pasarela bancaria)
                </p>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalNuevaReservaAbierto(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  {guardando ? 'Registrando...' : 'Confirmar Registro de Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modificar Fechas */}
      {reservaParaFechas && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">
                Modificar Fechas ({reservaParaFechas.codigoReserva})
              </h3>
              <button
                onClick={() => setReservaParaFechas(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarNuevasFechas} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Nueva Fecha de Entrada</label>
                <input
                  type="date"
                  required
                  value={nuevaEntrada}
                  onChange={(e) => setNuevaEntrada(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Nueva Fecha de Salida</label>
                <input
                  type="date"
                  required
                  value={nuevaSalida}
                  onChange={(e) => setNuevaSalida(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setReservaParaFechas(null)}
                  className="px-3 py-1.5 border border-stone-300 rounded-lg text-stone-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-stone-900 text-white rounded-lg font-semibold"
                >
                  Guardar Nuevas Fechas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reasignar Habitación */}
      {reservaParaAsignar && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">
                Asignar Otra Habitación ({reservaParaAsignar.codigoReserva})
              </h3>
              <button
                onClick={() => setReservaParaAsignar(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarNuevaHabitacion} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Seleccionar Nueva Habitación</label>
                <select
                  required
                  value={nuevaHabId}
                  onChange={(e) => setNuevaHabId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                >
                  {habitaciones
                    .filter((h) => h.capacidad >= reservaParaAsignar.numHuespedes && h.estado !== 'Mantenimiento')
                    .map((h) => (
                      <option key={h.id} value={h.id}>
                        Hab. {h.numero} ({h.tipo}) - ${h.precioBase}/noche
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setReservaParaAsignar(null)}
                  className="px-3 py-1.5 border border-stone-300 rounded-lg text-stone-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-stone-900 text-white rounded-lg font-semibold"
                >
                  Asignar Habitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Comprobante / Voucher de Reserva */}
      {reservaParaComprobante && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-stone-700" />
                <h3 className="font-bold text-stone-900 text-sm">Voucher Informativo de Reserva</h3>
              </div>
              <button
                onClick={() => setReservaParaComprobante(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 text-xs">
              <div className="flex justify-between items-start border-b border-stone-200 pb-3">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Posada El Encanto</h4>
                  <p className="text-[11px] text-stone-500">HospedaFlow · Gestión Hotelera</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-stone-900 text-xs">
                    {reservaParaComprobante.codigoReserva}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    Registrada: {reservaParaComprobante.fechaRegistro}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-stone-500 block text-[11px]">Huésped Titular</span>
                  <strong className="text-stone-900">{reservaParaComprobante.huespedNombre}</strong>
                  <div className="text-stone-600 text-[11px] font-mono">{reservaParaComprobante.huespedTelefono}</div>
                </div>

                <div>
                  <span className="text-stone-500 block text-[11px]">Habitación Asignada</span>
                  <strong className="text-stone-900">
                    Hab. {reservaParaComprobante.habitacionNumero}
                  </strong>
                  <div className="text-stone-600 text-[11px]">{reservaParaComprobante.habitacionTipo}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-200">
                <div>
                  <span className="text-stone-500 block text-[11px]">Check-in</span>
                  <strong className="text-stone-900 font-mono">{reservaParaComprobante.fechaEntrada}</strong>
                </div>

                <div>
                  <span className="text-stone-500 block text-[11px]">Check-out</span>
                  <strong className="text-stone-900 font-mono">{reservaParaComprobante.fechaSalida}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-sm font-bold text-stone-900">
                <span>Total a Cobrar en Recepción:</span>
                <span className="font-mono text-base">Ref. ${reservaParaComprobante.precioTotal}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Comprobante</span>
              </button>
              <button
                onClick={() => setReservaParaComprobante(null)}
                className="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
