import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Validate and strongly-type all environment variables at startup.
 * Fail fast with a readable message if anything required is missing.
 */
const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  // Comma-separated list of allowed browser origins (e.g. prod + localhost).
  CLIENT_URL: z.string().default('http://localhost:3000'),
  ADMIN_NAME: z.string().default('Admin User'),
  ADMIN_EMAIL: z.string().email().default('admin@doctortracker.com'),
  ADMIN_PASSWORD: z.string().min(6).default('Admin@12345'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:');
  // eslint-disable-next-line no-console
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';

/** Allowed browser origins for CORS, parsed from the CLIENT_URL list.
 *  Trailing slashes are stripped so "https://app.vercel.app/" still matches the
 *  browser's slash-less Origin header. */
export const clientOrigins = env.CLIENT_URL.split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);
