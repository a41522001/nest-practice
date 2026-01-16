import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './transactions.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Transaction } from 'src/generated/prisma/client';

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
  async getTransactions(userId: string): Promise<Transaction[]> {
    const transactions = await this.prismaService.transaction.findMany({
      where: {
        userId,
      },
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
