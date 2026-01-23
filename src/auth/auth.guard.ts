import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { RequestWithUser, JwtPayload } from '@/common/types';
import { UserService } from '@/user/user.service';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@/common/configs/env.config';
import { clearCookie } from '@/common/utils/cookie';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const res = context.switchToHttp().getResponse<Response>();

    // 1. 先嘗試驗證 Access Token
    const accessTokenResult = await this.validateAccessToken(req);
    if (accessTokenResult.valid) {
      req.user = accessTokenResult.user!;
      return true;
    }

    // 2. Access Token 失敗，檢查是否有 Refresh Token
    const { refreshToken } = req.cookies;
    if (refreshToken && typeof refreshToken === 'string') {
      // 標記需要刷新，讓 Interceptor 處理
      req['needsTokenRefresh'] = true;
      req['refreshToken'] = refreshToken;
      return true; // 先放行，讓 Interceptor 處理
    }

    // 3. 兩者都沒有，拒絕
    this.handleUnauthorized(res);
    return false;
  }

  private async validateAccessToken(req: RequestWithUser): Promise<{
    valid: boolean;
    user?: { sub: string; username: string; id: string };
  }> {
    const { accessToken } = req.cookies;
    if (!accessToken || typeof accessToken !== 'string') {
      return { valid: false };
    }

    try {
      const payload: JwtPayload =
        await this.jwtService.verifyAsync(accessToken);
      const userId = await this.userService.getUserId(payload.sub);
      if (!userId) {
        return { valid: false };
      }
      return {
        valid: true,
        user: { sub: payload.sub, username: payload.username, id: userId },
      };
    } catch (error: unknown) {
      const err = error as Error;
      // 如果不是過期錯誤，直接清除 Cookie
      if (err.name !== 'TokenExpiredError') {
        const res = req.res;
        if (res) {
          this.handleUnauthorized(res);
        }
      }
      return { valid: false };
    }
  }

  private handleUnauthorized(res: Response) {
    clearCookie(this.configService, res, 'accessToken');
    clearCookie(this.configService, res, 'refreshToken');
    throw new UnauthorizedException();
  }
}
