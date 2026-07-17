import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { prisma, Subtask, Prisma } from '@flowlyx/database';
import { PaginationDto } from '../../core/pagination';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class SubtasksService {
  async create(createSubtaskDto: CreateSubtaskDto): Promise<Subtask> {
    const task = await prisma.task.findUnique({ where: { id: createSubtaskDto.taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return prisma.subtask.create({ data: createSubtaskDto });
  }

  async findAllByTaskId(taskId: string, query: PaginationDto) {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SubtaskWhereInput = { taskId };
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      prisma.subtask.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.subtask.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findById(id: string): Promise<Subtask> {
    const subtask = await prisma.subtask.findUnique({ where: { id } });
    if (!subtask) {
      throw new NotFoundException('Subtask not found');
    }
    return subtask;
  }

  async update(id: string, updateSubtaskDto: UpdateSubtaskDto): Promise<Subtask> {
    return prisma.subtask.update({ where: { id }, data: updateSubtaskDto });
  }

  async remove(id: string): Promise<boolean> {
    await prisma.subtask.delete({ where: { id } });
    return true;
  }
}
