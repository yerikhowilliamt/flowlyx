import { Test, TestingModule } from '@nestjs/testing';
import { SubtasksController } from './subtasks.controller';
import { SubtasksService } from './subtasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('SubtasksController', () => {
  let controller: SubtasksController;

  const mockSubtask = {
    id: 'subtask-1',
    taskId: 'task-1',
    title: 'Subtask 1',
    isCompleted: false,
    order: 0,
    status: 'ACTIVE',
  };

  const mockSubtasksService = {
    create: jest.fn(),
    findAllByTaskId: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubtasksController],
      providers: [
        {
          provide: SubtasksService,
          useValue: mockSubtasksService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SubtasksController>(SubtasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a subtask', async () => {
      const dto = { taskId: 'task-1', title: 'Subtask 1' };
      mockSubtasksService.create.mockResolvedValue(mockSubtask);

      const result = await controller.create(dto);
      expect(result).toEqual(mockSubtask);
      expect(mockSubtasksService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return subtasks if taskId is provided', async () => {
      mockSubtasksService.findAllByTaskId.mockResolvedValue([mockSubtask]);

      const result = await controller.findAll({ page: 1, limit: 10 } as unknown, 'task-1');
      expect((result as unknown).data || result).toEqual([mockSubtask]);
      expect(mockSubtasksService.findAllByTaskId).toHaveBeenCalledWith('task-1', {
        page: 1,
        limit: 10,
      } as unknown);
    });

    it('should return empty array if taskId is not provided', async () => {
      const result = await controller.findAll({ page: 1, limit: 10 } as unknown);
      expect(result).toEqual([]);
      expect(mockSubtasksService.findAllByTaskId).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a subtask by id', async () => {
      mockSubtasksService.findById.mockResolvedValue(mockSubtask);

      const result = await controller.findOne('subtask-1');
      expect(result).toEqual(mockSubtask);
      expect(mockSubtasksService.findById).toHaveBeenCalledWith('subtask-1');
    });
  });

  describe('update', () => {
    it('should update a subtask', async () => {
      const dto = { title: 'Updated' };
      mockSubtasksService.update.mockResolvedValue({ ...mockSubtask, ...dto });

      const result = await controller.update('subtask-1', dto);
      expect(result.title).toEqual('Updated');
      expect(mockSubtasksService.update).toHaveBeenCalledWith('subtask-1', dto);
    });
  });

  describe('remove', () => {
    it('should remove a subtask', async () => {
      mockSubtasksService.remove.mockResolvedValue(true);

      await controller.remove('subtask-1');
      expect(mockSubtasksService.remove).toHaveBeenCalledWith('subtask-1');
    });
  });
});
