import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { apiRouter } from '../server/api/routes.ts';
import { detectPrototypePollution } from '../server/utils/security.ts';
import { serverLogger } from '../server/utils/logger.ts';

dotenv.config();

const app = express();
app.disable('x-powered-by');

// Hardened Security Headers Middleware
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
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

// Vercel Serverless Subpath Normalization Middleware
// Restores original request subpath if rewritten by Vercel edge proxy
app.use((req: Request, _res: Response, next: NextFunction) => {
  const forwardedUri =
    (req.headers['x-forwarded-uri'] as string) ||
    (req.headers['x-vercel-original-url'] as string) ||
    (req.headers['x-matched-path'] as string);

  if (forwardedUri && (req.url === '/api' || req.url === '/' || req.url === '')) {
    req.url = forwardedUri;
  } else if (req.query && (req.query['0'] || req.query['1'])) {
    const sub = (req.query['0'] || req.query['1']) as string;
    if (sub && !req.url.includes(sub)) {
      req.url = `/api/${sub}`;
    }
  }
  next();
});

// Health check endpoints
app.get('/health/live', (_req: Request, res: Response) => res.json({ status: 'ok', uptime: process.uptime() }));
app.get('/health/ready', (_req: Request, res: Response) => res.json({ status: 'ready', database: 'connected' }));
app.get('/api/health/live', (_req: Request, res: Response) => res.json({ status: 'ok', uptime: process.uptime() }));
app.get('/api/health/ready', (_req: Request, res: Response) => res.json({ status: 'ready', database: 'connected' }));

// Root Service Diagnostics (Guarantees HTTP 200 on base endpoints)
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Celebration Atelier API Serverless Gateway',
    version: '1.0.0',
    endpoints: '/api/v1',
    uptime: process.uptime(),
  });
});

app.get('/api', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Celebration Atelier API Gateway',
    version: '1.0.0',
    endpoints: '/api/v1',
    uptime: process.uptime(),
  });
});

// Mount API router across possible path variations rewritten by Vercel
app.use('/api/v1', apiRouter);
app.use('/v1', apiRouter);
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Fallback JSON 404 for unmatched API requests (prevents raw Express HTML 404)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `API endpoint '${req.method} ${req.url}' was not found.`,
    },
  });
});

// Error handling middleware
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Malformed JSON payload in request body.',
      },
    });
  }
  serverLogger.error('Serverless Uncaught Error:', 'Serverless', {
    error: err instanceof Error ? err.message : String(err),
  });
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred.',
    },
  });
});

export function handler(req: Request, res: Response): void {
  app(req, res);
}

export default app;
