import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesRepository } from './workspaces.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let repository: WorkspacesRepository;

  const mockRepository = {
    create: jest.fn(),
    findAllByOrganizationId: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspacesService, { provide: WorkspacesRepository, useValue: mockRepository }],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
    repository = module.get<WorkspacesRepository>(WorkspacesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a workspace', async () => {
      mockRepository.findBySlug.mockResolvedValue(null);
      const dto = { organizationId: '123', name: 'Test', slug: 'test' };
      mockRepository.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto as unknown as CreateWorkspaceDto);
      expect(result).toEqual({ id: '1', ...dto });
      expect(repository.create).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException if slug exists', async () => {
      mockRepository.findBySlug.mockResolvedValue({ id: '1' });
      const dto = { organizationId: '123', name: 'Test', slug: 'test' };

      await expect(service.create(dto as unknown as CreateWorkspaceDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findById', () => {
    it('should return a workspace', async () => {
      const workspace = { id: '1', name: 'Test' };
      mockRepository.findById.mockResolvedValue(workspace);

      const result = await service.findById('1');
      expect(result).toEqual(workspace);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });
});
