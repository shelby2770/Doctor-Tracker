import type { CookieOptions, Request, Response } from 'express';
import { isProd } from '../config/env';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AUTH_COOKIE, signToken } from '../utils/token';
import type { LoginInput } from '../validators/auth.validator';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: SEVEN_DAYS,
  path: '/',
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.valid!.body as LoginInput;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  res.cookie(AUTH_COOKIE, token, cookieOptions);

  res.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token, // also returned for non-cookie clients (e.g. mobile)
    },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE, { ...cookieOptions, maxAge: undefined });
  res.json({ success: true, message: 'Logged out' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.sub);
  if (!user) throw ApiError.unauthorized('Session user no longer exists');

  res.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    },
  });
});
