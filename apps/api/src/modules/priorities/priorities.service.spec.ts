import { Test, TestingModule } from '@nestjs/testing';
import { PrioritiesService } from './priorities.service';
import { prisma } from '@flowlyx/database';
import { ConflictException, NotFoundException } from '@nestjs/common';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    priority: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn().mockResolvedValue(1),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('PrioritiesService', () => {
  let service: PrioritiesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrioritiesService],
    }).compile();

    service = module.get<PrioritiesService>(PrioritiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if priority with same name exists', async () => {
      (prisma.priority.findFirst as jest.Mock).mockResolvedValue({ id: 'existing' });

      await expect(
        service.create({ projectId: 'project-1', name: 'High' }, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should create priority successfully', async () => {
      (prisma.priority.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.priority.create as jest.Mock).mockResolvedValue({ id: 'new-id' });

      const result = await service.create({ projectId: 'project-1', name: 'High' }, 'user-1');

      expect(result).toEqual({ id: 'new-id' });
      expect(prisma.priority.create).toHaveBeenCalled();
    });
  });

  describe('findAllByProjectId', () => {
    it('should return an array of priorities', async () => {
      (prisma.priority.findMany as jest.Mock).mockResolvedValue([{ id: 'id-1' }]);

      const result = await service.findAllByProjectId('project-1', {
        page: 1,
        limit: 10,
      } as never);

      expect('data' in (result as object) ? (result as { data: unknown }).data : result).toEqual([
        { id: 'id-1' },
      ]);
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException if priority not found', async () => {
      (prisma.priority.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('id-1')).rejects.toThrow(NotFoundException);
    });

    it('should return priority if found', async () => {
      (prisma.priority.findUnique as jest.Mock).mockResolvedValue({ id: 'id-1' });

      const result = await service.findById('id-1');

      expect(result).toEqual({ id: 'id-1' });
    });
  });

  describe('update', () => {
    it('should update priority successfully', async () => {
      (prisma.priority.findUnique as jest.Mock).mockResolvedValue({
        id: 'id-1',
        projectId: 'project-1',
      });
      (prisma.priority.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.priority.update as jest.Mock).mockResolvedValue({ id: 'id-1', name: 'Updated' });

      const result = await service.update('id-1', { name: 'Updated' }, 'user-1');

      expect(result).toEqual({ id: 'id-1', name: 'Updated' });
    });
  });

  describe('remove', () => {
    it('should mark priority as deleted', async () => {
      (prisma.priority.findUnique as jest.Mock).mockResolvedValue({ id: 'id-1' });
      (prisma.priority.update as jest.Mock).mockResolvedValue({
        id: 'id-1',
        deletedAt: new Date(),
      });

      const result = await service.remove('id-1', 'user-1');

      expect(result.deletedAt).toBeDefined();
    });
  });
});
