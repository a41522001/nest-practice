import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@/generated/prisma/client';
import {
  CreateCategoryDto,
  CategoryResponseDto,
  UpdateCategoryDto,
} from './categories.dto';

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
  async addCategory(createCategoryDto: CreateCategoryDto, userId: string) {
    try {
      const category = await this.prismaService.category.create({
        data: {
          name: createCategoryDto.name,
          userId,
          type: createCategoryDto.type,
        },
      });
      const { userId: user, ...rest } = category;
      return {
        isDefault: false,
        ...rest,
      };
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('分類名稱已存在');
      }
      throw error;
    }
  }
  async deleteCategory(categoryId: string, userId: string) {
    const category = await this.prismaService.category.findUnique({
      where: {
        id: categoryId,
      },
    });
    if (!category) {
      throw new BadRequestException('分類不存在');
    }
    if (category.userId === null) {
      throw new BadRequestException('無法刪除系統預設分類');
    }
    if (category.userId !== userId) {
      throw new BadRequestException('無權刪除此分類');
    }
    if (category.deletedAt !== null) {
      throw new BadRequestException('分類已刪除');
    }
    await this.prismaService.category.update({
      where: {
        id: categoryId,
        userId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
  async updateCategory(updateCategoryDto: UpdateCategoryDto, userId: string) {
    const { categoryId, name } = updateCategoryDto;
    const category = await this.prismaService.category.findUnique({
      where: {
        id: categoryId,
      },
    });
    if (!category) {
      throw new BadRequestException('分類不存在');
    }
    if (category.userId === null) {
      throw new BadRequestException('無法修改系統預設分類');
    }
    if (category.userId !== userId) {
      throw new BadRequestException('無權修改此分類');
    }
    if (category.deletedAt !== null) {
      throw new BadRequestException('無法修改已刪除的分類');
    }
    await this.prismaService.category.update({
      where: {
        id: categoryId,
        userId,
      },
      data: {
        name,
      },
    });
  }
}
