import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Response } from '@/common/types';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T | null>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T | null>> {
    const response = context.switchToHttp().getResponse<ExpressResponse>();
    const statusCode = response.statusCode;
    return next.handle().pipe(
      map((data: T | null) => {
        return {
          code: statusCode,
          data: data ?? null,
          message: '請求成功',
          time: new Date().toISOString(),
        };
      }),
    );
  }
}
