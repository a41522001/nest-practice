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
    example: 'example@example.com',
    maxLength: 50,
  })
  @IsEmail(undefined, {
    message: '須為正確的Email格式',
  })
  @IsNotEmpty()
  @MaxLength(50)
  email: string;

  @ApiProperty({
    description: '登入密碼',
    example: 'StrongPassword123',
    minLength: 6,
    maxLength: 30,
    writeOnly: true,
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
    example: 'example@example.com',
    maxLength: 50,
  })
  @MaxLength(50, {
    message: '電子郵件須為50個字或以下',
  })
  @IsEmail(undefined, {
    message: '須為正確的Email格式',
  })
  @IsString({ message: '電子郵件格式錯誤' })
  @IsNotEmpty({
    message: '電子郵件請勿為空',
  })
  email: string;

  @ApiProperty({
    description: '登入密碼',
    example: 'StrongPassword123',
    minLength: 6,
    maxLength: 30,
    writeOnly: true,
  })
  @MaxLength(30, {
    message: '密碼須為30個字或以下',
  })
  @MinLength(6, {
    message: '密碼須為6個字或以上',
  })
  @IsString({ message: '密碼格式錯誤' })
  @IsNotEmpty({
    message: '密碼請勿為空',
  })
  pwd: string;
}
