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
  constructor(private dto: ClassConstructor | [ClassConstructor]) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<unknown> {
    return handler.handle().pipe(
      map((data: unknown) => {
        const dto = this.dto;
        const dtoClass = Array.isArray(dto) ? dto[0] : dto;

        return plainToInstance(dtoClass, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
