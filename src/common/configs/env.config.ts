import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  NODE_ENVIRONMENT: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.preprocess((v) => Number(v), z.number().default(3000)),
  FRONT_END_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string().min(10),
  ACCESS_TOKEN_EXPIRE: z.string(),
  ACCESS_TOKEN_COOKIE_EXPIRE: z.string().transform((v) => Number(v)),
  REFRESH_TOKEN_SECRET: z.string().min(10),
  REFRESH_TOKEN_EXPIRE: z.string().transform((v) => Number(v)),
  REFRESH_TOKEN_COOKIE_EXPIRE: z.string().transform((v) => Number(v)),
  MAX_DEVICES: z.string().transform((v) => Number(v)),
  API_URL: z.string(),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.preprocess((v) => Number(v), z.number().default(6379)),
  REDIS_PASSWORD: z.string().optional(),
  POSTGRES_PASSWORD: z.string(),
});

export type EnvConfig = z.infer<typeof envSchema>;
