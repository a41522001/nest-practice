import type { CustomRequest } from '@/common/types';
import { Controller, Get, Query, Request } from '@nestjs/common';
import { QuerySummaryStatisticsDto } from './statistics.dto';
import { ApiOperation } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
@Controller('api/statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}
  @ApiOperation({ summary: '統計總結' })
  @Get('summary')
  async getSummaryStatistics(
    @Query() query: QuerySummaryStatisticsDto,
    @Request() req: CustomRequest,
  ) {
    await this.statisticsService.getSummaryStatistics(query, req.user.id);
  }
}
