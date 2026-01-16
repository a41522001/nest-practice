import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { RequestWithUser, JwtPayload } from 'src/common/types';
import { TokensService } from 'src/tokens/tokens.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { getCookieOptions, clearCookie } from '../common/utils/cookie';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/common/configs/env.config';
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
    const { accessToken, refreshToken } = req.cookies;
    // 驗證 accessToken
    if (accessToken && typeof accessToken === 'string') {
      try {
        const payload: JwtPayload =
          await this.jwtService.verifyAsync(accessToken);
        // 用 sub + username 去查 user 是否存在
        const userId = await this.userService.getUserId(
          payload.username,
          payload.sub,
        );
        if (userId) {
          req.user = {
            ...payload,
            id: userId,
          };
          return true;
        }
        // 如果 userId 不存在
        this.handleUnauthorized(res);
      } catch (error: unknown) {
        const err = error as Error;
        if (err.name !== 'TokenExpiredError') {
          this.handleUnauthorized(res);
        }
      }
    }
    // 驗證 refreshToken
    if (refreshToken && typeof refreshToken === 'string') {
      try {
        const isRefreshTokenExist =
          await this.tokensService.findTokenByValue(refreshToken);
        // 檢查 refresh token 是否真實存在
        if (isRefreshTokenExist) {
          const { id: tokenId } = isRefreshTokenExist;
          const { sub, name } = isRefreshTokenExist.user;
          const isNewToken = isRefreshTokenExist.refreshToken === refreshToken;
          const cookieOption = getCookieOptions(this.configService);
          const {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expireDate,
          } = await this.authService.generateTokens(sub, name);
          // 如果是新的 token 就輪轉 舊的直接放行
          if (isNewToken) {
            const oldExpiredAt = new Date(Date.now() + 15_000);
            await this.tokensService.rotateRefreshToken(
              tokenId,
              refreshToken,
              newRefreshToken,
              oldExpiredAt,
              expireDate,
            );
            res.cookie('accessToken', newAccessToken, {
              maxAge: 15 * 60 * 1000,
              ...cookieOption,
            });
            res.cookie('refreshToken', newRefreshToken, {
              maxAge: 7 * 24 * 60 * 60 * 1000,
              ...cookieOption,
            });
          } else {
            res.cookie('accessToken', newAccessToken, {
              maxAge: 15 * 60 * 1000,
              ...cookieOption,
            });
          }
          req.user = { sub, username: name, id: isRefreshTokenExist.userId };
          return true;
        }
        this.handleUnauthorized(res);
      } catch {
        this.handleUnauthorized(res);
      }
    }
    // 無 accessToken && refreshToken
    this.handleUnauthorized(res);
    return false;
  }
  // 處理401錯誤
  private handleUnauthorized(res: Response) {
    clearCookie(this.configService, res, 'accessToken');
    clearCookie(this.configService, res, 'refreshToken');
    throw new UnauthorizedException();
  }
}
