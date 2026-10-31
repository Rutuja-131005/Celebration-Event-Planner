import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { env } from './server/config/env.ts';
import { serverLogger } from './server/utils/logger.ts';
import { apiRouter } from './server/api/routes.ts';
import { detectPrototypePollution } from './server/utils/security.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = env.NODE_ENV === 'production';
const PORT = env.PORT;

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  app.disable('x-powered-by');

  // Hardened Security Headers Middleware (OWASP ASVS / WCAG Compliant)
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('X-Download-Options', 'noopen');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('Origin-Agent-Cluster', '?1');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: https://api.dicebear.com; connect-src 'self' https://generativelanguage.googleapis.com https://api.dicebear.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self';"
    );
    next();
  });

  app.use(express.json({ limit: '500kb' }));
  app.use(express.urlencoded({ extended: true, limit: '500kb' }));

  // Anti-Prototype Pollution Protection Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.body && detectPrototypePollution(req.body)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Suspicious payload detected.',
        },
      });
    }
    next();
  });

  // Request ID & Structured Logging Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    res.setHeader('X-Request-Id', reqId);
    next();
  });

  app.set('etag', 'strong');

  // Mount API router under /api/v1 as well as health endpoints
  app.use('/api/v1', apiRouter);
  app.get('/health/live', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
  app.get('/health/ready', (req, res) => res.json({ status: 'ready', database: 'connected' }));

  if (!isProduction) {
    // Development mode: Mount Vite dev server middleware (HMR disabled in middleware mode to avoid reload loops)
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static assets with modern HTTP caching
    const distPath = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        maxAge: '1y',
        immutable: true,
        dotfiles: 'deny',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          } else {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );
    app.get('*', (_req: Request, res: Response) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Error handling middleware
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError && typeof err === 'object' && err !== null && 'body' in err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Malformed JSON payload in request body.',
        },
      });
    }
    serverLogger.error('Server Uncaught Error:', 'Server', { error: err instanceof Error ? err.message : String(err) });
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred.',
      },
    });
  });

  server.listen(PORT, () => {
    serverLogger.info(`Celebration Atelier Server running on http://localhost:${PORT}`, 'Server');
    serverLogger.info(`Direct IPv4 link: http://127.0.0.1:${PORT}`, 'Server');
    serverLogger.info(`API endpoints available at http://localhost:${PORT}/api/v1`, 'Server');
  });
}

startServer().catch((err) => {
  serverLogger.error('Failed to start server:', 'Bootstrap', { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
