import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsNotEmpty } from 'class-validator';

class CreateCategoryDto {
  @ApiProperty({
    description: '類別名',
    example: '餐飲',
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  name: string;
}

class CategoryResponseDto {
  id: string;
  name: string;
  deletedAt: Date | null;
  isDefault: boolean;
}

export { CreateCategoryDto, CategoryResponseDto };
