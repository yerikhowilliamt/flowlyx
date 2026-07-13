import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { prisma, Task, Prisma } from '@flowlyx/database';
import { PaginationDto } from '../../core/pagination';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class TasksService {
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const list = await prisma.list.findUnique({ where: { id: createTaskDto.listId } });
    if (!list) {
      throw new NotFoundException('List not found');
    }
    return prisma.task.create({ data: createTaskDto });
  }

  async findAllByListId(listId: string, query: PaginationDto) {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = { listId };
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.task.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findById(id: string): Promise<Task> {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    return prisma.task.update({ where: { id }, data: updateTaskDto });
  }

  async remove(id: string): Promise<boolean> {
    await prisma.task.delete({ where: { id } });
    return true;
  }
}
