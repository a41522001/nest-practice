import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, Matches } from 'class-validator';
import { TransactionType } from '@/generated/prisma/client';

export class QueryExportTransactionDto {
  @ApiPropertyOptional({
    description: '收支類型',
    enum: TransactionType,
    example: 'expense',
  })
  @IsOptional()
  @IsEnum(TransactionType, {
    message: '類型應為收入(income)或支出(expense)',
  })
  type?: TransactionType;

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
  startDate?: string;

  @ApiPropertyOptional({
    description: '結束日期',
    example: '2026-01-31',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate 格式應為 YYYY-MM-DD' })
  endDate?: string;
}
