import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { CustomRequest } from '../types';

@Injectable()
export class TimezoneMiddleware implements NestMiddleware {
  use(req: CustomRequest, res: Response, next: NextFunction) {
    const cookies = req.cookies as Record<string, string> | undefined;
    const timezone = cookies?.timezone;
    req.timezone = this.isValidTimezone(timezone) ? timezone : 'UTC';
    next();
  }

  private isValidTimezone(tz: string | undefined): tz is string {
    if (!tz) return false;
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  }
}
