import { AuthGuard } from '@/auth/auth.guard';
import {
  Controller,
  Get,
  UseGuards,
  StreamableFile,
  Query,
  Request,
} from '@nestjs/common';
import { ExportService } from './export.service';
import { QueryExportTransactionDto } from './export.dto';
import type { CustomRequest } from '@/common/types';
import { ApiOperation } from '@nestjs/swagger';

@Controller('api/export')
@UseGuards(AuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('excel')
  @ApiOperation({ summary: '匯出交易明細 Excel' })
  async getExportTransactions(
    @Query() query: QueryExportTransactionDto,
    @Request() req: CustomRequest,
  ): Promise<StreamableFile> {
    const userId = req.user.id;
    const timezone = req.timezone;

    const buffer = await this.exportService.getExportTransactions(
      userId,
      timezone,
      query,
    );

    const fileName = this.exportService.generateFileName(query);
    const encodedFileName = encodeURIComponent(fileName);

    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="transactions.xlsx"; filename*=UTF-8''${encodedFileName}`,
    });
  }
}
