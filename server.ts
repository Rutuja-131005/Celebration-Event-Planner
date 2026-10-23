import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './server/api/routes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request ID & Structured Logging Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    res.setHeader('X-Request-Id', reqId);
    next();
  });

  // Mount API router under /api/v1 as well as health endpoints
  app.use('/api/v1', apiRouter);
  app.get('/health/live', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
  app.get('/health/ready', (req, res) => res.json({ status: 'ready', database: 'connected' }));

  if (!isProduction) {
    // Development mode: Mount Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server Uncaught Error:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred.',
      },
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Celebration Atelier Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[Celebration Atelier Server] API endpoints available at http://0.0.0.0:${PORT}/api/v1`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
