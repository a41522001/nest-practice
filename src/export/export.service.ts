import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import ExcelJs from 'exceljs';
import { QueryExportTransactionDto } from './export.dto';
import { Prisma, TransactionType } from '@/generated/prisma/client';
import { DateTime } from 'luxon';
import { Decimal } from '@prisma/client/runtime/wasm-compiler-edge';

@Injectable()
export class ExportService {
  constructor(private readonly prismaService: PrismaService) {}

  async getExportTransactions(
    userId: string,
    timezone: string,
    query: QueryExportTransactionDto,
  ): Promise<Buffer> {
    const where: Prisma.TransactionWhereInput = { userId };
    if (query.type) {
      where.type = query.type;
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        const startUtc = DateTime.fromISO(query.startDate, { zone: timezone })
          .startOf('day')
          .toUTC()
          .toJSDate();
        where.createdAt.gte = startUtc;
      }
      if (query.endDate) {
        const endUtc = DateTime.fromISO(query.endDate, { zone: timezone })
          .endOf('day')
          .toUTC()
          .toJSDate();
        where.createdAt.lte = endUtc;
      }
    }
    const transactions = await this.prismaService.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        note: true,
        type: true,
        createdAt: true,
        category: {
          select: { name: true },
        },
      },
    });
    const workbook = this.generateExcel(transactions, timezone);
    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
  // 生成excel
  private generateExcel(
    transactions: {
      id: string;
      amount: Decimal;
      note: string | null;
      type: TransactionType;
      createdAt: Date;
      category: {
        name: string;
      };
    }[],
    timezone: string,
  ): ExcelJs.Workbook {
    // 建立 Excel
    const workbook = new ExcelJs.Workbook();
    const sheet = workbook.addWorksheet('交易明細');

    // 設定欄位
    sheet.columns = [
      { header: '日期', key: 'date', width: 12 },
      { header: '類型', key: 'type', width: 8 },
      { header: '類別', key: 'category', width: 12 },
      { header: '金額', key: 'amount', width: 12 },
      { header: '備註', key: 'note', width: 20 },
    ];

    // 設定標題列樣式
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // 統計變數
    let totalIncome = 0;
    let totalExpense = 0;

    // 填入資料
    transactions.forEach((tx) => {
      const amount = Number(tx.amount);
      if (tx.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
      }

      const row = sheet.addRow({
        date: DateTime.fromJSDate(tx.createdAt)
          .setZone(timezone)
          .toFormat('yyyy-MM-dd'),
        type: tx.type === 'income' ? '收入' : '支出',
        category: tx.category.name,
        amount: amount,
        note: tx.note || '',
      });

      // 金額欄位靠右對齊
      row.getCell('amount').alignment = { horizontal: 'right' };
      row.getCell('amount').numFmt = '#,##0';

      // 根據類型設定顏色
      if (tx.type === 'income') {
        row.getCell('type').font = { color: { argb: 'FF008000' } };
        row.getCell('amount').font = { color: { argb: 'FF008000' } };
      } else {
        row.getCell('type').font = { color: { argb: 'FFFF0000' } };
        row.getCell('amount').font = { color: { argb: 'FFFF0000' } };
      }
    });

    // 加入空行
    sheet.addRow({});

    // 加入統計列
    const summaryStartRow = sheet.rowCount + 1;

    const incomeRow = sheet.addRow({
      date: '',
      type: '',
      category: '收入合計',
      amount: totalIncome,
      note: '',
    });
    incomeRow.getCell('category').font = { bold: true };
    incomeRow.getCell('amount').font = {
      bold: true,
      color: { argb: 'FF008000' },
    };
    incomeRow.getCell('amount').alignment = { horizontal: 'right' };
    incomeRow.getCell('amount').numFmt = '#,##0';

    const expenseRow = sheet.addRow({
      date: '',
      type: '',
      category: '支出合計',
      amount: totalExpense,
      note: '',
    });
    expenseRow.getCell('category').font = { bold: true };
    expenseRow.getCell('amount').font = {
      bold: true,
      color: { argb: 'FFFF0000' },
    };
    expenseRow.getCell('amount').alignment = { horizontal: 'right' };
    expenseRow.getCell('amount').numFmt = '#,##0';

    const netRow = sheet.addRow({
      date: '',
      type: '',
      category: '淨額',
      amount: totalIncome - totalExpense,
      note: '',
    });
    netRow.getCell('category').font = { bold: true };
    netRow.getCell('amount').font = { bold: true };
    netRow.getCell('amount').alignment = { horizontal: 'right' };
    netRow.getCell('amount').numFmt = '#,##0';

    // 統計區域加邊框
    for (let i = summaryStartRow; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      row.getCell('category').border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      row.getCell('amount').border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
    return workbook;
  }
  // 生成檔名
  generateFileName(query: QueryExportTransactionDto): string {
    const parts = ['交易明細'];
    if (query.startDate) {
      parts.push(query.startDate);
    }
    if (query.endDate) {
      parts.push(query.endDate);
    }
    return parts.join('_') + '.xlsx';
  }
}
