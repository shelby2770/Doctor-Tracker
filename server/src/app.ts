import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/error';
import routes from './routes';

export function createApp(): Application {
  const app = express();

  // Security + infra middleware
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true, // allow the httpOnly auth cookie across origins
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // API routes
  app.use('/api', routes);

  // 404 + centralised error handling (must be last)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
