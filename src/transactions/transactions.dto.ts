import { ApiProperty, PartialType } from '@nestjs/swagger';
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
} from 'class-validator';
import { TransactionType } from '@/generated/prisma/client';
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

  @ApiProperty({
    description: '備註',
    example: 'notenote',
  })
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
  @IsOptional()
  @IsEnum(TransactionType, {
    message: '類型應為收入(income)或支出(expense)',
  })
  type?: TransactionType; // 'income' | 'expense'

  @IsOptional()
  @IsUUID(undefined, {
    message: '類別格式錯誤',
  })
  categoryId?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate 格式應為 YYYY-MM-DD' })
  startDate?: string; // '2026-01-01'

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate 格式應為 YYYY-MM-DD' })
  endDate?: string; // '2026-01-01'
}

class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}

export { CreateTransactionDto, QueryTransactionDto, UpdateTransactionDto };
