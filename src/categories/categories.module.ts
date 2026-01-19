import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { TokensModule } from '@/tokens/tokens.module';
@Module({
  imports: [AuthModule, UserModule, TokensModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
