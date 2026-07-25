import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WORKSPACE_ROLES_KEY } from '../decorators/workspace-roles.decorator';
import { WorkspaceRole } from '../enums/workspace-role.enum';
import { User, prisma } from '@flowlyx/database';

@Injectable()
export class WorkspaceRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<WorkspaceRole[]>(WORKSPACE_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied: User is unauthenticated.');
    }

    // 1. System Superadmin override
    if (user.role === 'ADMIN') {
      return true;
    }

    // Attempt to extract workspaceId from params, query, or body (supports camelCase & snake_case)
    const workspaceId =
      request.params.workspaceId ||
      request.query.workspaceId ||
      request.body?.workspaceId ||
      request.params.workspace_id ||
      request.query.workspace_id ||
      request.body?.workspace_id ||
      request.params.id;

    if (!workspaceId) {
      throw new ForbiddenException(
        'Access denied: You do not have the required role in this workspace to perform this action.',
      );
    }

    // 2. Direct Workspace Member check
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspaceId as string,
          userId: user.id,
        },
      },
    });

    if (member && requiredRoles.includes(member.role as WorkspaceRole)) {
      return true;
    }

    // 3. Hierarchical Fallback: Check parent Organization Owner or Admin
    if (prisma.workspace?.findUnique) {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId as string },
        select: { organizationId: true },
      });

      if (workspace) {
        const orgMember = await prisma.organizationMember.findFirst({
          where: {
            organizationId: workspace.organizationId,
            userId: user.id,
            status: 'ACTIVE',
          },
        });

        if (orgMember && (orgMember.role === 'OWNER' || orgMember.role === 'ADMIN')) {
          return true;
        }
      }
    }

    throw new ForbiddenException(
      'Access denied: You do not have the required role in this workspace to perform this action.',
    );
  }
}
