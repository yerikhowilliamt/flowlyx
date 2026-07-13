import { Test, TestingModule } from '@nestjs/testing';
import { PrioritiesService } from './priorities.service';
import { PrismaClient } from '@prisma/client';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockPrismaClient = {
  priority: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('PrioritiesService', () => {
  let service: PrioritiesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrioritiesService,
        {
          provide: PrismaClient,
          useValue: mockPrismaClient,
        },
      ],
    }).compile();

    service = module.get<PrioritiesService>(PrioritiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if priority with same name exists', async () => {
      mockPrismaClient.priority.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create({ projectId: 'project-1', name: 'High' }, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should create priority successfully', async () => {
      mockPrismaClient.priority.findFirst.mockResolvedValue(null);
      mockPrismaClient.priority.create.mockResolvedValue({ id: 'new-id' });

      const result = await service.create({ projectId: 'project-1', name: 'High' }, 'user-1');

      expect(result).toEqual({ id: 'new-id' });
      expect(mockPrismaClient.priority.create).toHaveBeenCalled();
    });
  });

  describe('findAllByProjectId', () => {
    it('should return an array of priorities', async () => {
      mockPrismaClient.priority.findMany.mockResolvedValue([{ id: 'id-1' }]);

      const result = await service.findAllByProjectId('project-1');

      expect(result).toEqual([{ id: 'id-1' }]);
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException if priority not found', async () => {
      mockPrismaClient.priority.findUnique.mockResolvedValue(null);

      await expect(service.findById('id-1')).rejects.toThrow(NotFoundException);
    });

    it('should return priority if found', async () => {
      mockPrismaClient.priority.findUnique.mockResolvedValue({ id: 'id-1' });

      const result = await service.findById('id-1');

      expect(result).toEqual({ id: 'id-1' });
    });
  });

  describe('update', () => {
    it('should update priority successfully', async () => {
      mockPrismaClient.priority.findUnique.mockResolvedValue({
        id: 'id-1',
        projectId: 'project-1',
      });
      mockPrismaClient.priority.findFirst.mockResolvedValue(null);
      mockPrismaClient.priority.update.mockResolvedValue({ id: 'id-1', name: 'Updated' });

      const result = await service.update('id-1', { name: 'Updated' }, 'user-1');

      expect(result).toEqual({ id: 'id-1', name: 'Updated' });
    });
  });

  describe('remove', () => {
    it('should mark priority as deleted', async () => {
      mockPrismaClient.priority.findUnique.mockResolvedValue({ id: 'id-1' });
      mockPrismaClient.priority.update.mockResolvedValue({ id: 'id-1', deletedAt: new Date() });

      const result = await service.remove('id-1', 'user-1');

      expect(result.deletedAt).toBeDefined();
    });
  });
});
