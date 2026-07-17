import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { prisma } from '@flowlyx/database';
import { PaginationDto } from '../../core/pagination';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a project', async () => {
      const dto = { name: 'P', slug: 'p', workspaceId: 'w' };
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.project.create as jest.Mock).mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);
      expect(result).toEqual({ id: '1', ...dto });
      expect(prisma.project.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw ConflictException on create if exists', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
      await expect(service.create({ name: 'P', slug: 'p', workspaceId: 'w' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAllByWorkspaceId', () => {
    it('should return paginated projects', async () => {
      const query: PaginationDto = { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' };
      const projects = [{ id: '1', name: 'P1' }];
      (prisma.project.findMany as jest.Mock).mockResolvedValue(projects);
      (prisma.project.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAllByWorkspaceId('w1', query);
      expect(result.data).toEqual(projects);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should handle search filter', async () => {
      const query: PaginationDto = { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc', search: 'test' };
      (prisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.project.count as jest.Mock).mockResolvedValue(0);

      await service.findAllByWorkspaceId('w1', query);
      expect(prisma.project.findMany).toHaveBeenCalledWith(expect.objectContaining({
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
    it('should return a project by ID', async () => {
      const project = { id: '1', name: 'P1' };
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
      const result = await service.findById('1');
      expect(result).toEqual(project);
    });

    it('should throw NotFoundException if ID does not exist', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return a project by slug', async () => {
      const project = { id: '1', slug: 'slug1' };
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
      const result = await service.findBySlug('slug1');
      expect(result).toEqual(project);
    });

    it('should throw NotFoundException if slug does not exist', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findBySlug('slug1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return project', async () => {
      const project = { id: '1', name: 'P1' };
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
      (prisma.project.update as jest.Mock).mockResolvedValue({ ...project, name: 'P2' });

      const result = await service.update('1', { name: 'P2' });
      expect(result.name).toBe('P2');
      expect(prisma.project.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { name: 'P2' } });
    });
  });

  describe('remove', () => {
    it('should delete a project', async () => {
      const project = { id: '1', name: 'P1' };
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
      (prisma.project.delete as jest.Mock).mockResolvedValue(project);

      const result = await service.remove('1');
      expect(result).toBe(true);
      expect(prisma.project.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
