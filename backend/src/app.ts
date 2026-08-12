import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { sendSuccess } from './utils/apiResponse';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get('/health', (_req, res) => sendSuccess(res, { status: 'ok' }));
  app.use('/api', routes);

  app.use(errorHandler);
  return app;
}
