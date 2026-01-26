import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from '@/generated/prisma/client';
import { CreateCategoryDto, CategoryResponseDto } from './categories.dto';
import { AuthGuard } from '@/auth/auth.guard';
import type { CustomRequest } from '@/common/types';

@Controller('api/categories')
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getCategories(
    @Request() req: CustomRequest,
  ): Promise<CategoryResponseDto[]> {
    return await this.categoriesService.getCategories(req.user.id);
  }
  @Post()
  @HttpCode(HttpStatus.OK)
  async addCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() req: CustomRequest,
  ): Promise<CategoryResponseDto> {
    return await this.categoriesService.addCategory(
      createCategoryDto,
      req.user.id,
    );
  }
}
