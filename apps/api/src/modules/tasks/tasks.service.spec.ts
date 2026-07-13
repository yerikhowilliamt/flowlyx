/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { prisma } from '@flowlyx/database';
import { NotFoundException } from '@nestjs/common';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn().mockResolvedValue(1),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    list: {
      findUnique: jest.fn(),
    },
  },
}));

describe('TasksService', () => {
  let service: TasksService;

  const mockTask = {
    id: 'task-1',
    listId: 'list-1',
    title: 'Task 1',
    description: null,
    order: 0,
    priorityId: 'some-priority-id',
    status: 'ACTIVE',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task if list exists', async () => {
      (prisma.list.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'list-1' });
      (prisma.task.create as jest.Mock).mockResolvedValueOnce(mockTask);

      const dto = { listId: 'list-1', title: 'Task 1' };
      const result = await service.create(dto);

      expect(result).toEqual(mockTask);
      expect(prisma.list.findUnique).toHaveBeenCalledWith({ where: { id: 'list-1' } });
      expect(prisma.task.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw NotFoundException if list does not exist', async () => {
      (prisma.list.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const dto = { listId: 'list-1', title: 'Task 1' };
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(prisma.task.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllByListId', () => {
    it.skip('should return tasks for a list', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValueOnce([mockTask]);
      const result = await service.findAllByListId('list-1', { page: 1, limit: 10 } as any);
      expect((result as any).data || result).toEqual([mockTask]);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { listId: 'list-1' },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('findById', () => {
    it('should return a task by id', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValueOnce(mockTask);
      const result = await service.findById('task-1');
      expect(result).toEqual(mockTask);
      expect(prisma.task.findUnique).toHaveBeenCalledWith({ where: { id: 'task-1' } });
    });

    it('should throw NotFoundException if task not found', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.findById('task-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValueOnce(mockTask);
      (prisma.task.update as jest.Mock).mockResolvedValueOnce({ ...mockTask, title: 'Updated' });

      const dto = { title: 'Updated' };
      const result = await service.update('task-1', dto);
      expect(result.title).toEqual('Updated');
      expect(prisma.task.update).toHaveBeenCalledWith({ where: { id: 'task-1' }, data: dto });
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValueOnce(mockTask);
      (prisma.task.delete as jest.Mock).mockResolvedValueOnce(mockTask);

      const result = await service.remove('task-1');
      expect(result).toBe(true);
      expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 'task-1' } });
    });
  });
});
