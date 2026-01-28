import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from '@/generated/prisma/client';
import {
  CreateCategoryDto,
  CategoryResponseDto,
  UpdateCategoryDto,
} from './categories.dto';
import { AuthGuard } from '@/auth/auth.guard';
import type { CustomRequest } from '@/common/types';
import { ApiOperation } from '@nestjs/swagger';

@Controller('api/categories')
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  // 取得類別
  @ApiOperation({ summary: '取得類別' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getCategories(
    @Request() req: CustomRequest,
  ): Promise<CategoryResponseDto[]> {
    return await this.categoriesService.getCategories(req.user.id);
  }
  // 新增類別
  @ApiOperation({ summary: '新增類別' })
  @Post()
  @HttpCode(HttpStatus.OK)
  async addCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() req: CustomRequest,
  ) {
    await this.categoriesService.addCategory(createCategoryDto, req.user.id);
  }
  // 刪除類別
  @ApiOperation({ summary: '刪除類別' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteCategory(
    @Param('id') categoryId: string,
    @Request() req: CustomRequest,
  ) {
    await this.categoriesService.deleteCategory(categoryId, req.user.id);
  }
  // 更新類別
  @ApiOperation({ summary: '更新類別' })
  @Patch()
  @HttpCode(HttpStatus.OK)
  async updateCategory(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req: CustomRequest,
  ) {
    await this.categoriesService.updateCategory(updateCategoryDto, req.user.id);
  }
}
