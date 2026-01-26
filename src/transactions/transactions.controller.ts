import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@/auth/auth.guard';
import { CreateTransactionDto, QueryTransactionDto } from './transactions.dto';
import type { CustomRequest } from '@/common/types';
import { TransactionsService } from './transactions.service';
import { Transaction } from '@/generated/prisma/client';
import { ApiOperation } from '@nestjs/swagger';

@Controller('api/transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}
  // 新增收支明細
  @ApiOperation({ summary: '新增收支明細' })
  @Post()
  @HttpCode(HttpStatus.OK)
  async addTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req: CustomRequest,
  ): Promise<Transaction> {
    const userId = req.user.id;
    const transaction = await this.transactionsService.addTransaction(
      createTransactionDto,
      userId,
    );
    return transaction;
  }

  // 取得收支明細
  @Get()
  @ApiOperation({ summary: '取得收支明細' })
  @HttpCode(HttpStatus.OK)
  async getTransactions(
    @Request() req: CustomRequest,
    @Query() query: QueryTransactionDto,
  ): Promise<Transaction[]> {
    const userId = req.user.id;
    const transactions = await this.transactionsService.getTransactions(
      userId,
      req.timezone,
      query,
    );
    return transactions;
  }

  // 刪除收支明細
  @ApiOperation({ summary: '刪除收支明細' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteTransaction(
    @Param('id') transactionId: string,
    @Request() req: CustomRequest,
  ) {
    const userId = req.user.id;
    await this.transactionsService.deleteTransaction(transactionId, userId);
  }
}
