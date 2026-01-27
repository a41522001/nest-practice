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
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@/auth/auth.guard';
import {
  CreateTransactionDto,
  PaginatedTransactionResponseDto,
  QueryTransactionDto,
  UpdateTransactionDto,
} from './transactions.dto';
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
    @Query() query: QueryTransactionDto,
    @Request() req: CustomRequest,
  ): Promise<PaginatedTransactionResponseDto> {
    const userId = req.user.id;
    const result = await this.transactionsService.getTransactions(
      userId,
      req.timezone,
      query,
    );
    return result;
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

  // 更新收支明細
  @ApiOperation({ summary: '更新收支明細' })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateTransaction(
    @Param('id') transactionId: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Request() req: CustomRequest,
  ) {
    const userId = req.user.id;
    await this.transactionsService.updateTransaction(
      transactionId,
      userId,
      updateTransactionDto,
    );
  }
}
