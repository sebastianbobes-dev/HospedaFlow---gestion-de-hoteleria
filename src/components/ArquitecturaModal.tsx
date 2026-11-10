/**
 * HospedaFlow - Visor de Arquitectura Técnica y Código Fuente
 * Valida la estricta adherencia al Documento Técnico del Sprint 1:
 * - Carpeta backend/ (Java Spring Boot, entidades, servicios, DAOs JSON, controllers REST, pom.xml)
 * - Carpeta frontend/ (HTML5 views, CSS3, JavaScript Vanilla + Fetch API)
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import {
  Layers,
  Database,
  CheckCircle2,
  RefreshCw,
  FolderTree,
  FileCode,
  ExternalLink,
  Code2,
  Coffee,
} from 'lucide-react';

interface ArquitecturaModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onDataReset: () => void;
}

const ARCHIVOS_JAVA = [
  { nombre: 'HospedaFlowApplication.java', ruta: 'backend/src/main/java/com/hospedaflow/HospedaFlowApplication.java', tag: 'Main' },
  { nombre: 'HabitacionRestController.java', ruta: 'backend/src/main/java/com/hospedaflow/controller/HabitacionRestController.java', tag: 'Controller' },
  { nombre: 'ReservaRestController.java', ruta: 'backend/src/main/java/com/hospedaflow/controller/ReservaRestController.java', tag: 'Controller' },
  { nombre: 'OfertaRestController.java', ruta: 'backend/src/main/java/com/hospedaflow/controller/OfertaRestController.java', tag: 'Controller' },
  { nombre: 'PerfilRestController.java', ruta: 'backend/src/main/java/com/hospedaflow/controller/PerfilRestController.java', tag: 'Controller' },
  { nombre: 'HabitacionService.java', ruta: 'backend/src/main/java/com/hospedaflow/service/HabitacionService.java', tag: 'Service' },
  { nombre: 'ReservaService.java', ruta: 'backend/src/main/java/com/hospedaflow/service/ReservaService.java', tag: 'Service' },
  { nombre: 'OfertaService.java', ruta: 'backend/src/main/java/com/hospedaflow/service/OfertaService.java', tag: 'Service' },
  { nombre: 'PerfilService.java', ruta: 'backend/src/main/java/com/hospedaflow/service/PerfilService.java', tag: 'Service' },
  { nombre: 'HabitacionJsonRepository.java', ruta: 'backend/src/main/java/com/hospedaflow/repository/HabitacionJsonRepository.java', tag: 'Repository' },
  { nombre: 'ReservaJsonRepository.java', ruta: 'backend/src/main/java/com/hospedaflow/repository/ReservaJsonRepository.java', tag: 'Repository' },
  { nombre: 'OfertaJsonRepository.java', ruta: 'backend/src/main/java/com/hospedaflow/repository/OfertaJsonRepository.java', tag: 'Repository' },
  { nombre: 'UsuarioJsonRepository.java', ruta: 'backend/src/main/java/com/hospedaflow/repository/UsuarioJsonRepository.java', tag: 'Repository' },
  { nombre: 'JsonDatabase.java', ruta: 'backend/src/main/java/com/hospedaflow/util/JsonDatabase.java', tag: 'Util' },
  { nombre: 'Usuario.java', ruta: 'backend/src/main/java/com/hospedaflow/model/entity/Usuario.java', tag: 'Entity' },
  { nombre: 'Habitacion.java', ruta: 'backend/src/main/java/com/hospedaflow/model/entity/Habitacion.java', tag: 'Entity' },
  { nombre: 'Reserva.java', ruta: 'backend/src/main/java/com/hospedaflow/model/entity/Reserva.java', tag: 'Entity' },
  { nombre: 'Oferta.java', ruta: 'backend/src/main/java/com/hospedaflow/model/entity/Oferta.java', tag: 'Entity' },
  { nombre: 'pom.xml', ruta: 'backend/pom.xml', tag: 'Maven' },
  { nombre: 'application.properties', ruta: 'backend/src/main/resources/application.properties', tag: 'Config' },
];

const ARCHIVOS_FRONTEND = [
  { nombre: 'index.html', ruta: 'frontend/views/index.html', tag: 'HTML5' },
  { nombre: 'habitaciones.html', ruta: 'frontend/views/habitaciones.html', tag: 'HTML5' },
  { nombre: 'reservas.html', ruta: 'frontend/views/reservas.html', tag: 'HTML5' },
  { nombre: 'ofertas.html', ruta: 'frontend/views/ofertas.html', tag: 'HTML5' },
  { nombre: 'estilos.css', ruta: 'frontend/css/estilos.css', tag: 'CSS3' },
  { nombre: 'habitaciones.js', ruta: 'frontend/js/habitaciones.js', tag: 'Vanilla JS' },
  { nombre: 'reservas.js', ruta: 'frontend/js/reservas.js', tag: 'Vanilla JS' },
  { nombre: 'ofertas.js', ruta: 'frontend/js/ofertas.js', tag: 'Vanilla JS' },
  { nombre: 'perfiles.js', ruta: 'frontend/js/perfiles.js', tag: 'Vanilla JS' },
];

export const ArquitecturaModal: React.FC<ArquitecturaModalProps> = ({
  abierto,
  onCerrar,
  onDataReset,
}) => {
  const [seccionActiva, setSeccionActiva] = useState<'estructura' | 'backend' | 'frontend' | 'json'>('backend');
  const [archivoJava, setArchivoJava] = useState(ARCHIVOS_JAVA[0].ruta);
  const [archivoFront, setArchivoFront] = useState(ARCHIVOS_FRONTEND[0].ruta);
  const [archivoJson, setArchivoJson] = useState('habitaciones.json');

  const [codigoFuente, setCodigoFuente] = useState<string>('Cargando código...');
  const [cargando, setCargando] = useState(false);
  const [reiniciando, setReiniciando] = useState(false);

  useEffect(() => {
    if (!abierto) return;

    if (seccionActiva === 'backend') {
      cargarCodigo(archivoJava);
    } else if (seccionActiva === 'frontend') {
      cargarCodigo(archivoFront);
    } else if (seccionActiva === 'json') {
      cargarJson(archivoJson);
    }
  }, [abierto, seccionActiva, archivoJava, archivoFront, archivoJson]);

  const cargarCodigo = async (ruta: string) => {
    setCargando(true);
    try {
      const res = await fetch(`/api/codigo-fuente?path=${encodeURIComponent(ruta)}`);
      const data = await res.json();
      setCodigoFuente(data.content || '// Sin contenido disponible');
    } catch {
      setCodigoFuente('// Error cargando código fuente');
    } finally {
      setCargando(false);
    }
  };

  const cargarJson = async (nombre: string) => {
    setCargando(true);
    try {
      const data = await api.getArchivoJson(nombre);
      setCodigoFuente(data.contenido);
    } catch {
      setCodigoFuente('// Error leyendo archivo JSON');
    } finally {
      setCargando(false);
    }
  };

  const handleResetData = async () => {
    if (!confirm('¿Restablecer los datos iniciales de las carpetas de persistencia JSON?')) return;
    setReiniciando(true);
    try {
      await api.resetData();
      if (seccionActiva === 'json') {
        cargarJson(archivoJson);
      }
      onDataReset();
      alert('Datos JSON restablecidos exitosamente.');
    } catch (err: any) {
      alert(err.message || 'Error');
    } finally {
      setReiniciando(false);
    }
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-stone-200 my-6 space-y-5">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Arquitectura de Código: backend/ (Java) y frontend/ (HTML/CSS/JS)
              </h2>
              <p className="text-xs text-stone-500">
                Estructura de dos carpetas principales conforme al documento técnico de HospedaFlow (Sprint 1)
              </p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="text-stone-400 hover:text-stone-600 font-semibold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Pestañas Principales */}
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-2 text-xs">
          <button
            onClick={() => setSeccionActiva('backend')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              seccionActiva === 'backend'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
            <span>backend/ (Java Spring Boot)</span>
          </button>

          <button
            onClick={() => setSeccionActiva('frontend')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              seccionActiva === 'frontend'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span>frontend/ (HTML5 + CSS3 + Vanilla JS)</span>
          </button>

          <button
            onClick={() => setSeccionActiva('json')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              seccionActiva === 'json'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Persistencia JSON (/data)</span>
          </button>

          <button
            onClick={() => setSeccionActiva('estructura')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              seccionActiva === 'estructura'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5 text-stone-400" />
            <span>Árbol de Directorios</span>
          </button>
        </div>

        {/* Sección: Estructura de Directorios */}
        {seccionActiva === 'estructura' && (
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3 text-xs">
            <h3 className="font-bold text-stone-900 text-sm">Organización del Proyecto en Dos Grandes Carpetas:</h3>
            <pre className="font-mono text-[11px] leading-relaxed text-stone-800 bg-white p-4 rounded-lg border border-stone-200 overflow-x-auto">
{`hospedaflow/
│
├── backend/                            <-- PROYECTO JAVA / SPRING BOOT
│   ├── pom.xml                         <-- Dependencias Maven (Spring Boot, Jackson)
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/
│           │       └── hospedaflow/
│           │           ├── HospedaFlowApplication.java
│           │           ├── controller/           <-- Habitacion, Reserva, Oferta, Perfil RestControllers
│           │           ├── dto/                  <-- Habitacion, Reserva, Oferta, Usuario RequestDTOs
│           │           ├── service/              <-- Lógica de negocio (Fechas, Descuentos, Estados)
│           │           ├── repository/           <-- DAOs con JsonDatabase
│           │           ├── model/entity/         <-- Usuario (abstracta), Gerente, Recepcionista, Huesped, Habitacion, Reserva, Oferta
│           │           ├── model/enums/          <-- RolUsuario, EstadoHabitacion, EstadoReserva
│           │           └── util/                 <-- JsonDatabase.java (guardarLista, leerLista)
│           └── resources/
│               ├── application.properties
│               └── data/                         <-- habitaciones.json, reservas.json, ofertas.json, usuarios.json
│
└── frontend/                           <-- CLIENTE WEB (HTML5 + CSS3 + Vanilla JS)
    ├── css/
    │   └── estilos.css                 <-- Variables CSS, diseño responsive y componentes
    ├── js/
    │   ├── habitaciones.js             <-- Consumo /api/habitaciones con fetch async/await
    │   ├── reservas.js                 <-- Consumo /api/reservas con fetch async/await
    │   ├── ofertas.js                  <-- Consumo /api/ofertas con fetch async/await
    │   └── perfiles.js                 <-- Consumo /api/usuarios con fetch async/await
    └── views/
        ├── index.html                  <-- Inicio y Métricas del Sistema
        ├── habitaciones.html           <-- Catálogo y Comprobador de Disponibilidad
        ├── reservas.html               <-- Registro y Control de Estancias
        └── ofertas.html                <-- Promociones Comerciales y Cupones`}
            </pre>
          </div>
        )}

        {/* Sección: Backend Java */}
        {seccionActiva === 'backend' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-stone-700 mr-1">Clase Java:</span>
              {ARCHIVOS_JAVA.map((item) => (
                <button
                  key={item.ruta}
                  onClick={() => setArchivoJava(item.ruta)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                    archivoJava === item.ruta
                      ? 'bg-stone-900 text-white font-bold'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {item.nombre}
                </button>
              ))}
            </div>

            <div className="rounded-xl overflow-hidden border border-stone-800 bg-stone-950 text-stone-100 p-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800 text-[11px] text-stone-400 font-mono">
                <span>Ruta: {archivoJava}</span>
                <span className="text-amber-400">Java / Spring Boot</span>
              </div>
              <pre className="font-mono text-xs overflow-x-auto max-h-80 text-stone-300 leading-relaxed scrollbar-thin">
                {codigoFuente}
              </pre>
            </div>
          </div>
        )}

        {/* Sección: Frontend HTML/JS/CSS */}
        {seccionActiva === 'frontend' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-semibold text-stone-700 mr-1">Archivo Web:</span>
                {ARCHIVOS_FRONTEND.map((item) => (
                  <button
                    key={item.ruta}
                    onClick={() => setArchivoFront(item.ruta)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                      archivoFront === item.ruta
                        ? 'bg-stone-900 text-white font-bold'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {item.nombre}
                  </button>
                ))}
              </div>

              <a
                href="/frontend/views/index.html"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                <span>Abrir Vistas HTML en Nueva Pestaña</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="rounded-xl overflow-hidden border border-stone-800 bg-stone-950 text-stone-100 p-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800 text-[11px] text-stone-400 font-mono">
                <span>Ruta: {archivoFront}</span>
                <span className="text-blue-400">HTML5 / CSS3 / Vanilla JS</span>
              </div>
              <pre className="font-mono text-xs overflow-x-auto max-h-80 text-stone-300 leading-relaxed scrollbar-thin">
                {codigoFuente}
              </pre>
            </div>
          </div>
        )}

        {/* Sección: Persistencia JSON */}
        {seccionActiva === 'json' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-700">Archivo de Datos:</span>
                {['habitaciones.json', 'reservas.json', 'ofertas.json', 'usuarios.json'].map((nom) => (
                  <button
                    key={nom}
                    onClick={() => setArchivoJson(nom)}
                    className={`px-2.5 py-1 rounded font-mono font-medium transition-colors ${
                      archivoJson === nom
                        ? 'bg-stone-900 text-white font-bold'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {nom}
                  </button>
                ))}
              </div>

              <button
                onClick={() => cargarJson(archivoJson)}
                disabled={cargando}
                className="text-stone-600 hover:text-stone-900 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${cargando ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-stone-800 bg-stone-950 text-stone-100 p-4">
              <pre className="font-mono text-xs overflow-x-auto max-h-80 text-stone-300 leading-relaxed scrollbar-thin">
                {codigoFuente}
              </pre>
            </div>
          </div>
        )}

        {/* Pie del modal */}
        <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={handleResetData}
            disabled={reiniciando}
            className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors font-medium self-start sm:self-auto"
          >
            {reiniciando ? 'Restableciendo...' : 'Restablecer Archivos JSON de Muestra'}
          </button>

          <button
            onClick={onCerrar}
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800"
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  );
};
