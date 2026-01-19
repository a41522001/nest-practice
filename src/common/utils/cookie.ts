import type { Response } from 'express';
import { EnvConfig } from '@/common/configs/env.config';
import { ConfigService } from '@nestjs/config';

const getCookieOptions = (configService: ConfigService<EnvConfig>) => {
  const isProduction =
    configService.get('NODE_ENVIRONMENT', { infer: true }) === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  } as const;
};

const clearCookie = (
  configService: ConfigService<EnvConfig>,
  res: Response,
  key: string,
): void => {
  const options = getCookieOptions(configService);
  res.clearCookie(key, options);
};
export { getCookieOptions, clearCookie };
