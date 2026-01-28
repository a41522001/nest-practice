import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportService {
  constructor(private readonly prismaService: PrismaService) {}
  async getExportExcel() {}
}
