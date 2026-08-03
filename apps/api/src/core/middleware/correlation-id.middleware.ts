import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const CORRELATION_ID_HEADER = 'X-Correlation-ID';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = req.headers[CORRELATION_ID_HEADER.toLowerCase()] || uuidv4();
    req.id = id as string; // attach to request for pino/logger
    res.setHeader(CORRELATION_ID_HEADER, id);
    next();
  }
}
