import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { UserModule } from '@/user/user.module';
@Module({
  imports: [UserModule],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
