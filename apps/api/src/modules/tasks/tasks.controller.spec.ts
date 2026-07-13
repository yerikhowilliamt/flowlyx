import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTask = {
    id: 'task-1',
    listId: 'list-1',
    title: 'Task 1',
    description: null,
    order: 0,
    priorityId: 'some-priority-id',
    status: 'ACTIVE',
  };

  const mockTasksService = {
    create: jest.fn(),
    findAllByListId: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const dto = { listId: 'list-1', title: 'Task 1' };
      mockTasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(dto);
      expect(result).toEqual(mockTask);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return tasks if listId is provided', async () => {
      mockTasksService.findAllByListId.mockResolvedValue([mockTask]);

      const result = await controller.findAll('list-1');
      expect(result).toEqual([mockTask]);
      expect(service.findAllByListId).toHaveBeenCalledWith('list-1');
    });

    it('should return empty array if listId is not provided', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([]);
      expect(service.findAllByListId).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      mockTasksService.findById.mockResolvedValue(mockTask);

      const result = await controller.findOne('task-1');
      expect(result).toEqual(mockTask);
      expect(service.findById).toHaveBeenCalledWith('task-1');
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const dto = { title: 'Updated' };
      mockTasksService.update.mockResolvedValue({ ...mockTask, ...dto });

      const result = await controller.update('task-1', dto);
      expect(result.title).toEqual('Updated');
      expect(service.update).toHaveBeenCalledWith('task-1', dto);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      mockTasksService.remove.mockResolvedValue(true);

      await controller.remove('task-1');
      expect(service.remove).toHaveBeenCalledWith('task-1');
    });
  });
});
