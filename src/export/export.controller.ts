import { AuthGuard } from '@/auth/auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ExportService } from './export.service';

@Controller('api/export')
@UseGuards(AuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}
  @Get('excel')
  async getExportExcel() {}
}
