import { Test, TestingModule } from '@nestjs/testing';
import { TaskAssignmentsService } from './task-assignments.service';
import { prisma } from '@flowlyx/database';
import { NotFoundException, ConflictException } from '@nestjs/common';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    task: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    taskAssignment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn().mockResolvedValue(1),
      delete: jest.fn(),
    },
  },
}));

describe('TaskAssignmentsService', () => {
  let service: TaskAssignmentsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskAssignmentsService],
    }).compile();

    service = module.get<TaskAssignmentsService>(TaskAssignmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if task not found', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.create({ taskId: 't1', userId: 'u1' }, 'creator1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValueOnce({ id: 't1' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.create({ taskId: 't1', userId: 'u1' }, 'creator1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if already assigned', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValueOnce({ id: 't1' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'u1' });
      (prisma.taskAssignment.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'a1' });

      await expect(service.create({ taskId: 't1', userId: 'u1' }, 'creator1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create task assignment', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValueOnce({ id: 't1' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'u1' });
      (prisma.taskAssignment.findUnique as jest.Mock).mockResolvedValueOnce(null); // not assigned yet
      
      const mockAssignment = { id: 'a1', taskId: 't1', userId: 'u1', createdBy: 'creator1' };
      (prisma.taskAssignment.create as jest.Mock).mockResolvedValueOnce(mockAssignment);

      const result = await service.create({ taskId: 't1', userId: 'u1' }, 'creator1');
      expect(result).toEqual(mockAssignment);
      expect(prisma.taskAssignment.create).toHaveBeenCalledWith({
        data: { taskId: 't1', userId: 'u1', createdBy: 'creator1' },
      });
    });
  });

  describe('findAllByTaskId', () => {
    it('should return paginated assignments', async () => {
      const mockData = [{ id: 'a1' }];
      (prisma.taskAssignment.findMany as jest.Mock).mockResolvedValueOnce(mockData);
      (prisma.taskAssignment.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.findAllByTaskId('t1', {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(1);
      expect(prisma.taskAssignment.findMany).toHaveBeenCalledWith({
        where: { taskId: 't1' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      });
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if assignment not found', async () => {
      (prisma.taskAssignment.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.remove('a1')).rejects.toThrow(NotFoundException);
    });

    it('should delete assignment', async () => {
      (prisma.taskAssignment.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'a1' });
      
      await service.remove('a1');
      expect(prisma.taskAssignment.delete).toHaveBeenCalledWith({ where: { id: 'a1' } });
    });
  });
});
