import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '@/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EnvConfig } from '@/common/configs/env.config';
import { ConfigService } from '@nestjs/config';
import { TokensModule } from '@/tokens/tokens.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    TokensModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvConfig>) => ({
        secret: config.get('ACCESS_TOKEN_SECRET', { infer: true }),
        signOptions: {
          audience: config.get('FRONT_END_URL', { infer: true }),
          expiresIn: config.get('ACCESS_TOKEN_EXPIRE', { infer: true }),
          issuer: config.get('API_URL', { infer: true }),
          algorithm: 'HS256',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
