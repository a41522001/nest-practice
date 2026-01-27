import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsInt,
  IsUUID,
  IsOptional,
  IsEnum,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { Transaction, TransactionType } from '@/generated/prisma/client';
import { Type } from 'class-transformer';

class CreateTransactionDto {
  @ApiProperty({
    description: '類型',
    example: 'income',
    maxLength: 7,
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(7)
  @MinLength(6)
  type: 'income' | 'expense';

  @ApiProperty({
    description: '金額',
    example: 500,
  })
  @IsInt()
  amount: number;

  @ApiPropertyOptional({
    description: '備註',
    example: 'notenote',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  note?: string;

  @ApiProperty({
    description: '類別ID',
    example: 'f4149739-fe97-43cd-b668-ba78e43d9d1d',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;
}

class QueryTransactionDto {
  @ApiPropertyOptional({
    description: '收支類型',
    enum: TransactionType,
    example: 'expense',
  })
  @IsOptional()
  @IsEnum(TransactionType, {
    message: '類型應為收入(income)或支出(expense)',
  })
  type?: TransactionType; // 'income' | 'expense'

  @ApiPropertyOptional({
    description: '類別ID',
    example: 'UUID',
  })
  @IsOptional()
  @IsUUID(undefined, {
    message: '類別格式錯誤',
  })
  categoryId?: string;

  @ApiPropertyOptional({
    description: '開始日期',
    example: '2026-01-01',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate 格式應為 YYYY-MM-DD' })
  startDate?: string; // '2026-01-01'

  @ApiPropertyOptional({
    description: '結束日期',
    example: '2026-01-31',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate 格式應為 YYYY-MM-DD' })
  endDate?: string; // '2026-01-01'

  @ApiPropertyOptional({
    description: '頁碼',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'page 最小為 1' })
  @IsInt({ message: 'page 必須是整數' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每頁筆數',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'limit 最小為 1' })
  @Max(100, { message: 'limit 最大為 100' })
  @IsInt({ message: 'limit 必須是整數' })
  limit?: number = 10;
}

class PaginatedTransactionResponseDto {
  data: Transaction[];
  meta: {
    total: number; // 總筆數
    page: number; // 當前頁
    limit: number; // 每頁筆數
    totalPages: number; // 總頁數
  };
}

class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}

export {
  CreateTransactionDto,
  QueryTransactionDto,
  UpdateTransactionDto,
  PaginatedTransactionResponseDto,
};
