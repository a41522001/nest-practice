import { Injectable, BadRequestException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Transaction } from '@/generated/prisma/client';
import {
  SummaryStatisticsResponseDto,
  QuerySummaryStatisticsDto,
  SummaryStatisticsResultDto,
} from './statistics.dto';

@Injectable()
export class StatisticsService {
  constructor(private readonly prismaService: PrismaService) {}
  async getSummaryStatistics(
    query: QuerySummaryStatisticsDto,
    userId: string,
  ): Promise<SummaryStatisticsResponseDto> {
    const { year, month } = query;
    const startDate = DateTime.fromObject({ year, month: month ?? 1 })
      .toUTC()
      .toJSDate();
    const endDate = month
      ? DateTime.fromObject({ year, month })
          .plus({ months: 1 })
          .toUTC()
          .toJSDate()
      : DateTime.fromObject({ year: year + 1 })
          .toUTC()
          .toJSDate();

    const result = await this.prismaService.$queryRaw<
      SummaryStatisticsResultDto[]
    >`
      SELECT
        t."type",
        c."name" AS "categoryName",
        SUM(t."amount") AS "total"
      FROM "Transaction" t
      INNER JOIN "Category" c ON c.id = t."categoryId"
      WHERE
        t."userId" = ${userId}
        AND t."createdAt" >= ${startDate}
        AND t."createdAt" < ${endDate}
      GROUP BY t."type", c."name"
      ORDER BY t."type", "total" DESC
    `;

    const formatted: SummaryStatisticsResponseDto = {
      income: { total: 0, items: [] },
      expense: { total: 0, items: [] },
    };
    result.forEach((item) => {
      formatted[item.type].total += Number(item.total);
    });

    result.forEach((item) => {
      const amount = Number(item.total);
      const groupTotal = formatted[item.type].total;
      formatted[item.type].items.push({
        categoryName: item.categoryName,
        amount,
        percentage:
          groupTotal > 0 ? Number(((amount / groupTotal) * 100).toFixed(2)) : 0,
      });
    });
    return formatted;
  }
}
