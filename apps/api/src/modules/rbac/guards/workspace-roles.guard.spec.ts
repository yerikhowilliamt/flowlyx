import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WorkspaceRolesGuard } from './workspace-roles.guard';
import { WorkspaceRole } from '../enums/workspace-role.enum';
import { prisma } from '@flowlyx/database';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    workspaceMember: {
      findUnique: jest.fn(),
    },
  },
}));

describe('WorkspaceRolesGuard', () => {
  let guard: WorkspaceRolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new WorkspaceRolesGuard(reflector);
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
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([WorkspaceRole.ADMIN]);
    (prisma.workspaceMember.findUnique as jest.Mock).mockResolvedValue(null);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { id: '1' },
          params: { workspaceId: 'ws1' },
          query: {},
          body: {},
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should return true if user has required workspace role', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([WorkspaceRole.ADMIN]);
    (prisma.workspaceMember.findUnique as jest.Mock).mockResolvedValue({
      role: WorkspaceRole.ADMIN,
    });

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { id: '1' },
          params: { workspaceId: 'ws1' },
          query: {},
          body: {},
        }),
      }),
    } as unknown as ExecutionContext;

    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user does not have required workspace role', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([WorkspaceRole.ADMIN]);
    (prisma.workspaceMember.findUnique as jest.Mock).mockResolvedValue({
      role: WorkspaceRole.MEMBER,
    });

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { id: '1' },
          params: { workspaceId: 'ws1' },
          query: {},
          body: {},
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
