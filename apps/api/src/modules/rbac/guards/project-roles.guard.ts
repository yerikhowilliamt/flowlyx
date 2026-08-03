import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PROJECT_ROLES_KEY } from '../decorators/project-roles.decorator';
import { ProjectRole } from '../enums/project-role.enum';
import { User, prisma } from '@flowlyx/database';

@Injectable()
export class ProjectRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ProjectRole[]>(PROJECT_ROLES_KEY, [
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

    // Attempt to extract projectId from params, query, or body (supports camelCase & snake_case)
    let projectId =
      request.params.projectId ||
      request.query.projectId ||
      request.body?.projectId ||
      request.params.project_id ||
      request.query.project_id ||
      request.body?.project_id;

    if (!projectId && request.params.id) {
      if (request.originalUrl?.includes('/priorities/')) {
        const priority = await prisma.priority.findUnique({
          where: { id: request.params.id },
          select: { projectId: true },
        });
        if (priority) projectId = priority.projectId;
      } else if (request.originalUrl?.includes('/labels/')) {
        const label = await prisma.label.findUnique({
          where: { id: request.params.id },
          select: { projectId: true },
        });
        if (label) projectId = label.projectId;
      } else {
        // Assume the ID itself is the projectId
        projectId = request.params.id;
      }
    }

    if (!projectId) {
      throw new ForbiddenException(
        'Access denied: You do not have the required role in this project to perform this action.',
      );
    }

    // 2. Direct Project Member check
    const member = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId as string,
        userId: user.id,
        status: 'ACTIVE',
      },
    });

    if (member && requiredRoles.includes(member.role as ProjectRole)) {
      return true;
    }

    // 3. Hierarchical Fallback: Check Workspace & Organization admin permissions
    if (prisma.project?.findUnique) {
      const project = await prisma.project.findUnique({
        where: { id: projectId as string },
        select: {
          workspace: {
            select: {
              organizationId: true,
              members: {
                where: { userId: user.id, status: 'ACTIVE' },
                select: { role: true },
              },
            },
          },
        },
      });

      if (project?.workspace) {
        // Check Workspace Admin
        const wsMember = project.workspace.members[0];
        if (wsMember && wsMember.role === 'ADMIN') {
          return true;
        }

        // Check Organization Owner or Admin
        const orgMember = await prisma.organizationMember.findFirst({
          where: {
            organizationId: project.workspace.organizationId,
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
      'Access denied: You do not have the required role in this project to perform this action.',
    );
  }
}
