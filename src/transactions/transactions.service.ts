import { Injectable, BadRequestException } from '@nestjs/common';
import {
  CreateTransactionDto,
  PaginatedTransactionResponseDto,
  QueryTransactionDto,
  UpdateTransactionDto,
} from './transactions.dto';
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
  ): Promise<PaginatedTransactionResponseDto> {
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
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.prismaService.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.transaction.count({
        where,
      }),
    ]);
    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteTransaction(transactionId: string, userId: string) {
    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        id: transactionId,
        userId,
      },
    });
    if (!transaction) {
      throw new BadRequestException('明細不存在');
    }
    await this.prismaService.transaction.delete({
      where: {
        id: transactionId,
        userId,
      },
    });
  }

  async updateTransaction(
    transactionId: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        id: transactionId,
        userId,
      },
    });
    if (!transaction) {
      throw new BadRequestException('明細不存在');
    }
    await this.prismaService.transaction.update({
      where: {
        id: transactionId,
        userId,
      },
      data: updateTransactionDto,
    });
  }
}
