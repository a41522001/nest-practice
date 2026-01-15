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
  REFRESH_TOKEN_SECRET: z.string().min(10),
  REFRESH_TOKEN_EXPIRE: z.string(),
  API_URL: z.string(),
});

export type EnvConfig = z.infer<typeof envSchema>;
