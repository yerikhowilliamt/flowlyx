import { Test, TestingModule } from '@nestjs/testing';
import { SubtasksService } from './subtasks.service';
import { prisma } from '@flowlyx/database';
import { NotFoundException } from '@nestjs/common';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    subtask: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    task: {
      findUnique: jest.fn(),
    },
  },
}));

describe('SubtasksService', () => {
  let service: SubtasksService;

  const mockSubtask = {
    id: 'subtask-1',
    taskId: 'task-1',
    title: 'Subtask 1',
    isCompleted: false,
    order: 0,
    status: 'ACTIVE',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubtasksService],
    }).compile();

    service = module.get<SubtasksService>(SubtasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a subtask if task exists', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'task-1' });
      (prisma.subtask.create as jest.Mock).mockResolvedValueOnce(mockSubtask);

      const dto = { taskId: 'task-1', title: 'Subtask 1' };
      const result = await service.create(dto);

      expect(result).toEqual(mockSubtask);
      expect(prisma.task.findUnique).toHaveBeenCalledWith({ where: { id: 'task-1' } });
      expect(prisma.subtask.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw NotFoundException if task does not exist', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const dto = { taskId: 'task-1', title: 'Subtask 1' };
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(prisma.subtask.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllByTaskId', () => {
    it('should return subtasks for a task', async () => {
      (prisma.subtask.findMany as jest.Mock).mockResolvedValueOnce([mockSubtask]);
      const result = await service.findAllByTaskId('task-1');
      expect(result).toEqual([mockSubtask]);
      expect(prisma.subtask.findMany).toHaveBeenCalledWith({
        where: { taskId: 'task-1' },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('findById', () => {
    it('should return a subtask by id', async () => {
      (prisma.subtask.findUnique as jest.Mock).mockResolvedValueOnce(mockSubtask);
      const result = await service.findById('subtask-1');
      expect(result).toEqual(mockSubtask);
      expect(prisma.subtask.findUnique).toHaveBeenCalledWith({ where: { id: 'subtask-1' } });
    });

    it('should throw NotFoundException if subtask not found', async () => {
      (prisma.subtask.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.findById('subtask-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a subtask', async () => {
      (prisma.subtask.update as jest.Mock).mockResolvedValueOnce({
        ...mockSubtask,
        title: 'Updated',
      });

      const dto = { title: 'Updated' };
      const result = await service.update('subtask-1', dto);
      expect(result.title).toEqual('Updated');
      expect(prisma.subtask.update).toHaveBeenCalledWith({ where: { id: 'subtask-1' }, data: dto });
    });
  });

  describe('remove', () => {
    it('should remove a subtask', async () => {
      (prisma.subtask.delete as jest.Mock).mockResolvedValueOnce(mockSubtask);

      const result = await service.remove('subtask-1');
      expect(result).toBe(true);
      expect(prisma.subtask.delete).toHaveBeenCalledWith({ where: { id: 'subtask-1' } });
    });
  });
});
