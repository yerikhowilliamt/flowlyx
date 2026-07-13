import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from '@flowlyx/database';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: jest.Mocked<ProjectsService>;

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
    const mockService = {
      create: jest.fn(),
      findAllByWorkspaceId: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get(ProjectsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a project', async () => {
      const dto: CreateProjectDto = {
        workspaceId: 'workspace-1',
        name: 'Project 1',
        slug: 'project-1',
      };
      service.create.mockResolvedValueOnce(mockProject);

      const result = await controller.create(dto);
      expect(result).toEqual(mockProject);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return projects for a workspaceId', async () => {
      service.findAllByWorkspaceId.mockResolvedValueOnce({
        data: [mockProject],
        meta: {},
      } as never);
      const result = await controller.findAll(
        {
          page: 1,
          limit: 10,
        } as unknown as import('../../core/pagination/pagination.dto').PaginationDto,
        'workspace-1',
      );
      expect('data' in (result as object) ? (result as { data: unknown }).data : result).toEqual([
        mockProject,
      ]);
      expect(service.findAllByWorkspaceId).toHaveBeenCalledWith('workspace-1', {
        page: 1,
        limit: 10,
      } as never);
    });

    it('should return empty array if no workspaceId provided', async () => {
      const result = await controller.findAll({
        page: 1,
        limit: 10,
      } as unknown as import('../../core/pagination/pagination.dto').PaginationDto);
      expect(result).toEqual([]);
      expect(service.findAllByWorkspaceId).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a project by id', async () => {
      service.findById.mockResolvedValueOnce(mockProject);
      const result = await controller.findOne('project-1');
      expect(result).toEqual(mockProject);
      expect(service.findById).toHaveBeenCalledWith('project-1');
    });
  });

  describe('findBySlug', () => {
    it('should return a project by slug', async () => {
      service.findBySlug.mockResolvedValueOnce(mockProject);
      const result = await controller.findBySlug('project-1');
      expect(result).toEqual(mockProject);
      expect(service.findBySlug).toHaveBeenCalledWith('project-1');
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const dto: UpdateProjectDto = { name: 'Updated' };
      service.update.mockResolvedValueOnce({ ...mockProject, ...dto });
      const result = await controller.update('project-1', dto);
      expect(result.name).toEqual('Updated');
      expect(service.update).toHaveBeenCalledWith('project-1', dto);
    });
  });

  describe('remove', () => {
    it('should remove a project', async () => {
      service.remove.mockResolvedValueOnce(true);
      await controller.remove('project-1');
      expect(service.remove).toHaveBeenCalledWith('project-1');
    });
  });
});
