import { UseInterceptors, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

interface ClassConstructor {
  new (...args: unknown[]): object;
}

export function Serialize(dto: ClassConstructor | [ClassConstructor]) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: unknown) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<unknown> {
    return handler.handle().pipe(
      map((data: unknown) => {
        const isArray = Array.isArray(this.dto);
        const dtoClass = isArray ? this.dto[0] : this.dto;

        return plainToInstance(dtoClass, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
