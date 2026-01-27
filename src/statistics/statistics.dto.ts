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
import { Decimal } from '@prisma/client/runtime/wasm-compiler-edge';
class QuerySummaryStatisticsDto {
  @IsOptional()
  @Type(() => Number)
  year: number;

  @IsOptional()
  @Type(() => Number)
  month?: number;
}
class SummaryStatisticsResultDto {
  type: TransactionType;
  categoryName: string;
  total: Decimal;
}
interface StatisticsItem {
  categoryName: string;
  amount: number;
  percentage: number;
}
interface SummaryGroup {
  total: number;
  items: StatisticsItem[];
}
class SummaryStatisticsResponseDto {
  income: SummaryGroup;
  expense: SummaryGroup;
}

export {
  QuerySummaryStatisticsDto,
  SummaryStatisticsResultDto,
  SummaryStatisticsResponseDto,
};
