import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { User } from '@/generated/prisma/client';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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
  async getUserId(userName: string, sub: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        sub,
      },
    });
    if (user && user.name === userName) {
      return user.id;
    }
    return user?.id ?? null;
  }
}
