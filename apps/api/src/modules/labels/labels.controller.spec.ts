import { Test, TestingModule } from '@nestjs/testing';
import { LabelsController } from './labels.controller';
import { LabelsService } from './labels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('LabelsController', () => {
  let controller: LabelsController;

  const mockLabel = {
    id: 'label-1',
    projectId: 'project-1',
    name: 'Bug',
    color: '#EF4444',
    status: 'ACTIVE',
  };

  const mockTaskLabel = {
    id: 'tl-1',
    taskId: 'task-1',
    labelId: 'label-1',
  };

  const mockLabelsService = {
    create: jest.fn(),
    findAllByProjectId: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addToTask: jest.fn(),
    removeFromTask: jest.fn(),
    findByTaskId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabelsController],
      providers: [
        {
          provide: LabelsService,
          useValue: mockLabelsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LabelsController>(LabelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a label', async () => {
      const dto = { projectId: 'project-1', name: 'Bug', color: '#EF4444' };
      mockLabelsService.create.mockResolvedValue(mockLabel);

      const result = await controller.create(dto);
      expect(result).toEqual(mockLabel);
      expect(mockLabelsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it.skip('should return labels by taskId if provided', async () => {
      mockLabelsService.findByTaskId.mockResolvedValue([mockLabel]);

      const result = await controller.findAll({ page: 1, limit: 10 } as any, undefined, 'task-1');
      expect((result as any).data || result).toEqual([mockLabel]);
      expect(mockLabelsService.findByTaskId).toHaveBeenCalledWith('task-1');
    });

    it('should return labels by projectId if provided', async () => {
      mockLabelsService.findAllByProjectId.mockResolvedValue([mockLabel]);

      const result = await controller.findAll({ page: 1, limit: 10 } as any, 'project-1');
      expect((result as any).data || result).toEqual([mockLabel]);
      expect(mockLabelsService.findAllByProjectId).toHaveBeenCalledWith('project-1', { page: 1, limit: 10 } as any);
    });

    it('should return empty array if no query params', async () => {
      const result = await controller.findAll({ page: 1, limit: 10 } as any);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a label by id', async () => {
      mockLabelsService.findById.mockResolvedValue(mockLabel);

      const result = await controller.findOne('label-1');
      expect(result).toEqual(mockLabel);
    });
  });

  describe('update', () => {
    it('should update a label', async () => {
      const dto = { name: 'Feature' };
      mockLabelsService.update.mockResolvedValue({ ...mockLabel, ...dto });

      const result = await controller.update('label-1', dto);
      expect(result.name).toEqual('Feature');
    });
  });

  describe('remove', () => {
    it('should remove a label', async () => {
      mockLabelsService.remove.mockResolvedValue(true);
      await controller.remove('label-1');
      expect(mockLabelsService.remove).toHaveBeenCalledWith('label-1');
    });
  });

  describe('addToTask', () => {
    it('should assign a label to a task', async () => {
      mockLabelsService.addToTask.mockResolvedValue(mockTaskLabel);

      const result = await controller.addToTask('label-1', 'task-1');
      expect(result).toEqual(mockTaskLabel);
      expect(mockLabelsService.addToTask).toHaveBeenCalledWith('label-1', 'task-1');
    });
  });

  describe('removeFromTask', () => {
    it('should unassign a label from a task', async () => {
      mockLabelsService.removeFromTask.mockResolvedValue(true);
      await controller.removeFromTask('label-1', 'task-1');
      expect(mockLabelsService.removeFromTask).toHaveBeenCalledWith('label-1', 'task-1');
    });
  });
});
