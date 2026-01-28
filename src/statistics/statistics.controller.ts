import type { CustomRequest } from '@/common/types';
import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import {
  QuerySummaryStatisticsDto,
  SummaryStatisticsResponseDto,
} from './statistics.dto';
import { ApiOperation } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { AuthGuard } from '@/auth/auth.guard';
@Controller('api/statistics')
@UseGuards(AuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}
  @ApiOperation({ summary: '統計總結' })
  @Get('summary')
  async getSummaryStatistics(
    @Query() query: QuerySummaryStatisticsDto,
    @Request() req: CustomRequest,
  ): Promise<SummaryStatisticsResponseDto> {
    return await this.statisticsService.getSummaryStatistics(
      query,
      req.user.id,
    );
  }
}
