import { Test, TestingModule } from '@nestjs/testing';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('ListsController', () => {
  let controller: ListsController;
  let service: ListsService;

  const mockList = {
    id: 'list-1',
    boardId: 'board-1',
    name: 'List 1',
    order: 0,
    color: '#000000',
    status: 'ACTIVE',
  };

  const mockListsService = {
    create: jest.fn(),
    findAllByBoardId: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListsController],
      providers: [
        {
          provide: ListsService,
          useValue: mockListsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ListsController>(ListsController);
    service = module.get<ListsService>(ListsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a list', async () => {
      const dto = { boardId: 'board-1', name: 'List 1' };
      mockListsService.create.mockResolvedValue(mockList);

      const result = await controller.create(dto);
      expect(result).toEqual(mockList);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return lists if boardId is provided', async () => {
      mockListsService.findAllByBoardId.mockResolvedValue([mockList]);

      const result = await controller.findAll(
        {
          page: 1,
          limit: 10,
        } as unknown as import('../../core/pagination/pagination.dto').PaginationDto,
        'board-1',
      );
      expect('data' in (result as object) ? (result as { data: unknown }).data : result).toEqual([
        mockList,
      ]);
      expect(service.findAllByBoardId).toHaveBeenCalledWith('board-1', {
        page: 1,
        limit: 10,
      } as never);
    });

    it('should return empty array if boardId is not provided', async () => {
      const result = await controller.findAll({
        page: 1,
        limit: 10,
      } as unknown as import('../../core/pagination/pagination.dto').PaginationDto);
      expect(result).toEqual([]);
      expect(service.findAllByBoardId).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a list by id', async () => {
      mockListsService.findById.mockResolvedValue(mockList);

      const result = await controller.findOne('list-1');
      expect(result).toEqual(mockList);
      expect(service.findById).toHaveBeenCalledWith('list-1');
    });
  });

  describe('update', () => {
    it('should update a list', async () => {
      const dto = { name: 'Updated' };
      mockListsService.update.mockResolvedValue({ ...mockList, ...dto });

      const result = await controller.update('list-1', dto);
      expect(result.name).toEqual('Updated');
      expect(service.update).toHaveBeenCalledWith('list-1', dto);
    });
  });

  describe('remove', () => {
    it('should remove a list', async () => {
      mockListsService.remove.mockResolvedValue(true);

      await controller.remove('list-1');
      expect(service.remove).toHaveBeenCalledWith('list-1');
    });
  });
});
