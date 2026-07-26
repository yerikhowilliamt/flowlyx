import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AiProjectSummaryService } from './ai-project-summary.service';

const mockProject = {
  id: 'project-uuid-1',
  name: 'Test Project',
  boards: [
    {
      lists: [
        {
          tasks: [
            { id: 't1', status: 'ACTIVE' },
            { id: 't2', status: 'ACTIVE' },
            { id: 't3', status: 'ACTIVE' },
          ],
        },
      ],
    },
  ],
};

jest.mock('@flowlyx/database', () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
    },
    activity: {
      create: jest.fn().mockResolvedValue({}),
    },
  },
}));

import { prisma } from '@flowlyx/database';

describe('AiProjectSummaryService', () => {
  let service: AiProjectSummaryService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiProjectSummaryService],
    }).compile();
    service = module.get<AiProjectSummaryService>(AiProjectSummaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSummary()', () => {
    it('should return summary and stats when project exists', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const result = await service.generateSummary(
        { projectId: 'project-uuid-1', includeStats: true, focusArea: 'all' },
        'user-1',
      );

      expect(result.projectId).toBe('project-uuid-1');
      expect(result.summary).toContain('Test Project');
      expect(result.stats).toEqual({
        totalTasks: 3,
        totalBoards: 1,
        totalLists: 1,
      });
      expect(result.generatedAt).toBeDefined();
    });

    it('should omit stats when includeStats is false', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const result = await service.generateSummary(
        { projectId: 'project-uuid-1', includeStats: false, focusArea: 'all' },
        'user-1',
      );

      expect(result.stats).toBeUndefined();
    });

    it('should return progress-focused summary', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const result = await service.generateSummary(
        { projectId: 'project-uuid-1', includeStats: true, focusArea: 'progress' },
        'user-1',
      );

      expect(result.summary).toContain('Progress is on track');
    });

    it('should return risks-focused summary', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const result = await service.generateSummary(
        { projectId: 'project-uuid-1', includeStats: true, focusArea: 'risks' },
        'user-1',
      );

      expect(result.summary).toContain('No critical risks');
    });

    it('should return blockers-focused summary', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const result = await service.generateSummary(
        { projectId: 'project-uuid-1', includeStats: true, focusArea: 'blockers' },
        'user-1',
      );

      expect(result.summary).toContain('No blockers identified');
    });

    it('should handle project with no tasks (0% completion)', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        boards: [],
      });

      const result = await service.generateSummary(
        { projectId: 'project-uuid-1', includeStats: true, focusArea: 'all' },
        'user-1',
      );

      expect(result.stats?.totalTasks).toBe(0);
      expect(result.stats?.totalBoards).toBe(0);
    });

    it('should throw NotFoundException when project does not exist', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.generateSummary(
          { projectId: 'non-existent-uuid', includeStats: true, focusArea: 'all' },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should log activity after generating summary', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      await service.generateSummary(
        { projectId: 'project-uuid-1', includeStats: true, focusArea: 'all' },
        'user-1',
      );

      expect(prisma.activity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            entityId: 'project-uuid-1',
            entityType: 'PROJECT',
            action: 'AI_PROJECT_SUMMARY_GENERATED',
          }),
        }),
      );
    });
  });
});
