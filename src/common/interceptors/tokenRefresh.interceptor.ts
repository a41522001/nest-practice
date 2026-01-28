import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import type { Response } from 'express';
import { CustomRequest } from '@/common/types';
import { TokensService } from '@/tokens/tokens.service';
import { AuthService } from '@/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@/common/configs/env.config';
import { getCookieOptions, clearCookie } from '@/common/utils/cookie';

@Injectable()
export class TokenRefreshInterceptor implements NestInterceptor {
  constructor(
    private readonly tokensService: TokensService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<CustomRequest>();
    const res = context.switchToHttp().getResponse<Response>();

    // 如果不需要刷新，直接放行
    if (!req['needsTokenRefresh']) {
      return next.handle();
    }

    const refreshToken = req['refreshToken'] as string;

    // 把 async 邏輯轉成 Observable
    return from(this.handleTokenRefresh(req, res, refreshToken)).pipe(
      // switchMap: 等前面的 Observable 完成後，切換到下一個 Observable
      switchMap((success) => {
        if (!success) {
          // 刷新失敗，拋出錯誤
          return throwError(() => new UnauthorizedException());
        }
        // 刷新成功，繼續執行 Controller
        return next.handle();
      }),
      // 捕獲任何錯誤
      catchError((err: unknown) => {
        clearCookie(this.configService, res, 'accessToken');
        clearCookie(this.configService, res, 'refreshToken');
        return throwError(() => err as Error);
      }),
    );
  }

  private async handleTokenRefresh(
    req: CustomRequest,
    res: Response,
    refreshToken: string,
  ): Promise<boolean> {
    try {
      // 1. 查詢 Refresh Token 是否存在
      const tokenData = await this.tokensService.findTokenByValue(refreshToken);
      if (!tokenData) {
        return false;
      }

      const { sub, name, userId, isOld, email } = tokenData;

      // 2. 生成新的 Tokens
      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expireDate,
      } = await this.authService.generateTokens(sub, name);

      const cookieOption = getCookieOptions(this.configService);
      const accessTokenCookieExpire = this.configService.get(
        'ACCESS_TOKEN_COOKIE_EXPIRE',
        { infer: true },
      );
      const refreshTokenCookieExpire = this.configService.get(
        'REFRESH_TOKEN_COOKIE_EXPIRE',
        { infer: true },
      );

      // 3. 如果是新的 Token 就輪轉
      if (!isOld) {
        await this.tokensService.rotateRefreshToken({
          oldRefreshToken: refreshToken,
          newRefreshToken,
          userId,
          sub,
          username: name,
          newExpireDate: expireDate,
          email,
        });
        res.cookie('refreshToken', newRefreshToken, {
          maxAge: refreshTokenCookieExpire,
          ...cookieOption,
        });
      }

      // 4. 更新 Access Token Cookie
      res.cookie('accessToken', newAccessToken, {
        maxAge: accessTokenCookieExpire,
        ...cookieOption,
      });

      // 5. 設置 user 到 request
      req.user = { sub, username: name, id: userId };

      return true;
    } catch {
      return false;
    }
  }
}
