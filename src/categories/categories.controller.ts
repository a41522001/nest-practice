import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from '@/generated/prisma/client';
import { CreateCategoryDto } from './categories.dto';
import { AuthGuard } from '@/auth/auth.guard';

@Controller('api/categories')
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  async GetCategories(): Promise<Category[]> {
    return await this.categoriesService.getCategories();
  }
  @Post()
  @HttpCode(HttpStatus.OK)
  async addCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return await this.categoriesService.addCategory(createCategoryDto);
  }
}
