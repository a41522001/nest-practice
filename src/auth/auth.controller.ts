import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './auth.dto';
import { AuthGuard } from './auth.guard';
import type { RequestWithUser } from '@/common/types';
import type { Response } from 'express';
import { getCookieOptions, clearCookie } from '@/common/utils/cookie';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@/common/configs/env.config';
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {}
  // 註冊
  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signup(@Body() signupDto: SignupDto): Promise<string> {
    const message = await this.authService.signup(signupDto);
    return message;
  }
  // 登入
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginUserDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { accessToken, refreshToken } =
      await this.authService.login(loginUserDto);
    const cookieOption = getCookieOptions(this.configService);
    const accessTokenCookieExpire = this.configService.get(
      'ACCESS_TOKEN_COOKIE_EXPIRE',
      { infer: true },
    );
    const refreshTokenCookieExpire = this.configService.get(
      'REFRESH_TOKEN_COOKIE_EXPIRE',
      { infer: true },
    );
    res.cookie('accessToken', accessToken, {
      maxAge: accessTokenCookieExpire,
      ...cookieOption,
    });
    res.cookie('refreshToken', refreshToken, {
      maxAge: refreshTokenCookieExpire,
      ...cookieOption,
    });
  }
  // 登出
  @Get('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async logout(@Request() req: RequestWithUser, @Res() res: Response) {
    const { refreshToken } = req.cookies;
    const userId = req.user.id;
    await this.authService.logout(userId, refreshToken);
    clearCookie(this.configService, res, 'accessToken');
    clearCookie(this.configService, res, 'refreshToken');
  }
  // TODO: profile 會棄用
  @UseGuards(AuthGuard)
  @Get('profile')
  profile(@Request() req: RequestWithUser) {
    return req.user;
  }
  // TODO: ERROR 測試用
  @Get('error')
  error() {
    const num = Math.random();
    if (num > 0.5) {
      throw new Error('錯誤');
    } else {
      return 'ok';
    }
  }
}
