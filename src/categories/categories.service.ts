import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Category } from '@/generated/prisma/client';
import { CreateCategoryDto, CategoryResponseDto } from './categories.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCategories(userId: string): Promise<CategoryResponseDto[]> {
    const categories = await this.prismaService.category.findMany({
      where: {
        deletedAt: null,
        OR: [
          { userId: null }, // 系統預設
          { userId }, // 用戶自訂
        ],
      },
    });
    return categories.map(({ userId, ...rest }) => {
      return {
        ...rest,
        isDefault: userId === null,
      };
    });
  }
  async addCategory(
    createCategoryDto: CreateCategoryDto,
    userId: string,
  ): Promise<CategoryResponseDto> {
    const category = await this.prismaService.category.create({
      data: {
        name: createCategoryDto.name,
        userId,
      },
    });
    const { userId: user, ...rest } = category;
    return {
      isDefault: false,
      ...rest,
    };
  }
}
