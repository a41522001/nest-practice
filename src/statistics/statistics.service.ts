import { Injectable, BadRequestException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Transaction } from '@/generated/prisma/client';
import { QuerySummaryStatisticsDto } from './statistics.dto';
@Injectable()
export class StatisticsService {
  constructor(private readonly prismaService: PrismaService) {}
  async getSummaryStatistics(query: QuerySummaryStatisticsDto, userId: string) {
    /*  select 
        t."type", 
        c."name" as "categoryName", 
        sum(t."amount") as "total" 
        from "Transaction" as t
        inner join "Category" as c on c.id = t."categoryId" 
        where 
          t."userId" = 'aeb16bf6-7517-4b96-ad58-3a3a997fe7d2' 
          and	t."createdAt" >=  to_timestamp('20260101', 'YYYYMMDD') 
          and	t."createdAt" < to_timestamp('20260201', 'YYYYMMDD')
        group by t."type", c."name"
        order by t."type", "total" desc; */
  }
}
