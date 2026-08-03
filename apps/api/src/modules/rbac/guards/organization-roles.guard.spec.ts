import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganizationRolesGuard } from './organization-roles.guard';
import { OrganizationRole } from '../enums/organization-role.enum';
import { prisma } from '@flowlyx/database';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    organizationMember: {
      findUnique: jest.fn(),
    },
  },
}));

describe('OrganizationRolesGuard', () => {
  let guard: OrganizationRolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new OrganizationRolesGuard(reflector);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no roles are required', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: {}, params: {} }),
      }),
    } as unknown as ExecutionContext;

    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user is not a member', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([OrganizationRole.ADMIN]);
    (prisma.organizationMember.findUnique as jest.Mock).mockResolvedValue(null);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { id: '1' },
          params: { organizationId: 'org1' },
          query: {},
          body: {},
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should return true if user has required organization role', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([OrganizationRole.ADMIN]);
    (prisma.organizationMember.findUnique as jest.Mock).mockResolvedValue({
      role: OrganizationRole.ADMIN,
    });

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { id: '1' },
          params: { organizationId: 'org1' },
          query: {},
          body: {},
        }),
      }),
    } as unknown as ExecutionContext;

    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user does not have required organization role', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([OrganizationRole.OWNER]);
    (prisma.organizationMember.findUnique as jest.Mock).mockResolvedValue({
      role: OrganizationRole.MEMBER,
    });

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { id: '1' },
          params: { organizationId: 'org1' },
          query: {},
          body: {},
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
