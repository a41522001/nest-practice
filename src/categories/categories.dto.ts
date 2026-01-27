import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  IsNotEmpty,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { TransactionType } from '@/generated/prisma/client';
class CreateCategoryDto {
  @ApiProperty({
    description: '類別名',
    example: '餐飲',
    maxLength: 10,
  })
  @MaxLength(10, { message: '類別名最多10個字' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '收支類型',
    example: 'income',
    maxLength: 7,
    minLength: 6,
  })
  @IsEnum(TransactionType, {
    message: '收支類型應為收入(income)或支出(expense)',
  })
  @IsString()
  @IsNotEmpty()
  type: TransactionType;
}

class CategoryResponseDto {
  id: string;
  name: string;
  deletedAt: Date | null;
  isDefault: boolean;
}

class UpdateCategoryDto {
  @ApiProperty({
    description: '類別ID',
    example: 'UUID',
  })
  @IsUUID(undefined, {
    message: 'ID格式錯誤',
  })
  @IsNotEmpty({
    message: 'ID不可為空',
  })
  categoryId: string;

  @ApiProperty({
    description: '類別名',
    example: '餐飲',
  })
  @MaxLength(10, { message: '類別名最多10個字' })
  @IsString({
    message: '類別名格式錯誤',
  })
  @IsNotEmpty({
    message: '類別名不可為空',
  })
  name: string;
}
export { CreateCategoryDto, CategoryResponseDto, UpdateCategoryDto };
