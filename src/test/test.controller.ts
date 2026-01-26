import { Controller, Get, InternalServerErrorException } from '@nestjs/common';

@Controller('api/test')
export class TestController {
  @Get()
  test() {
    throw new InternalServerErrorException('資料庫連線失敗');
  }
}
