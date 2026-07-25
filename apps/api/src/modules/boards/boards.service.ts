import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { prisma, Board, Prisma } from '@flowlyx/database';
import { PaginationDto } from '../../core/pagination';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class BoardsService {
  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const project = await prisma.project.findUnique({ where: { id: createBoardDto.projectId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const board = await prisma.board.create({ data: createBoardDto });
    await this.seedDefaultLists(board.id);
    return board;
  }

  private async seedDefaultLists(boardId: string) {
    const defaultNames = ['To Do', 'In Progress', 'Completed'];
    for (let i = 0; i < defaultNames.length; i++) {
      await prisma.list.create({
        data: {
          boardId,
          name: defaultNames[i],
          order: i,
        },
      });
    }
  }

  async findAllByProjectId(projectId: string, query: PaginationDto) {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BoardWhereInput = { projectId };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      prisma.board.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.board.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findById(id: string): Promise<Board> {
    const board = await prisma.board.findUnique({ where: { id } });
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    const listCount = await prisma.list.count({ where: { boardId: id } });
    if (listCount === 0) {
      await this.seedDefaultLists(id);
    }
    return board;
  }

  async update(id: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
    await this.findById(id);
    return prisma.board.update({ where: { id }, data: updateBoardDto });
  }

  async remove(id: string): Promise<boolean> {
    await this.findById(id);
    await prisma.board.delete({ where: { id } });
    return true;
  }
}
