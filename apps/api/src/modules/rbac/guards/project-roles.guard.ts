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

    // Attempt to extract projectId from params, query, or body
    let projectId = request.params.projectId || request.query.projectId || request.body.projectId;

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

    if (!user || !projectId) {
      throw new ForbiddenException(
        'Access denied: You do not have the required role in this project to perform this action.',
      );
    }

    const member = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId as string,
        userId: user.id,
        status: 'ACTIVE',
      },
    });

    if (!member) {
      throw new ForbiddenException('User is not a member of this project');
    }

    if (!requiredRoles.includes(member.role as ProjectRole)) {
      throw new ForbiddenException(
        'Access denied: You do not have the required role in this project to perform this action.',
      );
    }
    return true;
  }
}
