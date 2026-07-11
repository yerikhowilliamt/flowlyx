import { Test, TestingModule } from '@nestjs/testing';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from '@flowlyx/database';

describe('BoardsController', () => {
  let controller: BoardsController;
  let service: jest.Mocked<BoardsService>;

  const mockBoard: Board = {
    id: 'board-1',
    projectId: 'project-1',
    name: 'Board 1',
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
      findAllByProjectId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardsController],
      providers: [
        {
          provide: BoardsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<BoardsController>(BoardsController);
    service = module.get(BoardsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a board', async () => {
      const dto: CreateBoardDto = {
        projectId: 'project-1',
        name: 'Board 1',
      };
      service.create.mockResolvedValueOnce(mockBoard);

      const result = await controller.create(dto);
      expect(result).toEqual(mockBoard);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return boards for a projectId', async () => {
      service.findAllByProjectId.mockResolvedValueOnce([mockBoard]);
      const result = await controller.findAll('project-1');
      expect(result).toEqual([mockBoard]);
      expect(service.findAllByProjectId).toHaveBeenCalledWith('project-1');
    });

    it('should return empty array if no projectId provided', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([]);
      expect(service.findAllByProjectId).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a board by id', async () => {
      service.findById.mockResolvedValueOnce(mockBoard);
      const result = await controller.findOne('board-1');
      expect(result).toEqual(mockBoard);
      expect(service.findById).toHaveBeenCalledWith('board-1');
    });
  });

  describe('update', () => {
    it('should update a board', async () => {
      const dto: UpdateBoardDto = { name: 'Updated' };
      service.update.mockResolvedValueOnce({ ...mockBoard, ...dto });
      const result = await controller.update('board-1', dto);
      expect(result.name).toEqual('Updated');
      expect(service.update).toHaveBeenCalledWith('board-1', dto);
    });
  });

  describe('remove', () => {
    it('should remove a board', async () => {
      service.remove.mockResolvedValueOnce(true);
      await controller.remove('board-1');
      expect(service.remove).toHaveBeenCalledWith('board-1');
    });
  });
});
