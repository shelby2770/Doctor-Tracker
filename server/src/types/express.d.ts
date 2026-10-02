import type { JwtPayload } from '../utils/token';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Populated by the `authenticate` middleware. */
      user?: JwtPayload;
      /** Populated by the `validate` middleware with parsed+coerced input. */
      valid?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
