import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { RequestWithUser, JwtPayload } from '@/common/types';
import { TokensService } from '@/tokens/tokens.service';
import { UserService } from '@/user/user.service';
import { AuthService } from './auth.service';
import { getCookieOptions, clearCookie } from '@/common/utils/cookie';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@/common/configs/env.config';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tokensService: TokensService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    // 1. 嘗試驗證 Access Token
    const isAccessTokenValid = await this.validateAccessToken(req, res);
    if (isAccessTokenValid) {
      return true;
    }
    // 2. Access Token 失敗 嘗試驗證 Refresh Token
    const isRefreshTokenValid = await this.validateRefreshToken(req, res);
    if (isRefreshTokenValid) {
      return true;
    }
    // 3. 兩者皆失敗 拋出 401
    this.handleUnauthorized(res);
    return false;
  }

  // 驗證 Refresh Token
  private async validateRefreshToken(
    req: RequestWithUser,
    res: Response,
  ): Promise<boolean> {
    const { refreshToken } = req.cookies;
    if (!refreshToken || typeof refreshToken !== 'string') {
      return false;
    }
    try {
      const isRefreshTokenExist =
        await this.tokensService.findTokenByValue(refreshToken);
      // 檢查 Refresh Token 是否真實存在
      if (!isRefreshTokenExist) {
        return false;
      }

      const { sub, name, userId, isOld, email } = isRefreshTokenExist;
      const cookieOption = getCookieOptions(this.configService);
      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expireDate,
      } = await this.authService.generateTokens(sub, name);

      const accessTokenCookieExpire = this.configService.get(
        'ACCESS_TOKEN_COOKIE_EXPIRE',
        { infer: true },
      );
      const refreshTokenCookieExpire = this.configService.get(
        'REFRESH_TOKEN_COOKIE_EXPIRE',
        { infer: true },
      );
      // 如果是新的 token 就輪轉 舊的直接放行
      if (!isOld) {
        const data = {
          oldRefreshToken: refreshToken,
          newRefreshToken,
          userId,
          sub,
          username: name,
          newExpireDate: expireDate,
          email,
        };
        await this.tokensService.rotateRefreshToken(data);
        res.cookie('refreshToken', newRefreshToken, {
          maxAge: refreshTokenCookieExpire,
          ...cookieOption,
        });
      }
      // 無論是否輪轉 都更新 Access Token
      res.cookie('accessToken', newAccessToken, {
        maxAge: accessTokenCookieExpire,
        ...cookieOption,
      });
      req.user = { sub, username: name, id: userId };
      return true;
    } catch {
      return false;
    }
  }

  // 驗證 Access Token
  private async validateAccessToken(
    req: RequestWithUser,
    res: Response,
  ): Promise<boolean> {
    const { accessToken } = req.cookies;
    if (!accessToken || typeof accessToken !== 'string') {
      return false;
    }

    try {
      const payload: JwtPayload =
        await this.jwtService.verifyAsync(accessToken);
      // 用 sub + username 去查 user 是否存在
      const userId = await this.userService.getUserId(
        payload.username,
        payload.sub,
      );
      if (!userId) {
        return false;
      }

      req.user = { ...payload, id: userId };
      return true;
    } catch (error: unknown) {
      const err = error as Error;
      if (err.name !== 'TokenExpiredError') {
        this.handleUnauthorized(res);
      }
      return false;
    }
  }

  // 處理 401 錯誤
  private handleUnauthorized(res: Response) {
    clearCookie(this.configService, res, 'accessToken');
    clearCookie(this.configService, res, 'refreshToken');
    throw new UnauthorizedException();
  }
}
