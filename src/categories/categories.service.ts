import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Category } from '@/generated/prisma/client';
import { CreateCategoryDto } from './categories.dto';
@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}
  async getCategories(): Promise<Category[]> {
    const categories = await this.prismaService.category.findMany();
    return categories;
  }
  async addCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = await this.prismaService.category.create({
      data: {
        name: createCategoryDto.name,
      },
    });
    return category;
  }
}
