import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import type { Response } from 'express';
import { ErrorResponse, RequestWithUser } from '../types';
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithUser>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const logMessage = `[${request.method}] ${request.url} - ${status}`;
    // 500印出stack
    if (status >= 500) {
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : '',
      );
    } else {
      this.logger.warn(logMessage);
    }
    const errorResponse: ErrorResponse = {
      code: status,
      data: null,
      message: '請求失敗',
      time: new Date().toISOString(),
    };
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const resObj = res as {
          message?: string;
          errors?: Record<string, string[]>;
        };

        if (resObj.errors) {
          errorResponse.message = resObj.message || '驗證失敗';
          errorResponse.errors = resObj.errors;
        } else {
          errorResponse.message = this.extractMessage(res);
        }
      } else if (typeof res === 'string') {
        errorResponse.message = res;
      }
    } else {
      errorResponse.message = '伺服器內部錯誤';
    }
    response.status(status).json(errorResponse);
  }
  private extractMessage(response: object): string {
    const res = response as { message?: string | string[] };
    if (Array.isArray(res.message)) {
      return res.message[0] || '請求失敗';
    }
    if (typeof res.message === 'string') {
      return res.message;
    }
    return '請求失敗';
  }
}
