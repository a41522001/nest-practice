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
} from '@nestjs/common';
import { AuthGuard } from '@/auth/auth.guard';
import { CreateTransactionDto } from './transactions.dto';
import type { RequestWithUser } from '@/common/types';
import { TransactionsService } from './transactions.service';
import { Transaction } from '@/generated/prisma/client';

@Controller('api/transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async addTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req: RequestWithUser,
  ): Promise<Transaction> {
    const userId = req.user.id;
    const transaction = await this.transactionsService.addTransaction(
      createTransactionDto,
      userId,
    );
    return transaction;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getTransactions(
    @Request() req: RequestWithUser,
  ): Promise<Transaction[]> {
    const userId = req.user.id;
    const transactions = await this.transactionsService.getTransactions(userId);
    return transactions;
  }
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteTransaction(
    @Param('id') transactionId: string,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    await this.transactionsService.deleteTransaction(transactionId, userId);
  }
}
