import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { clientOrigins, env, isProd } from './config/env';
import { errorHandler, notFound } from './middleware/error';
import routes from './routes';

export function createApp(): Application {
  const app = express();

  // Behind a reverse proxy in production (Render/Vercel/etc.) so secure
  // cookies, req.ip and rate-limiting see the real client details.
  if (isProd) app.set('trust proxy', 1);

  // Security + infra middleware
  app.use(helmet());
  app.use(
    cors({
      // Allow configured origins (prod domain + localhost); requests without
      // an Origin header (curl, server-to-server, health checks) are allowed.
      origin: (origin, callback) => {
        if (!origin || clientOrigins.includes(origin)) callback(null, true);
        else callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
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
