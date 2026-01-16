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
import type { RequestWithUser } from 'src/common/types';
import type { Response } from 'express';
import { getCookieOptions } from '../common/utils/cookie';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/common/configs/env.config';
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
    res.cookie('accessToken', accessToken, {
      maxAge: 15 * 60 * 1000,
      ...cookieOption,
    });
    res.cookie('refreshToken', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      ...cookieOption,
    });
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
