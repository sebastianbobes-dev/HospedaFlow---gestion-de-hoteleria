/**
 * HospedaFlow - Módulo de Gestión de Habitaciones
 * Capa de Vistas (Sección 5.1 y US-2.1 / US-4.1)
 */

import React, { useState } from 'react';
import {
  EstadoHabitacion,
  Habitacion,
  HabitacionRequestDTO,
  RolUsuario,
  TipoHabitacion,
} from '../types/hotel.ts';
import {
  Plus,
  Search,
  Filter,
  Users,
  Bed,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface HabitacionesViewProps {
  habitaciones: Habitacion[];
  rolActual: RolUsuario;
  onCrearHabitacion: (dto: HabitacionRequestDTO) => Promise<void>;
  onActualizarHabitacion: (id: string, dto: Partial<HabitacionRequestDTO>) => Promise<void>;
  onCambiarEstado: (id: string, nuevoEstado: EstadoHabitacion) => Promise<void>;
  onEliminarHabitacion: (id: string) => Promise<void>;
  onConsultarDisponibilidad: (
    fechaEntrada: string,
    fechaSalida: string,
    tipo?: TipoHabitacion,
    numHuespedes?: number
  ) => Promise<Habitacion[]>;
  onAbrirReservaParaHabitacion: (habitacion: Habitacion) => void;
}

export const HabitacionesView: React.FC<HabitacionesViewProps> = ({
  habitaciones,
  rolActual,
  onCrearHabitacion,
  onActualizarHabitacion,
  onCambiarEstado,
  onEliminarHabitacion,
  onConsultarDisponibilidad,
  onAbrirReservaParaHabitacion,
}) => {
  // Filtros de vista
  const [filtroEstado, setFiltroEstado] = useState<string>('Todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('Todos');
  const [busqueda, setBusqueda] = useState<string>('');

  // Estados del Verificador de Disponibilidad por Rango de Fechas
  const [mostrarVerificador, setMostrarVerificador] = useState(false);
  const [fechaEntradaCheck, setFechaEntradaCheck] = useState<string>('');
  const [fechaSalidaCheck, setFechaSalidaCheck] = useState<string>('');
  const [tipoCheck, setTipoCheck] = useState<string>('Todos');
  const [capacidadCheck, setCapacidadCheck] = useState<number>(1);
  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState<string[] | null>(null);
  const [verificando, setVerificando] = useState(false);

  // Estados del Modal Crear / Editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [habitacionAEditar, setHabitacionAEditar] = useState<Habitacion | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Formulario DTO
  const [numero, setNumero] = useState('');
  const [tipo, setTipo] = useState<TipoHabitacion>('Matrimonial');
  const [precioBase, setPrecioBase] = useState<number>(65);
  const [capacidad, setCapacidad] = useState<number>(2);
  const [estado, setEstado] = useState<EstadoHabitacion>('Disponible');
  const [piso, setPiso] = useState<number>(1);
  const [descripcion, setDescripcion] = useState('');

  const abrirModalCrear = () => {
    setHabitacionAEditar(null);
    setNumero('');
    setTipo('Matrimonial');
    setPrecioBase(65);
    setCapacidad(2);
    setEstado('Disponible');
    setPiso(1);
    setDescripcion('');
    setErrorForm(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (hab: Habitacion) => {
    setHabitacionAEditar(hab);
    setNumero(hab.numero);
    setTipo(hab.tipo);
    setPrecioBase(hab.precioBase);
    setCapacidad(hab.capacidad);
    setEstado(hab.estado);
    setPiso(hab.piso || 1);
    setDescripcion(hab.descripcion || '');
    setErrorForm(null);
    setModalAbierto(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);
    setGuardando(true);

    try {
      if (!numero.trim()) {
        throw new Error('El número de habitación es requerido');
      }

      const dto: HabitacionRequestDTO = {
        numero: numero.trim(),
        tipo,
        precioBase: Number(precioBase),
        capacidad: Number(capacidad),
        estado,
        piso: Number(piso),
        descripcion: descripcion.trim(),
        caracteristicas: ['Aire Acondicionado', 'Wifi', 'Baño Privado'],
      };

      if (habitacionAEditar) {
        await onActualizarHabitacion(habitacionAEditar.id, dto);
      } else {
        await onCrearHabitacion(dto);
      }

      setModalAbierto(false);
    } catch (err: any) {
      setErrorForm(err.message || 'Error al guardar habitación');
    } finally {
      setGuardando(false);
    }
  };

  const handleVerificarDisponibilidad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaEntradaCheck || !fechaSalidaCheck) return;

    setVerificando(true);
    try {
      const res = await onConsultarDisponibilidad(
        fechaEntradaCheck,
        fechaSalidaCheck,
        tipoCheck !== 'Todos' ? (tipoCheck as TipoHabitacion) : undefined,
        capacidadCheck > 0 ? capacidadCheck : undefined
      );
      setHabitacionesDisponibles(res.map((h) => h.id));
    } catch (err: any) {
      alert(err.message || 'Error consultando disponibilidad');
    } finally {
      setVerificando(false);
    }
  };

  const limpiarVerificacion = () => {
    setHabitacionesDisponibles(null);
    setFechaEntradaCheck('');
    setFechaSalidaCheck('');
  };

  // Filtrado reactivo de habitaciones
  const habitacionesFiltradas = habitaciones.filter((h) => {
    if (filtroEstado !== 'Todos' && h.estado !== filtroEstado) return false;
    if (filtroTipo !== 'Todos' && h.tipo !== filtroTipo) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      return (
        h.numero.toLowerCase().includes(q) ||
        h.tipo.toLowerCase().includes(q) ||
        (h.descripcion && h.descripcion.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Barra Superior con Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            Inventario de Habitaciones
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Gestión de unidades habitacionales, capacidad, tarifas y validación de disponibilidad
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMostrarVerificador(!mostrarVerificador)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              mostrarVerificador
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Consultar por Fechas</span>
          </button>

          {rolActual === 'Admin' && (
            <button
              onClick={abrirModalCrear}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Habitación</span>
            </button>
          )}
        </div>
      </div>

      {/* Panel Desplegable: Verificador de Disponibilidad */}
      {mostrarVerificador && (
        <form
          onSubmit={handleVerificarDisponibilidad}
          className="bg-amber-50/60 p-4 sm:p-5 rounded-xl border border-amber-200 text-stone-900 transition-all space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Verificador de Disponibilidad en Rango de Fechas (US-2.1)
              </span>
            </div>
            {habitacionesDisponibles !== null && (
              <button
                type="button"
                onClick={limpiarVerificacion}
                className="text-xs text-amber-800 hover:text-amber-950 underline"
              >
                Limpiar filtro de disponibilidad
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Fecha de Entrada</label>
              <input
                type="date"
                required
                value={fechaEntradaCheck}
                onChange={(e) => setFechaEntradaCheck(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Fecha de Salida</label>
              <input
                type="date"
                required
                value={fechaSalidaCheck}
                onChange={(e) => setFechaSalidaCheck(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Tipo de Habitación</label>
              <select
                value={tipoCheck}
                onChange={(e) => setTipoCheck(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
              >
                <option value="Todos">Cualquier tipo</option>
                <option value="Individual">Individual</option>
                <option value="Doble">Doble</option>
                <option value="Matrimonial">Matrimonial</option>
                <option value="Familiar">Familiar</option>
                <option value="Suite Colonial">Suite Colonial</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Mínimo de Huéspedes</label>
              <input
                type="number"
                min="1"
                max="8"
                value={capacidadCheck}
                onChange={(e) => setCapacidadCheck(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="submit"
              disabled={verificando}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1.5"
            >
              {verificando ? 'Consultando...' : 'Comprobar Disponibilidad Real'}
            </button>
          </div>

          {habitacionesDisponibles !== null && (
            <div className="p-3 bg-white rounded-lg border border-amber-300 text-xs flex items-center justify-between">
              <span className="text-stone-800 font-medium">
                Se encontraron{' '}
                <strong className="text-emerald-700 font-mono font-bold">
                  {habitacionesDisponibles.length}
                </strong>{' '}
                habitaciones 100% libres de conflicto para las fechas seleccionadas.
              </span>
              <span className="text-stone-500 text-[11px]">
                (Las tarjetas disponibles se marcan con un halo esmeralda)
              </span>
            </div>
          )}
        </form>
      )}

      {/* Filtros y Barra de Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 shrink-0 ml-1" />
          <input
            type="text"
            placeholder="Buscar por número, tipo o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-transparent text-xs text-stone-900 placeholder-stone-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Segmented Filter Estados */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
            {['Todos', 'Disponible', 'Ocupada', 'Mantenimiento'].map((st) => (
              <button
                key={st}
                onClick={() => setFiltroEstado(st)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filtroEstado === st
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Filtro Tipo */}
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-2.5 py-1 bg-stone-100 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 focus:outline-none"
          >
            <option value="Todos">Todos los tipos</option>
            <option value="Individual">Individual</option>
            <option value="Doble">Doble</option>
            <option value="Matrimonial">Matrimonial</option>
            <option value="Familiar">Familiar</option>
            <option value="Suite Colonial">Suite Colonial</option>
          </select>
        </div>
      </div>

      {/* Grid de Habitaciones */}
      {habitacionesFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Bed className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-stone-900">No se encontraron habitaciones</h3>
          <p className="text-xs text-stone-500 mt-1">
            Prueba ajustando los filtros de búsqueda o registra una nueva habitación.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {habitacionesFiltradas.map((hab) => {
            const estaEnVerificacion =
              habitacionesDisponibles !== null && habitacionesDisponibles.includes(hab.id);
            const noDisponibleEnVerificacion =
              habitacionesDisponibles !== null && !habitacionesDisponibles.includes(hab.id);

            return (
              <div
                key={hab.id}
                className={`bg-white rounded-xl border transition-all overflow-hidden flex flex-col justify-between ${
                  estaEnVerificacion
                    ? 'border-emerald-500 ring-2 ring-emerald-200'
                    : noDisponibleEnVerificacion
                    ? 'opacity-40 border-stone-200'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div>
                  {/* Foto de Habitación */}
                  <div className="relative h-44 overflow-hidden bg-stone-100">
                    <img
                      src="/src/assets/images/hotel_suite_room_1794268257926.jpg"
                      alt={`Habitación ${hab.numero}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded text-xs font-mono font-bold">
                      Hab. {hab.numero}
                    </div>

                    <div className="absolute top-3 right-3">
                      <select
                        value={hab.estado}
                        onChange={(e) => onCambiarEstado(hab.id, e.target.value as EstadoHabitacion)}
                        className={`text-xs font-semibold px-2 py-1 rounded border shadow-sm cursor-pointer ${
                          hab.estado === 'Disponible'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : hab.estado === 'Ocupada'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="Disponible">Disponible</option>
                        <option value="Ocupada">Ocupada</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                      </select>
                    </div>

                    {estaEnVerificacion && (
                      <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[11px] font-medium px-2 py-0.5 rounded shadow">
                        ✓ Disponible en tus fechas
                      </div>
                    )}
                  </div>

                  {/* Detalles de la Habitación */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm text-stone-900">{hab.tipo}</h3>
                        <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                          <span className="flex items-center gap-1 font-mono tabular-nums">
                            <Users className="w-3.5 h-3.5 text-stone-400" />
                            Hasta {hab.capacidad} huéspedes
                          </span>
                          <span>·</span>
                          <span>Piso {hab.piso || 1}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-bold text-stone-900 font-mono tabular-nums">
                          ${hab.precioBase}
                        </div>
                        <div className="text-[10px] text-stone-400">por noche (Ref. $)</div>
                      </div>
                    </div>

                    {hab.descripcion && (
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {hab.descripcion}
                      </p>
                    )}

                    {/* Características */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {hab.caracteristicas?.slice(0, 3).map((car, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded"
                        >
                          {car}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Acciones de la Tarjeta */}
                <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {rolActual === 'Admin' && (
                      <>
                        <button
                          onClick={() => abrirModalEditar(hab)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded transition-colors text-xs"
                          title="Editar información de habitación"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Estás seguro de eliminar la habitación ${hab.numero}?`)) {
                              onEliminarHabitacion(hab.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors text-xs"
                          title="Eliminar habitación"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => onAbrirReservaParaHabitacion(hab)}
                    disabled={hab.estado === 'Mantenimiento'}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                      hab.estado === 'Mantenimiento'
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    Reservar Esta Habitación
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear / Editar Habitación */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-base font-bold text-stone-900">
                {habitacionAEditar ? `Editar Habitación ${habitacionAEditar.numero}` : 'Registrar Nueva Habitación'}
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
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

            <form onSubmit={handleGuardar} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Número de Habitación *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 101, 204"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono font-medium focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Tipo de Habitación *</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoHabitacion)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Doble">Doble</option>
                    <option value="Matrimonial">Matrimonial</option>
                    <option value="Familiar">Familiar</option>
                    <option value="Suite Colonial">Suite Colonial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Precio por Noche (USD Ref.) *</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={precioBase}
                    onChange={(e) => setPrecioBase(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Capacidad Máxima *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={capacidad}
                    onChange={(e) => setCapacidad(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Piso / Nivel</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={piso}
                    onChange={(e) => setPiso(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Estado Operativo Inicial</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as EstadoHabitacion)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Ocupada">Ocupada</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Descripción y Comodidades</label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre lencería, vistas al patio, tipo de cama, etc."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
                />
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
                  {guardando ? 'Guardando...' : habitacionAEditar ? 'Guardar Cambios' : 'Crear Habitación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
