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
      const responseBody = exception.getResponse() as any;
      errorCode = responseBody?.error || errorCode;
      message = responseBody?.message || exception.message;

      // Handle nestjs-zod validation errors wrapped in HttpException
      if (status === HttpStatus.BAD_REQUEST && responseBody?.message === 'Validation failed') {
        errorCode = 'VALIDATION_ERROR';
        // Extract the actual error message from Zod issues if available
        if (responseBody.errors && Array.isArray(responseBody.errors)) {
          message = responseBody.errors.map((e: any) => e.message).join(', ') || 'Input validation failed';
          details = responseBody.errors;
        }
      }
    } else if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      errorCode = 'VALIDATION_ERROR';
      message = 'Input validation failed';
      details = exception.errors;
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
