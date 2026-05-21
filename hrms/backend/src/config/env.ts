import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_URL: z.string().url().default('http://localhost:4000'),
  APP_URL: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().min(20).default('default_access_secret_1234567890_'),
  JWT_REFRESH_SECRET: z.string().min(20).default('default_refresh_secret_1234567890_'),
  JWT_INVITE_SECRET: z.string().min(20).default('default_invite_secret_1234567890_'),
  JWT_PASSWORD_RESET_SECRET: z.string().min(20).default('default_password_reset_secret_1234567890_'),
  JWT_TEMP_SECRET: z.string().min(20).default('default_temp_secret_1234567890_'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  SMTP_HOST: z.string().min(1).default('smtp.ethereal.email'),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().min(1).default('user@ethereal.email'),
  SMTP_PASS: z.string().min(1).default('password'),
  SMTP_FROM: z.string().min(1).default('noreply@hrms.com'),
  GOOGLE_CLIENT_ID: z.string().min(1).default('google_client_id_placeholder'),
  GOOGLE_CLIENT_SECRET: z.string().min(1).default('google_client_secret_placeholder'),
  SENTRY_DSN: z.string().optional().default(''),
});

export const env = envSchema.parse(process.env);
