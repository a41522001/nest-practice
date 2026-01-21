import { Injectable } from '@nestjs/common';
import { EnvConfig } from '@/common/configs/env.config';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@/redis/redis.service';
import { DateTime } from 'luxon';
import { authRefreshTokenKey, authUserRefreshTokenKey } from '@/redis/keys';
import { HashAuthRefreshToken } from '@/redis/types';
import { RotateRefreshTokenDto, SaveRefreshTokenDto } from './tokens.dto';
import { UserService } from '@/user/user.service';
@Injectable()
export class TokensService {
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {}

  // 取得 Redis 客戶端實例
  private get redis() {
    return this.redisService.getClient();
  }
  // 取得token(用refreshToken)
  async findTokenByValue(
    refreshToken: string,
  ): Promise<HashAuthRefreshToken | null> {
    const key = authRefreshTokenKey(refreshToken);
    const token: Record<keyof HashAuthRefreshToken, string> =
      await this.redis.hgetall(key);
    if (!token || Object.keys(token).length === 0) {
      return null;
    }
    const expireTimestamp = Number(token.expire);
    const now = DateTime.utc().toMillis();
    if (now > expireTimestamp) {
      // 主動刪除這個已過期但可能還殘留在 Redis 的 Key
      await this.redis.del(key);
      return null;
    }
    return {
      ...token,
      expire: expireTimestamp,
      isOld: token.isOld === '1',
    };
  }
  // 儲存token
  async saveRefreshToken(saveRefreshTokenDto: SaveRefreshTokenDto) {
    const maxDevices = this.configService.getOrThrow('MAX_DEVICES', {
      infer: true,
    });
    const refreshTokenCookieExpire = this.configService.getOrThrow(
      'REFRESH_TOKEN_COOKIE_EXPIRE',
      {
        infer: true,
      },
    );
    const { userId, sub, username, refreshToken, expireDate, email } =
      saveRefreshTokenDto;
    const score = expireDate.getTime();
    const tokenKey = authRefreshTokenKey(refreshToken);
    const userZSetKey = authUserRefreshTokenKey(userId);
    // refreshTokenCookieExpire = 毫秒計算 所以算秒數需 / 1000
    const hashExpire = refreshTokenCookieExpire / 1000;
    const multi = this.redis.multi();
    const nowTimestamp = DateTime.utc().toMillis();
    // 寫redis
    multi.hset(tokenKey, {
      userId,
      expire: expireDate.getTime().toString(),
      sub,
      name: username,
      isOld: 0,
      email,
    });
    multi.expire(tokenKey, hashExpire);
    multi.zadd(userZSetKey, score, refreshToken);
    multi.zremrangebyscore(userZSetKey, '-inf', nowTimestamp);
    multi.zcard(userZSetKey);
    const results = await multi.exec();
    const currentDeviceCount = results![4][1] as number;
    // 計算裝置不許超過 maxDevices
    if (currentDeviceCount > maxDevices) {
      const oldTokens = await this.redis.zrange(
        userZSetKey,
        0,
        currentDeviceCount - maxDevices - 1,
      );
      if (oldTokens.length > 0) {
        const deleteMulti = this.redis.multi();
        for (const oldToken of oldTokens) {
          deleteMulti.del(authRefreshTokenKey(oldToken)); // 刪除舊的 Hash
        }
        deleteMulti.zremrangebyrank(
          userZSetKey,
          0,
          currentDeviceCount - maxDevices - 1,
        ); // 從 ZSet 移除
        await deleteMulti.exec();
      }
    }
  }
  // 刷新token
  async rotateRefreshToken(data: RotateRefreshTokenDto) {
    const {
      oldRefreshToken,
      userId,
      sub,
      username,
      newRefreshToken,
      newExpireDate,
      email,
    } = data;

    const oldTokenKey = authRefreshTokenKey(oldRefreshToken);
    const userZSetKey = authUserRefreshTokenKey(userId);
    const saveRefreshTokenDto = {
      userId,
      sub,
      username,
      refreshToken: newRefreshToken,
      expireDate: newExpireDate,
      email,
    };
    const userInfo = {
      userId,
      username,
      sub,
      email,
    };
    await this.redis.zrem(userZSetKey, oldRefreshToken);
    const multi = this.redis.multi();
    multi.hset(oldTokenKey, { isOld: 1 });
    multi.expire(oldTokenKey, 15);
    await multi.exec();
    await this.saveRefreshToken(saveRefreshTokenDto);
    await this.userService.setUserInfo(userInfo);
  }
  // 刪除token資料
  async deleteRefreshToken(userId: string, refreshToken: string) {
    const multi = this.redis.multi();
    multi.zrem(authUserRefreshTokenKey(userId), refreshToken);
    multi.del(authRefreshTokenKey(refreshToken));
    await multi.exec();
  }
}
