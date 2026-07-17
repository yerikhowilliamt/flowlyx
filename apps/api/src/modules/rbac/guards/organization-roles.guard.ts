import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ORGANIZATION_ROLES_KEY } from '../decorators/organization-roles.decorator';
import { OrganizationRole } from '../enums/organization-role.enum';
import { User, prisma } from '@flowlyx/database';

@Injectable()
export class OrganizationRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<OrganizationRole[]>(
      ORGANIZATION_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    // Attempt to extract organizationId from params or query
    const organizationId =
      request.params.organizationId ||
      request.params.id ||
      request.query.organizationId ||
      request.body.organizationId;

    if (!user || !organizationId) {
      throw new ForbiddenException(
        'Access denied: You do not have the required role in this organization to perform this action.',
      );
    }

    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: organizationId as string,
          userId: user.id,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('User is not a member of this organization');
    }

    if (!requiredRoles.includes(member.role as OrganizationRole)) {
      throw new ForbiddenException(
        'Access denied: You do not have the required role in this organization to perform this action.',
      );
    }
    return true;
  }
}
