import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import cors from 'cors';
import { EnvConfig } from './common/configs/env.config';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/allException.filter';
import { formatValidationErrors } from './common/utils';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  const configService = app.get(ConfigService<EnvConfig>);
  const frontendUrl = configService.get('FRONT_END_URL', { infer: true });
  const port = configService.get('PORT', { infer: true }) ?? 3000;
  app.use(
    cors({
      origin: frontendUrl,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自動過濾掉不在 DTO 裡的欄位
      transform: true, // 自動根據 DTO 型別進行轉型
      forbidNonWhitelisted: true, // 傳入多餘欄位時直接報錯
      stopAtFirstError: true,
      // 自定義錯誤格式
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = formatValidationErrors(errors);
        return new BadRequestException({
          message: '驗證失敗',
          errors: formattedErrors,
        });
      },
    }),
  );
  // 建立 Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('我的 API 系統')
    .setDescription('這是學習NestJS的練習專案')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // 設定訪問路徑為 http://localhost:3000/api#
  SwaggerModule.setup('api', app, document);
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(port);
}
bootstrap();
