import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { sendSuccess } from './utils/apiResponse';

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;

  const allowed = env.CORS_ORIGIN.split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  if (allowed.includes(origin)) return true;

  // Vercel preview/production URLs change often; allow any https://*.vercel.app
  try {
    const url = new URL(origin);
    if (url.protocol === 'https:' && url.hostname.endsWith('.vercel.app')) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked for origin: ${origin}`));
        }
      },
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get('/health', (_req, res) => sendSuccess(res, { status: 'ok' }));
  app.use('/api', routes);

  app.use(errorHandler);
  return app;
}
