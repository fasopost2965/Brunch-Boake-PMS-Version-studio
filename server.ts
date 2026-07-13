import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import roomsRouter from './backend/src/routes/rooms';
import reservationsRouter from './backend/src/routes/reservations';
import { isDbConnected } from './backend/src/db/connection';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Register REST API routes
  app.use('/api/rooms', roomsRouter);
  app.use('/api/reservations', reservationsRouter);

  // Health and Info Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'PMS Brunch Bouaké API Server',
      database: {
        type: 'MySQL',
        connected: isDbConnected(),
        mode: isDbConnected() ? 'production' : 'simulation'
      }
    });
  });

  // Integration of Vite Frontend
  const isProd = process.env.NODE_ENV === 'production';
  
  if (!isProd) {
    console.log('[SYSTEM] Initialisation de Vite en mode Middleware de Développement...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.join(process.cwd(), 'frontend') // Set the root to our moved frontend folder
    });
    app.use(vite.middlewares);
  } else {
    console.log('[SYSTEM] Fonctionnement en mode Production (fichiers statiques)...');
    const distPath = path.join(process.cwd(), 'frontend/dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('--------------------------------------------------');
    console.log(`[PMS SERVER] Serveur démarré avec succès !`);
    console.log(`[PMS SERVER] Adresse locale : http://localhost:${PORT}`);
    console.log(`[PMS SERVER] Mode : ${isProd ? 'Production' : 'Développement'}`);
    console.log('--------------------------------------------------');
  });
}

startServer().catch((err) => {
  console.error('[CRITICAL] Échec du démarrage du serveur de l\'application:', err);
  process.exit(1);
});
export {};
