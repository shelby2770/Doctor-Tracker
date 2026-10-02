import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { AUTH_COOKIE, verifyToken } from '../utils/token';

/**
 * Protect a route: require a valid JWT, taken from the httpOnly cookie
 * (primary) or an `Authorization: Bearer <token>` header (fallback).
 * This is the real security boundary — every protected endpoint runs it.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const cookieToken = req.cookies?.[AUTH_COOKIE] as string | undefined;
    const header = req.headers.authorization;
    const bearerToken = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    const token = cookieToken || bearerToken;

    if (!token) {
      throw ApiError.unauthorized('Authentication required');
    }

    req.user = verifyToken(token);
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(ApiError.unauthorized('Invalid or expired session'));
  }
}
