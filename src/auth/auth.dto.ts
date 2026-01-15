import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MaxLength,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({
    description: '使用者的真實姓名',
    example: '小明',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  name: string;

  @ApiProperty({
    description: '使用者的電子郵件',
    example: 'xiaoming@example.com',
    maxLength: 50,
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(50)
  email: string;

  @ApiProperty({
    description: '登入密碼',
    example: 'StrongPassword123',
    minLength: 6,
    maxLength: 30,
    writeOnly: true, // 在 Swagger 文件中標註此欄位僅供寫入（回傳時不應顯示）
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(30)
  pwd: string;
}

export class LoginDto {
  @ApiProperty({
    description: '使用者的電子郵件',
    example: 'xiaoming@example.com',
    maxLength: 50,
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(50)
  email: string;

  @ApiProperty({
    description: '登入密碼',
    example: 'StrongPassword123',
    minLength: 6,
    maxLength: 30,
    writeOnly: true, // 在 Swagger 文件中標註此欄位僅供寫入（回傳時不應顯示）
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(30)
  pwd: string;
}
