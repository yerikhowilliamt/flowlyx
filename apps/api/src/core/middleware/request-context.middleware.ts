import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';

export const requestContext = new AsyncLocalStorage<Map<string, unknown>>();

export function RequestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const store = new Map<string, unknown>();
  requestContext.run(store, () => {
    next();
  });
}
