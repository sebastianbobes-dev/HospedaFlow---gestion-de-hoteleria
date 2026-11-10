/**
 * HospedaFlow - Controladores REST y Rutas de la API
 * Capa de Controladores (Sección 4.1 y 5.3 del Documento Técnico)
 */

import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { HabitacionService } from '../service/HabitacionService.ts';
import { ReservaService } from '../service/ReservaService.ts';
import { OfertaService } from '../service/OfertaService.ts';
import { PerfilService } from '../service/PerfilService.ts';
import { JsonDatabase } from '../db/JsonDatabase.ts';
import { HabitacionJsonRepository } from '../repository/HabitacionJsonRepository.ts';
import { ReservaJsonRepository } from '../repository/ReservaJsonRepository.ts';
import { OfertaJsonRepository } from '../repository/OfertaJsonRepository.ts';
import { UsuarioJsonRepository } from '../repository/UsuarioJsonRepository.ts';
import { EstadoHabitacion, RolUsuario, TipoHabitacion } from '../../types/hotel.ts';

export const apiRouter = Router();

// ==========================================
// 1. HabitacionRestController (/api/habitaciones)
// ==========================================

// GET /api/habitaciones - Listar habitaciones con filtros
apiRouter.get('/habitaciones', async (req: Request, res: Response) => {
  try {
    const { estado, tipo, capacidadMinima } = req.query;
    const habitaciones = await HabitacionService.listarTodas({
      estado: estado as EstadoHabitacion,
      tipo: tipo as TipoHabitacion,
      capacidadMinima: capacidadMinima ? Number(capacidadMinima) : undefined,
    });
    res.json({ success: true, data: habitaciones });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/habitaciones/disponibilidad - Consultar disponibilidad por fechas
apiRouter.get('/habitaciones/disponibilidad', async (req: Request, res: Response) => {
  try {
    const { fechaEntrada, fechaSalida, tipo, numHuespedes } = req.query;
    if (!fechaEntrada || !fechaSalida) {
      return res.status(400).json({
        success: false,
        error: 'Debe especificar los parámetros fechaEntrada y fechaSalida',
      });
    }

    const disponibles = await HabitacionService.consultarDisponibilidad(
      String(fechaEntrada),
      String(fechaSalida),
      tipo ? (String(tipo) as TipoHabitacion) : undefined,
      numHuespedes ? Number(numHuespedes) : undefined
    );

    res.json({ success: true, data: disponibles });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/habitaciones/:id - Obtener una habitación
apiRouter.get('/habitaciones/:id', async (req: Request, res: Response) => {
  try {
    const habitacion = await HabitacionService.obtenerPorId(req.params.id);
    res.json({ success: true, data: habitacion });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// POST /api/habitaciones - Registrar nueva habitación (HabitacionRequestDTO)
apiRouter.post('/habitaciones', async (req: Request, res: Response) => {
  try {
    const habitacion = await HabitacionService.crearHabitacion(req.body);
    res.status(201).json({ success: true, data: habitacion, message: 'Habitación creada exitosamente' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/habitaciones/:id - Actualizar datos de habitación
apiRouter.put('/habitaciones/:id', async (req: Request, res: Response) => {
  try {
    const habitacion = await HabitacionService.actualizarHabitacion(req.params.id, req.body);
    res.json({ success: true, data: habitacion, message: 'Habitación actualizada correctamente' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PATCH /api/habitaciones/:id/estado - Cambiar estado (Disponible, Ocupada, Mantenimiento)
apiRouter.patch('/habitaciones/:id/estado', async (req: Request, res: Response) => {
  try {
    const { estado } = req.body;
    if (!estado) {
      return res.status(400).json({ success: false, error: 'Debe especificar el nuevo estado' });
    }
    const habitacion = await HabitacionService.cambiarEstado(req.params.id, estado);
    res.json({ success: true, data: habitacion, message: `Estado cambiado a ${estado}` });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/habitaciones/:id - Eliminar habitación
apiRouter.delete('/habitaciones/:id', async (req: Request, res: Response) => {
  try {
    await HabitacionService.eliminarHabitacion(req.params.id);
    res.json({ success: true, message: 'Habitación eliminada satisfactoriamente' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. ReservaRestController (/api/reservas)
// ==========================================

// GET /api/reservas - Listar reservas
apiRouter.get('/reservas', async (req: Request, res: Response) => {
  try {
    const { estado, huespedId, habitacionId, fecha } = req.query;
    const reservas = await ReservaService.listarTodas({
      estado: estado as any,
      huespedId: huespedId ? String(huespedId) : undefined,
      habitacionId: habitacionId ? String(habitacionId) : undefined,
      fecha: fecha ? String(fecha) : undefined,
    });
    res.json({ success: true, data: reservas });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/reservas/:id - Obtener una reserva por ID
apiRouter.get('/reservas/:id', async (req: Request, res: Response) => {
  try {
    const reserva = await ReservaService.obtenerPorId(req.params.id);
    res.json({ success: true, data: reserva });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// POST /api/reservas - Registrar nueva reserva (ReservaRequestDTO)
apiRouter.post('/reservas', async (req: Request, res: Response) => {
  try {
    const reserva = await ReservaService.registrarReserva(req.body);
    res.status(201).json({
      success: true,
      data: reserva,
      message: `Reserva ${reserva.codigoReserva} registrada con éxito`,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/reservas/:id/fechas - Modificar fechas de estancia
apiRouter.put('/reservas/:id/fechas', async (req: Request, res: Response) => {
  try {
    const { fechaEntrada, fechaSalida } = req.body;
    if (!fechaEntrada || !fechaSalida) {
      return res.status(400).json({ success: false, error: 'Debe especificar fechaEntrada y fechaSalida' });
    }
    const reserva = await ReservaService.modificarFechas(req.params.id, fechaEntrada, fechaSalida);
    res.json({ success: true, data: reserva, message: 'Fechas modificadas con éxito' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PATCH /api/reservas/:id/confirmar - Confirmar reserva
apiRouter.patch('/reservas/:id/confirmar', async (req: Request, res: Response) => {
  try {
    const reserva = await ReservaService.confirmarReserva(req.params.id);
    res.json({ success: true, data: reserva, message: 'Reserva confirmada exitosamente' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PATCH /api/reservas/:id/cancelar - Cancelar reserva
apiRouter.patch('/reservas/:id/cancelar', async (req: Request, res: Response) => {
  try {
    const { motivo } = req.body;
    const reserva = await ReservaService.cancelarReserva(req.params.id, motivo);
    res.json({ success: true, data: reserva, message: 'Reserva cancelada' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PATCH /api/reservas/:id/asignar - Reasignar habitación
apiRouter.patch('/reservas/:id/asignar', async (req: Request, res: Response) => {
  try {
    const { habitacionId } = req.body;
    if (!habitacionId) {
      return res.status(400).json({ success: false, error: 'Debe especificar habitacionId' });
    }
    const reserva = await ReservaService.asignarHabitacion(req.params.id, habitacionId);
    res.json({ success: true, data: reserva, message: 'Habitación asignada correctamente' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/reservas/:id - Eliminar reserva
apiRouter.delete('/reservas/:id', async (req: Request, res: Response) => {
  try {
    await ReservaService.eliminarReserva(req.params.id);
    res.json({ success: true, message: 'Registro de reserva eliminado' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. OfertaRestController (/api/ofertas)
// ==========================================

// GET /api/ofertas - Listar promociones
apiRouter.get('/ofertas', async (req: Request, res: Response) => {
  try {
    const soloActivas = req.query.activas === 'true';
    const ofertas = await OfertaService.listarTodas(soloActivas);
    res.json({ success: true, data: ofertas });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/ofertas/:id - Obtener oferta por ID
apiRouter.get('/ofertas/:id', async (req: Request, res: Response) => {
  try {
    const oferta = await OfertaService.obtenerPorId(req.params.id);
    res.json({ success: true, data: oferta });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// POST /api/ofertas - Registrar nueva oferta (OfertaRequestDTO)
apiRouter.post('/ofertas', async (req: Request, res: Response) => {
  try {
    const oferta = await OfertaService.crearOferta(req.body);
    res.status(201).json({ success: true, data: oferta, message: 'Oferta promocional creada' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/ofertas/:id - Modificar oferta
apiRouter.put('/ofertas/:id', async (req: Request, res: Response) => {
  try {
    const oferta = await OfertaService.actualizarOferta(req.params.id, req.body);
    res.json({ success: true, data: oferta, message: 'Oferta actualizada exitosamente' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/ofertas/:id - Eliminar oferta
apiRouter.delete('/ofertas/:id', async (req: Request, res: Response) => {
  try {
    await OfertaService.eliminarOferta(req.params.id);
    res.json({ success: true, message: 'Oferta eliminada correctamente' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/ofertas/validar - Validar código promocional
apiRouter.post('/ofertas/validar', async (req: Request, res: Response) => {
  try {
    const { codigo, tipoHabitacion, fecha } = req.body;
    const resultado = await OfertaService.validarOferta(
      codigo,
      tipoHabitacion || 'Todas',
      fecha || new Date().toISOString().split('T')[0]
    );
    res.json({ success: true, data: resultado });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==========================================
// 4. PerfilRestController (/api/usuarios)
// ==========================================

// GET /api/usuarios - Listar perfiles
apiRouter.get('/usuarios', async (req: Request, res: Response) => {
  try {
    const { rol } = req.query;
    const usuarios = await PerfilService.listarUsuarios(rol as RolUsuario);
    res.json({ success: true, data: usuarios });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/usuarios/:id - Obtener un usuario por ID
apiRouter.get('/usuarios/:id', async (req: Request, res: Response) => {
  try {
    const usuario = await PerfilService.obtenerPorId(req.params.id);
    res.json({ success: true, data: usuario });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// POST /api/usuarios - Registrar nuevo usuario (UsuarioRequestDTO)
apiRouter.post('/usuarios', async (req: Request, res: Response) => {
  try {
    const usuario = await PerfilService.crearUsuario(req.body);
    res.status(201).json({ success: true, data: usuario, message: 'Perfil de usuario registrado' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/usuarios/:id - Actualizar datos de usuario
apiRouter.put('/usuarios/:id', async (req: Request, res: Response) => {
  try {
    const usuario = await PerfilService.actualizarUsuario(req.params.id, req.body);
    res.json({ success: true, data: usuario, message: 'Perfil actualizado' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/usuarios/:id - Eliminar usuario
apiRouter.delete('/usuarios/:id', async (req: Request, res: Response) => {
  try {
    await PerfilService.eliminarUsuario(req.params.id);
    res.json({ success: true, message: 'Usuario eliminado' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/auth/login - Autenticación y selección de sesión
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const usuario = await PerfilService.autenticar(email, password);
    res.json({ success: true, data: usuario, message: `Bienvenido, ${usuario.nombre}` });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
});

// ==========================================
// 5. Estadísticas del Dashboard e Inspección de Archivos JSON
// ==========================================

// GET /api/stats - Métricas gerenciales y de recepción
apiRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await ReservaService.obtenerEstadisticas();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/archivos-json/:nombre - Ver contenido plano de un archivo .json (para Visor de Arquitectura)
apiRouter.get('/archivos-json/:nombre', async (req: Request, res: Response) => {
  try {
    const permitidos = ['habitaciones.json', 'reservas.json', 'ofertas.json', 'usuarios.json'];
    const nombre = req.params.nombre.endsWith('.json') ? req.params.nombre : `${req.params.nombre}.json`;

    if (!permitidos.includes(nombre)) {
      return res.status(400).json({ success: false, error: 'Archivo no permitido' });
    }

    const contenido = await JsonDatabase.obtenerContenidoCrudo(nombre);
    res.json({ success: true, archivo: nombre, contenido });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/reset-data - Restablecer datos iniciales de demostración
apiRouter.post('/reset-data', async (_req: Request, res: Response) => {
  try {
    await HabitacionJsonRepository.reset();
    await ReservaJsonRepository.reset();
    await OfertaJsonRepository.reset();
    await UsuarioJsonRepository.reset();
    res.json({ success: true, message: 'Base de datos JSON restablecida a los valores iniciales del Sprint 1' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/codigo-fuente - Inspeccionar archivos Java de backend/ o HTML/CSS/JS de frontend/
apiRouter.get('/codigo-fuente', async (req: Request, res: Response) => {
  try {
    const rutaRelativa = req.query.path as string;
    if (!rutaRelativa || (!rutaRelativa.startsWith('backend/') && !rutaRelativa.startsWith('frontend/'))) {
      return res.status(400).json({ success: false, error: 'Ruta no permitida' });
    }
    const rutaCompleta = path.resolve(process.cwd(), rutaRelativa);
    const contenido = await fs.readFile(rutaCompleta, 'utf-8');
    res.json({ success: true, path: rutaRelativa, content: contenido });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

