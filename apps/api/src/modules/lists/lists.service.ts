import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { prisma, List, Prisma } from '@flowlyx/database';
import { PaginationDto } from '../../core/pagination';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class ListsService {
  async create(createListDto: CreateListDto): Promise<List> {
    const board = await prisma.board.findUnique({ where: { id: createListDto.boardId } });
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    return prisma.list.create({ data: createListDto });
  }

  async findAllByBoardId(boardId: string, query: PaginationDto) {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ListWhereInput = { boardId };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      prisma.list.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }, // order field should still be supported, but default is createdAt usually. User can pass sortBy='order'
      }),
      prisma.list.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findById(id: string): Promise<List> {
    const list = await prisma.list.findUnique({ where: { id } });
    if (!list) {
      throw new NotFoundException('List not found');
    }
    return list;
  }

  async update(id: string, updateListDto: UpdateListDto): Promise<List> {
    return prisma.list.update({ where: { id }, data: updateListDto });
  }

  async remove(id: string): Promise<boolean> {
    await prisma.list.delete({ where: { id } });
    return true;
  }
}
