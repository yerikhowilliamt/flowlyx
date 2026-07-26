import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AiSprintPlanningService } from './ai-sprint-planning.service';

const mockProject = {
  id: 'project-uuid-1',
  name: 'Test Project',
  boards: [
    {
      lists: [
        {
          tasks: [
            { id: 't1', title: 'Task One', order: 0 },
            { id: 't2', title: 'Task Two', order: 1 },
            { id: 't3', title: 'Task Three', order: 2 },
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

describe('AiSprintPlanningService', () => {
  let service: AiSprintPlanningService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiSprintPlanningService],
    }).compile();
    service = module.get<AiSprintPlanningService>(AiSprintPlanningService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSprintPlan()', () => {
    it('should return sprint plan with recommended tasks', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const result = await service.generateSprintPlan(
        {
          projectId: 'project-uuid-1',
          sprintDurationDays: 14,
          maxTasksPerSprint: 10,
          focusArea: 'all',
        },
        'user-1',
      );

      expect(result.projectId).toBe('project-uuid-1');
      expect(result.sprintGoal).toContain('Test Project');
      expect(result.recommendedTasks).toHaveLength(3);
      expect(result.estimatedEffort).toBe(3);
      expect(result.sprintDurationDays).toBe(14);
      expect(result.generatedAt).toBeDefined();
    });

    it('should cap tasks at maxTasksPerSprint', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const result = await service.generateSprintPlan(
        {
          projectId: 'project-uuid-1',
          sprintDurationDays: 14,
          maxTasksPerSprint: 2,
          focusArea: 'all',
        },
        'user-1',
      );

      expect(result.recommendedTasks).toHaveLength(2);
      expect(result.riskFlags).toContain('1 task(s) were excluded due to sprint capacity limit.');
    });

    it('should return velocity-focused sprint goal', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const result = await service.generateSprintPlan(
        {
          projectId: 'project-uuid-1',
          sprintDurationDays: 14,
          maxTasksPerSprint: 10,
          focusArea: 'velocity',
        },
        'user-1',
      );

      expect(result.sprintGoal).toContain('maximize team velocity');
    });

    it('should return blockers-focused sprint goal and risk flag', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const result = await service.generateSprintPlan(
        {
          projectId: 'project-uuid-1',
          sprintDurationDays: 14,
          maxTasksPerSprint: 10,
          focusArea: 'blockers',
        },
        'user-1',
      );

      expect(result.sprintGoal).toContain('resolving blockers');
      expect(result.riskFlags).toContain('Review blocked tasks before committing to sprint.');
    });

    it('should return priorities-focused sprint goal', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const result = await service.generateSprintPlan(
        {
          projectId: 'project-uuid-1',
          sprintDurationDays: 14,
          maxTasksPerSprint: 10,
          focusArea: 'priorities',
        },
        'user-1',
      );

      expect(result.sprintGoal).toContain('highest business value');
    });

    it('should flag no tasks when project has none', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        boards: [],
      });

      const result = await service.generateSprintPlan(
        {
          projectId: 'project-uuid-1',
          sprintDurationDays: 14,
          maxTasksPerSprint: 10,
          focusArea: 'all',
        },
        'user-1',
      );

      expect(result.recommendedTasks).toHaveLength(0);
      expect(result.riskFlags).toContain('No tasks available in this project.');
    });

    it('should throw NotFoundException when project does not exist', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.generateSprintPlan(
          {
            projectId: 'non-existent-uuid',
            sprintDurationDays: 14,
            maxTasksPerSprint: 10,
            focusArea: 'all',
          },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should log activity after generating sprint plan', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      await service.generateSprintPlan(
        {
          projectId: 'project-uuid-1',
          sprintDurationDays: 14,
          maxTasksPerSprint: 10,
          focusArea: 'all',
        },
        'user-1',
      );

      expect(prisma.activity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            entityId: 'project-uuid-1',
            entityType: 'PROJECT',
            action: 'AI_SPRINT_PLAN_GENERATED',
          }),
        }),
      );
    });
  });
});
