/**
 * HospedaFlow - Servidor Backend Express & Integración con Vite
 * Entorno de Ejecución Full-Stack en Puerto 3000
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/routes/api.ts';
import { JsonDatabase } from './src/server/db/JsonDatabase.ts';
import { HabitacionJsonRepository } from './src/server/repository/HabitacionJsonRepository.ts';
import { ReservaJsonRepository } from './src/server/repository/ReservaJsonRepository.ts';
import { OfertaJsonRepository } from './src/server/repository/OfertaJsonRepository.ts';
import { UsuarioJsonRepository } from './src/server/repository/UsuarioJsonRepository.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Middlewares para parsing de cuerpos JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Asegurar persistencia y precargar datos iniciales
  await JsonDatabase.asegurarDirectorio();
  await HabitacionJsonRepository.findAll();
  await ReservaJsonRepository.findAll();
  await OfertaJsonRepository.findAll();
  await UsuarioJsonRepository.findAll();

  // Registrar rutas de la API REST (/api/*)
  app.use('/api', apiRouter);

  // Servir assets generados localmente
  app.use('/src/assets/images', express.static(path.join(__dirname, 'src/assets/images')));
  app.use('/public', express.static(path.join(__dirname, 'public')));
  app.use('/frontend', express.static(path.join(__dirname, 'frontend')));
  app.get('/frontend-app', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'frontend/views/index.html'));
  });

  if (!isProduction) {
    // Modo Desarrollo: Montar Vite como middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Modo Producción: Servir archivos estáticos construidos
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[HospedaFlow] Servidor activo en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[HospedaFlow] Error fatal al iniciar servidor:', err);
  process.exit(1);
});
