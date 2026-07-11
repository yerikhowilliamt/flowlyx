import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { ProjectsRepository } from './projects.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Project } from '@flowlyx/database';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repository: jest.Mocked<ProjectsRepository>;

  const mockProject: Project = {
    id: 'project-1',
    workspaceId: 'workspace-1',
    name: 'Project 1',
    slug: 'project-1',
    description: 'Description 1',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdBy: null,
    updatedBy: null,
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findAllByWorkspaceId: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: ProjectsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    repository = module.get(ProjectsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a project', async () => {
      const dto = { workspaceId: 'workspace-1', name: 'Project 1', slug: 'project-1' };
      repository.findBySlug.mockResolvedValueOnce(null);
      repository.create.mockResolvedValueOnce(mockProject);

      const result = await service.create(dto);
      expect(result).toEqual(mockProject);
      expect(repository.create).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException if slug already exists', async () => {
      const dto = { workspaceId: 'workspace-1', name: 'Project 1', slug: 'project-1' };
      repository.findBySlug.mockResolvedValueOnce(mockProject);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllByWorkspaceId', () => {
    it('should return an array of projects', async () => {
      repository.findAllByWorkspaceId.mockResolvedValueOnce([mockProject]);
      const result = await service.findAllByWorkspaceId('workspace-1');
      expect(result).toEqual([mockProject]);
    });
  });

  describe('findById', () => {
    it('should return a project if found', async () => {
      repository.findById.mockResolvedValueOnce(mockProject);
      const result = await service.findById('project-1');
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findById.mockResolvedValueOnce(null);
      await expect(service.findById('project-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return a project if found', async () => {
      repository.findBySlug.mockResolvedValueOnce(mockProject);
      const result = await service.findBySlug('project-1');
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findBySlug.mockResolvedValueOnce(null);
      await expect(service.findBySlug('project-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a project successfully', async () => {
      const dto = { name: 'Updated Project' };
      repository.findById.mockResolvedValueOnce(mockProject);
      repository.update.mockResolvedValueOnce({ ...mockProject, ...dto });

      const result = await service.update('project-1', dto);
      expect(result.name).toEqual('Updated Project');
      expect(repository.update).toHaveBeenCalledWith('project-1', dto);
    });
  });

  describe('remove', () => {
    it('should remove a project successfully', async () => {
      repository.findById.mockResolvedValueOnce(mockProject);
      repository.delete.mockResolvedValueOnce(true);

      const result = await service.remove('project-1');
      expect(result).toEqual(true);
      expect(repository.delete).toHaveBeenCalledWith('project-1');
    });
  });
});
