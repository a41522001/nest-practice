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
class QuerySummaryStatisticsDto {
  year: number;
  month?: number;
}

export { QuerySummaryStatisticsDto };
