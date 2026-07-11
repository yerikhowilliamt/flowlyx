import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

describe('WorkspacesController', () => {
  let controller: WorkspacesController;
  let service: WorkspacesService;

  const mockService = {
    create: jest.fn(),
    findAllByOrganizationId: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [{ provide: WorkspacesService, useValue: mockService }],
    }).compile();

    controller = module.get<WorkspacesController>(WorkspacesController);
    service = module.get<WorkspacesService>(WorkspacesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service create', async () => {
      const dto = { organizationId: '123', name: 'Test', slug: 'test' };
      mockService.create.mockResolvedValue({ id: '1', ...dto });

      const result = await controller.create(dto as unknown as CreateWorkspaceDto);
      expect(result).toEqual({ id: '1', ...dto });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service findAllByOrganizationId if org id is provided', async () => {
      mockService.findAllByOrganizationId.mockResolvedValue([{ id: '1' }]);
      const result = await controller.findAll('123');
      expect(result).toEqual([{ id: '1' }]);
      expect(service.findAllByOrganizationId).toHaveBeenCalledWith('123');
    });

    it('should return empty array if org id is not provided', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([]);
      expect(service.findAllByOrganizationId).not.toHaveBeenCalled();
    });
  });
});
