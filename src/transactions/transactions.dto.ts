import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsInt,
  IsUUID,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    description: '類別',
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
