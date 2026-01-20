import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@/common/configs/env.config';
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  constructor(private readonly configService: ConfigService<EnvConfig>) {}
  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST', { infer: true }),
      port: this.configService.get('REDIS_PORT', { infer: true }),
      password: this.configService.get('REDIS_PASSWORD', { infer: true }),
    });
  }
  onModuleDestroy() {
    this.client.disconnect();
  }

  // 取得 Redis 客戶端實例
  getClient(): Redis {
    return this.client;
  }
}
