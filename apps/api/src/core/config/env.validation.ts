import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string(),
  JWT_EXPIRATION: z.string().default('1d'),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRATION: z.string().default('30d'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.string().transform(Number).default('1025'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().default('noreply@flowlyx.com'),
  AUTHORIZED_JAVASCRIPT_ORIGINS: z.string().default('http://localhost:3015'),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Environment validation error: ${result.error.message}`);
  }
  return result.data;
}
