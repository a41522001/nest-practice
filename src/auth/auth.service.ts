import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { LoginDto, SignupDto } from './auth.dto';
import { decodePassword, saltPassword } from '@/common/utils';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { getRefreshTokenExpiresAt } from '@/common/utils';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@/common/configs/env.config';
import { TokensService } from '@/tokens/tokens.service';
import { Tokens } from '@/common/types';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokensService: TokensService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {}
  // 註冊
  async signup(signupDto: SignupDto): Promise<string> {
    const { name, email, pwd } = signupDto;
    const user = await this.userService.findUser(email);
    if (user) {
      throw new BadRequestException('此Email已被使用');
    }

    const saltPwd = await saltPassword(pwd);
    await this.userService.createUser(name, email, saltPwd);
    return '註冊成功';
  }

  // 登入
  async login(loginDto: LoginDto): Promise<Tokens> {
    const { email, pwd } = loginDto;
    const user = await this.userService.findUser(email);
    if (!user) {
      throw new BadRequestException('帳號或密碼錯誤');
    }
    const saltPwd = user.password;
    const pwdIsMatch = await decodePassword(pwd, saltPwd);
    if (!pwdIsMatch) {
      throw new BadRequestException('帳號或密碼錯誤');
    }
    // 製作JWT
    const { accessToken, refreshToken, expireDate } = await this.generateTokens(
      user.sub,
      user.name,
    );
    const userInfoDto = {
      userId: user.id,
      userName: user.name,
      sub: user.sub,
      email: user.email,
    };
    await Promise.all([
      this.userService.setUserInfo(userInfoDto),
      this.tokensService.saveRefreshToken(
        user.id,
        user.sub,
        user.name,
        refreshToken,
        expireDate,
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
  // 創建 Token
  async generateTokens(
    sub: string,
    username: string,
  ): Promise<Tokens & { expireDate: Date }> {
    const payload = { sub, username };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = uuidv4();
    const expireEnv = this.configService.getOrThrow('REFRESH_TOKEN_EXPIRE', {
      infer: true,
    });
    const expireDate = getRefreshTokenExpiresAt(expireEnv);
    return {
      accessToken,
      refreshToken,
      expireDate,
    };
  }
  // 登出
  async logout(userId: string, refreshToken: string) {
    if (refreshToken) {
      await this.tokensService.deleteRefreshToken(userId, refreshToken);
    }
  }
}
