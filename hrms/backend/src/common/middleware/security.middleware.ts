import cors from 'cors';
import helmet from 'helmet';
import type { Application, Request, Response, NextFunction } from 'express';
import { env } from '../../config/env.js';

export const applySecurityMiddleware = (app: Application): void => {
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'", env.APP_URL, env.API_URL],
        },
      },
    }),
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow localhost, local network IPs (192.168.*), or the exact APP_URL
        if (
          origin.startsWith('http://localhost') || 
          origin.startsWith('http://192.168.') || 
          origin === env.APP_URL
        ) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-org-slug'],
    }),
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    const proto = req.headers['x-forwarded-proto'];
    if (env.NODE_ENV === 'production' && proto && proto !== 'https') {
      const host = req.headers.host;
      res.redirect(301, `https://${host}${req.url}`);
      return;
    }
    next();
  });
};
