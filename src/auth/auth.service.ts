import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto, SignupDto } from './auth.dto';
import { decodePassword, saltPassword } from 'src/common/utils';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
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
  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
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
    const payload = { sub: user.sub, username: user.name };
    // 製作JWT
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
