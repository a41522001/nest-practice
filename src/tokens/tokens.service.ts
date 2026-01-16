import { Injectable } from '@nestjs/common';
import { Token, User } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { EnvConfig } from '../common/configs/env.config';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class TokensService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {}
  // 新增token
  async addRefreshToken(userId: string, refreshToken: string, expiredAt: Date) {
    await this.prismaService.token.create({
      data: {
        userId,
        refreshToken,
        expiredAt,
      },
    });
  }
  // 取得token(用userId)
  async findTokensByUserId(userId: string): Promise<Token[]> {
    const tokens = await this.prismaService.token.findMany({
      where: {
        userId,
      },
      orderBy: { createdAt: 'asc' },
    });
    return tokens;
  }
  // 取得token(用refreshToken)
  async findTokenByValue(
    refreshToken: string,
  ): Promise<({ user: User } & Token) | null> {
    const now = new Date();
    const token = await this.prismaService.token.findFirst({
      where: {
        OR: [
          { refreshToken: refreshToken, expiredAt: { gt: now } },
          { oldRefreshToken: refreshToken, oldExpiredAt: { gt: now } },
        ],
      },
      include: {
        user: true,
      },
    });
    return token;
  }
  // 更新token
  async updateRefreshToken(
    oldToken: Token,
    newToken: string,
    expireDate: Date,
  ) {
    await this.prismaService.token.update({
      data: {
        refreshToken: newToken,
        expiredAt: expireDate,
        createdAt: new Date(),
        oldRefreshToken: null,
        oldExpiredAt: null,
      },
      where: {
        id: oldToken.id,
      },
    });
  }
  // 儲存token
  async saveRefreshToken(
    userId: string,
    refreshToken: string,
    expireDate: Date,
  ) {
    const userTokens = await this.findTokensByUserId(userId);
    const limit = this.configService.getOrThrow('REFRESH_COUNT_LIMIT', {
      infer: true,
    });
    if (userTokens.length >= limit) {
      // 更新refresh token
      await this.updateRefreshToken(userTokens[0], refreshToken, expireDate);
    } else {
      // 寫入refresh token
      await this.addRefreshToken(userId, refreshToken, expireDate);
    }
  }
  // 刷新token
  async rotateRefreshToken(
    tokenId: string,
    oldRefreshToken: string,
    newRefreshToken: string,
    oldExpiredAt: Date,
    newExpiredAt: Date,
  ) {
    await this.prismaService.token.update({
      data: {
        refreshToken: newRefreshToken,
        oldRefreshToken: oldRefreshToken,
        oldExpiredAt,
        expiredAt: newExpiredAt,
        createdAt: new Date(),
      },
      where: {
        id: tokenId,
      },
    });
  }
}
