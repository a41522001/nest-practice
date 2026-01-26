import { Injectable } from '@nestjs/common';
import { CreateTransactionDto, QueryTransactionDto } from './transactions.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Transaction } from '@/generated/prisma/client';
import { DateTime } from 'luxon';

@Injectable()
export class TransactionsService {
  constructor(private readonly prismaService: PrismaService) {}
  async addTransaction(
    createTransactionDto: CreateTransactionDto,
    userId: string,
  ): Promise<Transaction> {
    const { type, amount, note, categoryId } = createTransactionDto;
    const transaction = await this.prismaService.transaction.create({
      data: {
        userId,
        type,
        amount,
        note,
        categoryId,
      },
    });
    return transaction;
  }

  async getTransactions(
    userId: string,
    timezone: string,
    query: QueryTransactionDto,
  ): Promise<Transaction[]> {
    const where: Prisma.TransactionWhereInput = {
      userId,
    };
    if (query.type) {
      where.type = query.type;
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        // 用戶本地日期的開始 (00:00:00) 轉換為 UTC
        const startUtc = DateTime.fromISO(query.startDate, { zone: timezone })
          .startOf('day')
          .toUTC()
          .toJSDate();
        where.createdAt.gte = startUtc;
      }
      if (query.endDate) {
        // 用戶本地日期的結束 (23:59:59.999) 轉換為 UTC
        const endUtc = DateTime.fromISO(query.endDate, { zone: timezone })
          .endOf('day')
          .toUTC()
          .toJSDate();
        where.createdAt.lte = endUtc;
      }
    }
    const transactions = await this.prismaService.transaction.findMany({
      where,
    });
    return transactions;
  }

  async deleteTransaction(transactionId: string, userId: string) {
    await this.prismaService.transaction.delete({
      where: {
        id: transactionId,
        userId,
      },
    });
  }
}
