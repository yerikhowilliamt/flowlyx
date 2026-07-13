import { UseInterceptors, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';
import { PaginatedResponse } from '../dto/paginated-response.dto';

interface ClassConstructor {
  new (...args: unknown[]): object;
}

export function Serialize(dto: ClassConstructor | [ClassConstructor]) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: ClassConstructor | [ClassConstructor]) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<unknown> {
    return handler.handle().pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map((data: any) => {
        const dto = this.dto;
        const dtoClass = Array.isArray(dto) ? dto[0] : dto;

        if (data instanceof PaginatedResponse || (data && data.meta && Array.isArray(data.data))) {
          const serializedData = plainToInstance(dtoClass, data.data, {
            excludeExtraneousValues: true,
          });
          return {
            data: serializedData,
            meta: data.meta,
          };
        }

        return plainToInstance(dtoClass, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
