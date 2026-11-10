/**
 * HospedaFlow - Módulo de Inicio de Sesión / Autenticación
 * Control de acceso por roles: Admin, Recepcionista y Huésped
 */

import React, { useState } from 'react';
import { Usuario } from '../types/hotel.ts';
import { api } from '../api/client.ts';
import { Hotel, Lock, Mail, ArrowRight, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLoginExitoso: (usuario: Usuario) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginExitoso }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      if (!email.trim() || !password) {
        throw new Error('Por favor ingresa tu correo y contraseña');
      }

      const usuario = await api.login(email.trim(), password);
      onLoginExitoso(usuario);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setCargando(false);
    }
  };

  const rellenarCredenciales = (correo: string, clave: string) => {
    setEmail(correo);
    setPassword(clave);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 px-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Panel Izquierdo: Imagen & Bienvenida */}
        <div className="relative hidden md:flex flex-col justify-between p-8 text-white bg-stone-900">
          <div className="absolute inset-0 z-0 opacity-45">
            <img
              src="/src/assets/images/hotel_reception_lobby_1794268258111.jpg"
              alt="Recepción HospedaFlow"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/80 to-transparent" />
          </div>

          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <Hotel className="w-5 h-5 text-stone-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">HospedaFlow</span>
          </div>

          <div className="relative z-10 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Control de Accesos y Roles
            </div>
            <h2 className="text-2xl font-bold leading-tight">
              Bienvenido al Sistema de Gestión Hotelera
            </h2>
            <p className="text-xs text-stone-300 leading-relaxed">
              Inicia sesión con tu rol correspondiente para acceder a las funciones operativas,
              reservaciones o al catálogo exclusivo para huéspedes.
            </p>
          </div>

          <div className="relative z-10 pt-4 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
            <span>Posada El Encanto · Sprint 1</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Sesión Segura
            </span>
          </div>
        </div>

        {/* Panel Derecho: Formulario de Login */}
        <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex md:hidden items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-bold">
                <Hotel className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-lg font-bold text-stone-900">HospedaFlow</span>
            </div>

            <h1 className="text-xl font-bold text-stone-900">Iniciar Sesión</h1>
            <p className="text-xs text-stone-500 mt-1">
              Ingresa tus credenciales para acceder a la plataforma
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1.5">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              {cargando ? (
                <span>Validando credenciales...</span>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Credenciales de Prueba Rápidas (1 clic) */}
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              <KeyRound className="w-3.5 h-3.5 text-stone-400" />
              <span>Accesos Rápidos por Rol:</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {/* Administrador por Default */}
              <button
                type="button"
                onClick={() => rellenarCredenciales('admin@gmail.com', '123admin')}
                className="w-full text-left p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200/80 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-stone-900 block text-xs">
                    Administrador (Acceso Total & Perfiles)
                  </span>
                  <span className="font-mono text-[11px] text-stone-500">
                    admin@gmail.com · 123admin
                  </span>
                </div>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded">
                  Admin
                </span>
              </button>

              {/* Recepcionista */}
              <button
                type="button"
                onClick={() => rellenarCredenciales('recepcion@hospedaflow.ve', 'recep123')}
                className="w-full text-left p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200/80 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-stone-900 block text-xs">
                    Recepcionista (Reservas & Habitaciones)
                  </span>
                  <span className="font-mono text-[11px] text-stone-500">
                    recepcion@hospedaflow.ve · recep123
                  </span>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                  Recepción
                </span>
              </button>

              {/* Huésped */}
              <button
                type="button"
                onClick={() => rellenarCredenciales('carlos.mendoza@gmail.com', 'guest123')}
                className="w-full text-left p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200/80 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-stone-900 block text-xs">
                    Huésped (Solo Portal Huésped)
                  </span>
                  <span className="font-mono text-[11px] text-stone-500">
                    carlos.mendoza@gmail.com · guest123
                  </span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                  Huésped
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
