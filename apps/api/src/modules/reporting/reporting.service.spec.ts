import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReportingService } from './reporting.service';

const mockProject = {
  id: 'project-uuid-1',
  name: 'Test Project',
  members: [
    { userId: 'u1', user: { id: 'u1', name: 'User 1' } },
    { userId: 'u2', user: { id: 'u2', name: 'User 2' } },
  ],
};

const mockWorkspace = {
  id: 'ws-uuid-1',
  name: 'Test Workspace',
};

jest.mock('@flowlyx/database', () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    workspace: {
      findUnique: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
    },
    timeEntry: {
      findMany: jest.fn(),
    },
    taskAssignment: {
      findMany: jest.fn(),
    },
    activity: {
      findMany: jest.fn(),
    },
    workspaceMember: {
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from '@flowlyx/database';

describe('ReportingService', () => {
  let service: ReportingService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportingService],
    }).compile();
    service = module.get<ReportingService>(ReportingService);
  });

  describe('getProjectOverview()', () => {
    it('should calculate active, deleted, and overdue tasks', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (prisma.task.findMany as jest.Mock).mockResolvedValueOnce([
        { status: 'ACTIVE', dueDate: new Date(Date.now() + 86400000) }, // future
        { status: 'ACTIVE', dueDate: new Date(Date.now() - 86400000) }, // past
        { status: 'DELETED', dueDate: null },
      ]);

      const result = await service.getProjectOverview('project-uuid-1', 'u1', {});
      expect(result.totalTasks).toBe(3);
      expect(result.activeTasks).toBe(2);
      expect(result.deletedTasks).toBe(1);
      expect(result.overdueTasks).toBe(1);
      expect(result.completionRate).toBe(33); // (3-2)/3 = 33.3%
    });

    it('should throw NotFoundException if project not found', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.getProjectOverview('invalid', 'u1', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTimeTrackingReport()', () => {
    it('should aggregate time per member', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (prisma.timeEntry.findMany as jest.Mock).mockResolvedValueOnce([
        { duration: 3600, userId: 'u1', user: { id: 'u1', name: 'User 1' } },
        { duration: 1800, userId: 'u1', user: { id: 'u1', name: 'User 1' } },
        { duration: 7200, userId: 'u2', user: { id: 'u2', name: 'User 2' } },
      ]);

      const result = await service.getTimeTrackingReport('project-uuid-1', 'u1', {});
      expect(result.totalSeconds).toBe(12600); // 3600 + 1800 + 7200
      expect(result.totalHours).toBe(3.5);
      expect(result.byMember).toHaveLength(2);

      const u1Report = result.byMember.find((m) => m.userId === 'u1');
      expect(u1Report?.totalSeconds).toBe(5400);
      expect(u1Report?.totalHours).toBe(1.5);
      expect(u1Report?.entryCount).toBe(2);
    });
  });

  describe('getMemberActivityReport()', () => {
    it('should aggregate tasks and activities per member', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (prisma.taskAssignment.findMany as jest.Mock).mockResolvedValueOnce([
        { userId: 'u1' },
        { userId: 'u1' },
        { userId: 'u2' },
      ]);
      (prisma.activity.findMany as jest.Mock).mockResolvedValueOnce([{ userId: 'u1' }]);

      const result = await service.getMemberActivityReport('project-uuid-1', 'u1', {});
      expect(result.members).toHaveLength(2);

      const u1 = result.members.find((m) => m.userId === 'u1');
      expect(u1?.taskCount).toBe(2);
      expect(u1?.activityCount).toBe(1);

      const u2 = result.members.find((m) => m.userId === 'u2');
      expect(u2?.taskCount).toBe(1);
      expect(u2?.activityCount).toBe(0);
    });
  });

  describe('getWorkspaceSummary()', () => {
    it('should return aggregated workspace metrics', async () => {
      (prisma.workspace.findUnique as jest.Mock).mockResolvedValueOnce(mockWorkspace);
      (prisma.project.findMany as jest.Mock).mockResolvedValueOnce([{ id: 'p1' }, { id: 'p2' }]);
      (prisma.workspaceMember.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'm1' },
        { id: 'm2' },
        { id: 'm3' },
      ]);
      (prisma.task.findMany as jest.Mock).mockResolvedValueOnce(new Array(15).fill({ id: 't' }));
      (prisma.timeEntry.findMany as jest.Mock).mockResolvedValueOnce([
        { duration: 3600 },
        { duration: 3600 },
      ]);

      const result = await service.getWorkspaceSummary('ws-uuid-1', 'u1');
      expect(result.totalProjects).toBe(2);
      expect(result.totalMembers).toBe(3);
      expect(result.totalTasks).toBe(15);
      expect(result.totalTimeSeconds).toBe(7200);
      expect(result.totalTimeHours).toBe(2);
    });
  });
});
