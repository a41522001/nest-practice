import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { User } from '@/generated/prisma/client';
import { UserInfoDto } from './user.dto';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@/common/configs/env.config';
import { RedisService } from '@/redis/redis.service';
import { userSubKey } from '@/redis/keys';
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {}
  // 取得 Redis 客戶端實例
  private get redis() {
    return this.redisService.getClient();
  }
  // 找尋User(email)
  async findUser(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
  // 創建User
  async createUser(name: string, email: string, pwd: string): Promise<User> {
    return await this.prisma.user.create({
      data: { name: name, email: email, password: pwd },
    });
  }
  // 取得UserID
  async getUserId(username: string, sub: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        sub,
      },
    });
    if (user && user.name === username) {
      return user.id;
    }
    return user?.id ?? null;
  }
  // 儲存userInfo
  async setUserInfo(userInfo: UserInfoDto) {
    const expireEnv = this.configService.getOrThrow('ACCESS_TOKEN_EXPIRE', {
      infer: true,
    });
    const { userId, username, sub, email } = userInfo;
    const redisExpire = parseInt(expireEnv.split('m')[0]) * 60 + 5;
    const pipeline = this.redis.pipeline();
    pipeline.hset(userSubKey(sub), {
      userId,
      username,
      email,
    });
    pipeline.expire(userSubKey(sub), redisExpire);
    await pipeline.exec();
  }
}
