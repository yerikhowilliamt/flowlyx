import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@flowlyx/database';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse() as Record<string, unknown>;
      errorCode = (responseBody.error as string) || errorCode;
      message = (responseBody.message as string) || exception.message;
    } else if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      errorCode = 'VALIDATION_ERROR';
      message = 'Input validation failed';
      details = exception.errors;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        errorCode = 'UNIQUE_CONSTRAINT_FAILED';
        const fields = Array.isArray(exception.meta?.target)
          ? exception.meta.target.join(', ')
          : (exception.meta?.target as string) || 'value';
        message = `A record with this ${fields} already exists.`;
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        errorCode = 'RECORD_NOT_FOUND';
        message = (exception.meta?.cause as string) || 'The requested record was not found.';
      } else if (exception.code === 'P2003') {
        status = HttpStatus.BAD_REQUEST;
        errorCode = 'FOREIGN_KEY_CONSTRAINT_FAILED';
        const field = (exception.meta?.field_name as string) || 'Related record';
        message = `${field} not found or invalid.`;
      } else {
        status = HttpStatus.BAD_REQUEST;
        errorCode = 'DATABASE_ERROR';
        message = 'A database error occurred.';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Correlation ID mapping (set via Pino)
    const correlationId = request.id;

    // Log the error
    this.logger.error(
      `[${request.method}] ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      errorCode,
      message,
      details,
      correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
