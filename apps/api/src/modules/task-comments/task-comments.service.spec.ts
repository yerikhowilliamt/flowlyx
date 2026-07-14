import { Test, TestingModule } from '@nestjs/testing';
import { TaskCommentsService } from './task-comments.service';
import { prisma } from '@flowlyx/database';
import { ForbiddenException } from '@nestjs/common';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    taskComment: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn().mockResolvedValue(1),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    taskCommentMention: {
      createMany: jest.fn(),
    },
    task: {
      findUnique: jest.fn(),
    },
    projectMember: {
      findUnique: jest.fn(),
    },
    workspaceMember: {
      findUnique: jest.fn(),
    },
  },
}));

describe('TaskCommentsService', () => {
  let service: TaskCommentsService;

  const mockComment = {
    id: 'comment-1',
    taskId: 'task-1',
    userId: 'user-1',
    content: 'Hello World',
    status: 'ACTIVE',
  };

  const mockTask = {
    id: 'task-1',
    list: {
      board: {
        projectId: 'project-1',
        project: { workspaceId: 'workspace-1' },
      },
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskCommentsService],
    }).compile();

    service = module.get<TaskCommentsService>(TaskCommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment if user is project member', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValueOnce(mockTask);
      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'pm-1' });
      (prisma.taskComment.create as jest.Mock).mockResolvedValueOnce(mockComment);

      const dto = { taskId: 'task-1', content: 'Hello World' };
      const result = await service.create('user-1', dto);

      expect(result).toEqual(mockComment);
      expect(prisma.task.findUnique).toHaveBeenCalledWith(expect.anything());
      expect(prisma.taskComment.create).toHaveBeenCalledWith(expect.anything());
    });

    it('should throw ForbiddenException if user not member', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValueOnce(mockTask);
      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.workspaceMember.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const dto = { taskId: 'task-1', content: 'Hello World' };
      await expect(service.create('user-1', dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update a comment if author', async () => {
      (prisma.taskComment.findUnique as jest.Mock).mockResolvedValueOnce(mockComment);
      (prisma.taskComment.update as jest.Mock).mockResolvedValueOnce({
        ...mockComment,
        content: 'Updated',
      });

      const dto = { content: 'Updated' };
      const result = await service.update('comment-1', 'user-1', dto);
      expect(result.content).toEqual('Updated');
    });

    it('should throw ForbiddenException if not author', async () => {
      (prisma.taskComment.findUnique as jest.Mock).mockResolvedValueOnce(mockComment);

      const dto = { content: 'Updated' };
      await expect(service.update('comment-1', 'user-2', dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a comment if author', async () => {
      (prisma.taskComment.findUnique as jest.Mock).mockResolvedValueOnce(mockComment);
      (prisma.taskComment.delete as jest.Mock).mockResolvedValueOnce(mockComment);

      const result = await service.remove('comment-1', 'user-1');
      expect(result).toBe(true);
    });
  });
});
