import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectRolesGuard } from './project-roles.guard';
import { ProjectRole } from '../enums/project-role.enum';
import { prisma } from '@flowlyx/database';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    projectMember: { findFirst: jest.fn() },
    priority: { findUnique: jest.fn() },
    label: { findUnique: jest.fn() },
  },
}));

describe('ProjectRolesGuard', () => {
  let guard: ProjectRolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new ProjectRolesGuard(reflector);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  const createMockContext = (requestOptions: any) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => requestOptions,
      }),
    } as unknown as ExecutionContext);

  it('should return true if no roles are required', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = createMockContext({});
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user is not in request', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([ProjectRole.ADMIN]);
    const context = createMockContext({
      params: { projectId: 'project1' },
      query: {},
      body: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if projectId is missing', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([ProjectRole.ADMIN]);
    const context = createMockContext({
      user: { id: 'user1' },
      params: {},
      query: {},
      body: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user is not a member of the project', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([ProjectRole.ADMIN]);
    (prisma.projectMember.findFirst as jest.Mock).mockResolvedValue(null);

    const context = createMockContext({
      user: { id: 'user1' },
      params: { projectId: 'project1' },
      query: {},
      body: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    expect(prisma.projectMember.findFirst).toHaveBeenCalledWith({
      where: { projectId: 'project1', userId: 'user1', status: 'ACTIVE' },
    });
  });

  it('should throw ForbiddenException if user role is insufficient', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([ProjectRole.ADMIN]);
    (prisma.projectMember.findFirst as jest.Mock).mockResolvedValue({ role: ProjectRole.MEMBER });

    const context = createMockContext({
      user: { id: 'user1' },
      params: { projectId: 'project1' },
      query: {},
      body: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should return true if user role is sufficient', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([ProjectRole.ADMIN]);
    (prisma.projectMember.findFirst as jest.Mock).mockResolvedValue({ role: ProjectRole.ADMIN });

    const context = createMockContext({
      user: { id: 'user1' },
      params: { projectId: 'project1' },
      query: {},
      body: {},
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should extract projectId from priorities route', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([ProjectRole.ADMIN]);
    (prisma.priority.findUnique as jest.Mock).mockResolvedValue({ projectId: 'project_from_priority' });
    (prisma.projectMember.findFirst as jest.Mock).mockResolvedValue({ role: ProjectRole.ADMIN });

    const context = createMockContext({
      user: { id: 'user1' },
      params: { id: 'priority1' },
      query: {},
      body: {},
      originalUrl: '/api/priorities/priority1',
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(prisma.priority.findUnique).toHaveBeenCalledWith({ where: { id: 'priority1' }, select: { projectId: true } });
    expect(prisma.projectMember.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ projectId: 'project_from_priority' })
    }));
  });
});
