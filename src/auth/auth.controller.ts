import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './auth.dto';
import { AuthGuard } from './auth.guard';
import type { RequestWithUser } from 'src/common/types';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signup(@Body() signupDto: SignupDto): Promise<string> {
    const message = await this.authService.signup(signupDto);
    return message;
  }
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginDto): Promise<string> {
    const { access_token } = await this.authService.login(loginUserDto);
    return access_token;
  }
  @UseGuards(AuthGuard)
  @Get('profile')
  profile(@Request() req: RequestWithUser) {
    return req.user;
  }
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
