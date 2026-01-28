import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { TimezoneMiddleware } from './common/middlewares/timezone.middleware';
import { AuthModule } from './auth/auth.module';
import { envSchema } from './common/configs/env.config';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TestModule } from './test/test.module';
import { TokensModule } from './tokens/tokens.module';
import { RedisModule } from './redis/redis.module';
import { StatisticsModule } from './statistics/statistics.module';
import { ExportModule } from './export/export.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    CategoriesModule,
    TransactionsModule,
    TestModule,
    TokensModule,
    RedisModule,
    StatisticsModule,
    ExportModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TimezoneMiddleware).forRoutes('*');
  }
}
