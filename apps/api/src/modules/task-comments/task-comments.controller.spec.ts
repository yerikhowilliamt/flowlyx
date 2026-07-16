import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskCommentsController } from './task-comments.controller';
import { TaskCommentsService } from './task-comments.service';
import { PaginationDto } from '../../core/pagination';
import { User } from '@flowlyx/database';

describe('TaskCommentsController', () => {
  let controller: TaskCommentsController;
  let service: TaskCommentsService;

  const mockComment = {
    id: 'comment-1',
    taskId: 'task-1',
    userId: 'user-1',
    content: 'Hello World',
    status: 'ACTIVE',
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(mockComment),
    findAllByTaskId: jest.fn().mockResolvedValue({ data: [mockComment], total: 1 }),
    update: jest.fn().mockResolvedValue({ ...mockComment, content: 'Updated' }),
    remove: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskCommentsController],
      providers: [
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        {
          provide: TaskCommentsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TaskCommentsController>(TaskCommentsController);
    service = module.get<TaskCommentsService>(TaskCommentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const result = await controller.create({ id: 'user-1' } as User, {
        taskId: 'task-1',
        content: 'Hello World',
      });
      expect(result).toEqual(mockComment);
      expect(service.create).toHaveBeenCalledWith('user-1', {
        taskId: 'task-1',
        content: 'Hello World',
      });
    });
  });

  describe('findAll', () => {
    it('should find all comments', async () => {
      const result = await controller.findAll(
        { id: 'user-1' } as User,
        { page: 1, limit: 10 } as PaginationDto,
        'task-1',
      );
      expect(result).toEqual({ data: [mockComment], total: 1 });
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const result = await controller.update({ id: 'user-1' } as User, 'comment-1', {
        content: 'Updated',
      });
      expect(result.content).toEqual('Updated');
    });
  });

  describe('remove', () => {
    it('should remove a comment', async () => {
      await controller.remove({ id: 'user-1' } as User, 'comment-1');
      expect(service.remove).toHaveBeenCalledWith('comment-1', 'user-1');
    });
  });
});
