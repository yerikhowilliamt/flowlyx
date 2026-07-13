/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from './boards.service';
import { prisma } from '@flowlyx/database';
import { NotFoundException } from '@nestjs/common';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    board: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn().mockResolvedValue(1),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
  },
}));

describe('BoardsService', () => {
  let service: BoardsService;

  const mockBoard = {
    id: 'board-1',
    projectId: 'project-1',
    name: 'Board 1',
    description: 'Description 1',
    status: 'ACTIVE',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardsService],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a board if project exists', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'project-1' });
      (prisma.board.create as jest.Mock).mockResolvedValueOnce(mockBoard);

      const dto = { projectId: 'project-1', name: 'Board 1' };
      const result = await service.create(dto);

      expect(result).toEqual(mockBoard);
      expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { id: 'project-1' } });
      expect(prisma.board.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw NotFoundException if project does not exist', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const dto = { projectId: 'project-1', name: 'Board 1' };
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(prisma.board.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllByProjectId', () => {
    it.skip('should return boards for a project', async () => {
      (prisma.board.findMany as jest.Mock).mockResolvedValueOnce([mockBoard]);
      const result = await service.findAllByProjectId('project-1', {
        page: 1,
        limit: 10,
      } as any);
      expect((result as any).data || result).toEqual([mockBoard]);
      expect(prisma.board.findMany).toHaveBeenCalledWith({ where: { projectId: 'project-1' } });
    });
  });

  describe('findById', () => {
    it('should return a board by id', async () => {
      (prisma.board.findUnique as jest.Mock).mockResolvedValueOnce(mockBoard);
      const result = await service.findById('board-1');
      expect(result).toEqual(mockBoard);
      expect(prisma.board.findUnique).toHaveBeenCalledWith({ where: { id: 'board-1' } });
    });

    it('should throw NotFoundException if board not found', async () => {
      (prisma.board.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.findById('board-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a board', async () => {
      (prisma.board.findUnique as jest.Mock).mockResolvedValueOnce(mockBoard);
      (prisma.board.update as jest.Mock).mockResolvedValueOnce({ ...mockBoard, name: 'Updated' });

      const dto = { name: 'Updated' };
      const result = await service.update('board-1', dto);
      expect(result.name).toEqual('Updated');
      expect(prisma.board.update).toHaveBeenCalledWith({ where: { id: 'board-1' }, data: dto });
    });
  });

  describe('remove', () => {
    it('should remove a board', async () => {
      (prisma.board.findUnique as jest.Mock).mockResolvedValueOnce(mockBoard);
      (prisma.board.delete as jest.Mock).mockResolvedValueOnce(mockBoard);

      const result = await service.remove('board-1');
      expect(result).toBe(true);
      expect(prisma.board.delete).toHaveBeenCalledWith({ where: { id: 'board-1' } });
    });
  });
});
