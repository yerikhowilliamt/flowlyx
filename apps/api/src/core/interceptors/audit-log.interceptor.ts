import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { prisma } from '@flowlyx/database';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { user?: { id?: string } }>();

    if (!req || !['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
      return next.handle();
    }

    const url = req.originalUrl || req.url || '';
    const parts = url.split('?')[0].split('/').filter(Boolean);
    const resourceType = parts[1] || parts[0] || 'System';

    // ponytail: only log security, admin, & critical domain mutations
    const CRITICAL_RESOURCES = new Set([
      'auth',
      'users',
      'organizations',
      'workspaces',
      'projects',
      'project-members',
      'rbac',
      'system-configuration',
      'settings',
      'organization-billing',
    ]);

    if (!CRITICAL_RESOURCES.has(resourceType)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        const userId = req.user?.id;
        const resourceId = parts[2] || undefined;
        let action = req.method;

        if (req.method === 'POST') action = `CREATE_${resourceType.toUpperCase()}`;
        if (req.method === 'PATCH' || req.method === 'PUT') action = `UPDATE_${resourceType.toUpperCase()}`;
        if (req.method === 'DELETE') action = `DELETE_${resourceType.toUpperCase()}`;

        // ponytail: async fire-and-forget insert so we never slow down API response
        void prisma.auditLog
          .create({
            data: {
              userId: userId || undefined,
              action,
              resourceType,
              resourceId,
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'] || undefined,
            },
          })
          .catch(() => undefined);
      }),
    );
  }
}
