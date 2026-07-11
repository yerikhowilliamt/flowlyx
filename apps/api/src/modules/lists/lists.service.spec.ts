import { Test, TestingModule } from '@nestjs/testing';
import { ListsService } from './lists.service';
import { prisma } from '@flowlyx/database';
import { NotFoundException } from '@nestjs/common';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    list: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    board: {
      findUnique: jest.fn(),
    },
  },
}));

describe('ListsService', () => {
  let service: ListsService;

  const mockList = {
    id: 'list-1',
    boardId: 'board-1',
    name: 'List 1',
    order: 0,
    color: '#000000',
    status: 'ACTIVE',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListsService],
    }).compile();

    service = module.get<ListsService>(ListsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a list if board exists', async () => {
      (prisma.board.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'board-1' });
      (prisma.list.create as jest.Mock).mockResolvedValueOnce(mockList);

      const dto = { boardId: 'board-1', name: 'List 1' };
      const result = await service.create(dto);

      expect(result).toEqual(mockList);
      expect(prisma.board.findUnique).toHaveBeenCalledWith({ where: { id: 'board-1' } });
      expect(prisma.list.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw NotFoundException if board does not exist', async () => {
      (prisma.board.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const dto = { boardId: 'board-1', name: 'List 1' };
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(prisma.list.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllByBoardId', () => {
    it('should return lists for a board', async () => {
      (prisma.list.findMany as jest.Mock).mockResolvedValueOnce([mockList]);
      const result = await service.findAllByBoardId('board-1');
      expect(result).toEqual([mockList]);
      expect(prisma.list.findMany).toHaveBeenCalledWith({
        where: { boardId: 'board-1' },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('findById', () => {
    it('should return a list by id', async () => {
      (prisma.list.findUnique as jest.Mock).mockResolvedValueOnce(mockList);
      const result = await service.findById('list-1');
      expect(result).toEqual(mockList);
      expect(prisma.list.findUnique).toHaveBeenCalledWith({ where: { id: 'list-1' } });
    });

    it('should throw NotFoundException if list not found', async () => {
      (prisma.list.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.findById('list-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a list', async () => {
      (prisma.list.findUnique as jest.Mock).mockResolvedValueOnce(mockList);
      (prisma.list.update as jest.Mock).mockResolvedValueOnce({ ...mockList, name: 'Updated' });

      const dto = { name: 'Updated' };
      const result = await service.update('list-1', dto);
      expect(result.name).toEqual('Updated');
      expect(prisma.list.update).toHaveBeenCalledWith({ where: { id: 'list-1' }, data: dto });
    });
  });

  describe('remove', () => {
    it('should remove a list', async () => {
      (prisma.list.findUnique as jest.Mock).mockResolvedValueOnce(mockList);
      (prisma.list.delete as jest.Mock).mockResolvedValueOnce(mockList);

      const result = await service.remove('list-1');
      expect(result).toBe(true);
      expect(prisma.list.delete).toHaveBeenCalledWith({ where: { id: 'list-1' } });
    });
  });
});
