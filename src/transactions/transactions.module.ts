import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { UserModule } from '@/user/user.module';
import { AuthModule } from '@/auth/auth.module';
import { TokensModule } from '@/tokens/tokens.module';

@Module({
  imports: [AuthModule, UserModule, TokensModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
