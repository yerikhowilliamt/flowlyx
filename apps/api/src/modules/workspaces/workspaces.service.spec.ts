import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesService } from './workspaces.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { prisma } from '@flowlyx/database';
import { PaginationDto } from '../../core/pagination';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    workspace: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('WorkspacesService', () => {
  let service: WorkspacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspacesService],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a workspace', async () => {
      const dto = { name: 'W', slug: 'w', organizationId: 'o' };
      (prisma.workspace.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.workspace.create as jest.Mock).mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);
      expect(result).toEqual({ id: '1', ...dto });
      expect(prisma.workspace.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw ConflictException on create if exists', async () => {
      (prisma.workspace.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
      await expect(service.create({ name: 'W', slug: 'w', organizationId: 'o' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAllByOrganizationId', () => {
    it('should return paginated workspaces', async () => {
      const query: PaginationDto = { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' };
      const workspaces = [{ id: '1', name: 'W1' }];
      (prisma.workspace.findMany as jest.Mock).mockResolvedValue(workspaces);
      (prisma.workspace.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAllByOrganizationId('org1', query);
      expect(result.data).toEqual(workspaces);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should handle search filter', async () => {
      const query: PaginationDto = { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc', search: 'test' };
      (prisma.workspace.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.workspace.count as jest.Mock).mockResolvedValue(0);

      await service.findAllByOrganizationId('org1', query);
      expect(prisma.workspace.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { slug: { contains: 'test', mode: 'insensitive' } },
          ],
        }),
      }));
    });
  });

  describe('findById', () => {
    it('should return a workspace by ID', async () => {
      const workspace = { id: '1', name: 'W1' };
      (prisma.workspace.findUnique as jest.Mock).mockResolvedValue(workspace);
      const result = await service.findById('1');
      expect(result).toEqual(workspace);
    });

    it('should throw NotFoundException if ID does not exist', async () => {
      (prisma.workspace.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return a workspace by slug', async () => {
      const workspace = { id: '1', slug: 'slug1' };
      (prisma.workspace.findUnique as jest.Mock).mockResolvedValue(workspace);
      const result = await service.findBySlug('slug1');
      expect(result).toEqual(workspace);
    });

    it('should throw NotFoundException if slug does not exist', async () => {
      (prisma.workspace.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findBySlug('slug1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return workspace', async () => {
      const workspace = { id: '1', name: 'W1' };
      (prisma.workspace.findUnique as jest.Mock).mockResolvedValue(workspace);
      (prisma.workspace.update as jest.Mock).mockResolvedValue({ ...workspace, name: 'W2' });

      const result = await service.update('1', { name: 'W2' });
      expect(result.name).toBe('W2');
      expect(prisma.workspace.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { name: 'W2' } });
    });
  });

  describe('remove', () => {
    it('should delete a workspace', async () => {
      const workspace = { id: '1', name: 'W1' };
      (prisma.workspace.findUnique as jest.Mock).mockResolvedValue(workspace);
      (prisma.workspace.delete as jest.Mock).mockResolvedValue(workspace);

      const result = await service.remove('1');
      expect(result).toBe(true);
      expect(prisma.workspace.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
