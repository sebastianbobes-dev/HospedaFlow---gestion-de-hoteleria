/**
 * HospedaFlow - Módulo de Gestión de Ofertas y Promociones
 * Capa de Vistas (Sección 5.1 y US-2.3 / US-4.1)
 */

import React, { useState } from 'react';
import { Oferta, OfertaRequestDTO, RolUsuario, TipoHabitacion } from '../types/hotel.ts';
import { Tag, Plus, Check, Copy, Trash2, Edit2, Sparkles, Percent, Calendar } from 'lucide-react';

interface OfertasViewProps {
  ofertas: Oferta[];
  rolActual: RolUsuario;
  onCrearOferta: (dto: OfertaRequestDTO) => Promise<void>;
  onActualizarOferta: (id: string, dto: Partial<OfertaRequestDTO>) => Promise<void>;
  onEliminarOferta: (id: string) => Promise<void>;
}

export const OfertasView: React.FC<OfertasViewProps> = ({
  ofertas,
  rolActual,
  onCrearOferta,
  onActualizarOferta,
  onEliminarOferta,
}) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ofertaAEditar, setOfertaAEditar] = useState<Oferta | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [codigoCopiado, setCodigoCopiado] = useState<string | null>(null);

  // Formulario DTO
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [codigo, setCodigo] = useState('');
  const [porcentajeDescuento, setPorcentajeDescuento] = useState<number>(15);
  const [fechaInicio, setFechaInicio] = useState(() => new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState('2026-12-31');
  const [habitacionTipo, setHabitacionTipo] = useState<TipoHabitacion | 'Todas'>('Todas');
  const [activa, setActiva] = useState(true);

  const abrirModalCrear = () => {
    setOfertaAEditar(null);
    setTitulo('');
    setDescripcion('');
    setCodigo('');
    setPorcentajeDescuento(15);
    setFechaInicio(new Date().toISOString().split('T')[0]);
    setFechaFin('2026-12-31');
    setHabitacionTipo('Todas');
    setActiva(true);
    setErrorForm(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (oft: Oferta) => {
    setOfertaAEditar(oft);
    setTitulo(oft.titulo);
    setDescripcion(oft.descripcion);
    setCodigo(oft.codigo);
    setPorcentajeDescuento(oft.porcentajeDescuento);
    setFechaInicio(oft.fechaInicio);
    setFechaFin(oft.fechaFin);
    setHabitacionTipo(oft.habitacionTipo || 'Todas');
    setActiva(oft.activa);
    setErrorForm(null);
    setModalAbierto(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);
    setGuardando(true);

    try {
      if (!titulo.trim() || !codigo.trim()) {
        throw new Error('El título y código son obligatorios');
      }

      const dto: OfertaRequestDTO = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        codigo: codigo.trim().toUpperCase(),
        porcentajeDescuento: Number(porcentajeDescuento),
        fechaInicio,
        fechaFin,
        habitacionTipo,
        activa,
      };

      if (ofertaAEditar) {
        await onActualizarOferta(ofertaAEditar.id, dto);
      } else {
        await onCrearOferta(dto);
      }

      setModalAbierto(false);
    } catch (err: any) {
      setErrorForm(err.message || 'Error al guardar la oferta');
    } finally {
      setGuardando(false);
    }
  };

  const handleCopiarCodigo = (cod: string) => {
    navigator.clipboard.writeText(cod);
    setCodigoCopiado(cod);
    setTimeout(() => setCodigoCopiado(null), 2000);
  };

  const handleToggleActiva = async (oft: Oferta) => {
    await onActualizarOferta(oft.id, { activa: !oft.activa });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            Catálogo de Ofertas y Promociones
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Administración de cupones de descuento, vigencia y reglas por tipo de habitación (US-2.3)
          </p>
        </div>

        {rolActual === 'Admin' && (
          <button
            onClick={abrirModalCrear}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Oferta</span>
          </button>
        )}
      </div>

      {/* Grid de Ofertas */}
      {ofertas.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Tag className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-stone-900">No hay ofertas registradas</h3>
          <p className="text-xs text-stone-500 mt-1">Crea una nueva promoción para atraer huéspedes a tu posada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ofertas.map((oft) => (
            <div
              key={oft.id}
              className={`bg-white rounded-xl border transition-all p-5 flex flex-col justify-between ${
                oft.activa
                  ? 'border-stone-200 hover:border-stone-300 shadow-xs'
                  : 'border-stone-200 bg-stone-50/70 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">{oft.titulo}</h3>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {oft.habitacionTipo === 'Todas' ? 'Todas las habitaciones' : oft.habitacionTipo}
                      </span>
                    </div>
                  </div>

                  <span className="text-lg font-black font-mono text-amber-700 tabular-nums">
                    {oft.porcentajeDescuento}% OFF
                  </span>
                </div>

                {oft.descripcion && (
                  <p className="text-xs text-stone-600 leading-relaxed">{oft.descripcion}</p>
                )}

                {/* Código de Cupón */}
                <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-[11px] text-stone-500">Código:</span>
                    <span className="font-mono font-bold text-xs text-stone-900 tracking-wider">
                      {oft.codigo}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopiarCodigo(oft.codigo)}
                    className="text-stone-600 hover:text-stone-900 p-1 hover:bg-stone-200/60 rounded text-xs transition-colors"
                    title="Copiar código"
                  >
                    {codigoCopiado === oft.codigo ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-mono">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  <span>Vigencia: {oft.fechaInicio} al {oft.fechaFin}</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActiva(oft)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer ${
                    oft.activa ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {oft.activa ? 'Activa' : 'Inactiva'}
                </button>

                {rolActual === 'Admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => abrirModalEditar(oft)}
                      className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded text-xs"
                      title="Editar oferta"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar la oferta '${oft.titulo}'?`)) {
                          onEliminarOferta(oft.id);
                        }
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded text-xs"
                      title="Eliminar oferta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar Oferta */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-base font-bold text-stone-900">
                {ofertaAEditar ? `Editar Oferta ${ofertaAEditar.codigo}` : 'Crear Nueva Oferta Comercial'}
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
                <label className="block font-medium text-stone-700 mb-1">Título de la Promoción *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Escapada Romántica de Fin de Semana"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Código Promocional *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. PLAYA20"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono uppercase focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Porcentaje de Descuento (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={porcentajeDescuento}
                    onChange={(e) => setPorcentajeDescuento(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Fecha de Inicio *</label>
                  <input
                    type="date"
                    required
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Fecha de Fin *</label>
                  <input
                    type="date"
                    required
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Aplica para Tipo de Habitación</label>
                <select
                  value={habitacionTipo}
                  onChange={(e) => setHabitacionTipo(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                >
                  <option value="Todas">Todas las Habitaciones</option>
                  <option value="Individual">Solo Individual</option>
                  <option value="Doble">Solo Doble</option>
                  <option value="Matrimonial">Solo Matrimonial</option>
                  <option value="Familiar">Solo Familiar</option>
                  <option value="Suite Colonial">Solo Suite Colonial</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Descripción / Condiciones</label>
                <textarea
                  rows={2}
                  placeholder="Detalles de la oferta, número mínimo de noches, etc."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ofertaActiva"
                  checked={activa}
                  onChange={(e) => setActiva(e.target.checked)}
                  className="rounded text-stone-900 focus:ring-stone-900"
                />
                <label htmlFor="ofertaActiva" className="font-medium text-stone-800">
                  Oferta activa de inmediato en el sistema
                </label>
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
                  {guardando ? 'Guardando...' : ofertaAEditar ? 'Guardar Cambios' : 'Crear Oferta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
