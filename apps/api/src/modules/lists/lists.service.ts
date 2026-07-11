import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { prisma, List } from '@flowlyx/database';

@Injectable()
export class ListsService {
  async create(createListDto: CreateListDto): Promise<List> {
    const board = await prisma.board.findUnique({ where: { id: createListDto.boardId } });
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    return prisma.list.create({ data: createListDto });
  }

  async findAllByBoardId(boardId: string): Promise<List[]> {
    return prisma.list.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
    });
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
