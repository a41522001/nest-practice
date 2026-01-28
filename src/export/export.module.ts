import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { TokensModule } from '@/tokens/tokens.module';

@Module({
  imports: [AuthModule, UserModule, TokensModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
