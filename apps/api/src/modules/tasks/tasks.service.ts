import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { prisma, Task } from '@flowlyx/database';

@Injectable()
export class TasksService {
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const list = await prisma.list.findUnique({ where: { id: createTaskDto.listId } });
    if (!list) {
      throw new NotFoundException('List not found');
    }
    return prisma.task.create({ data: createTaskDto });
  }

  async findAllByListId(listId: string): Promise<Task[]> {
    return prisma.task.findMany({
      where: { listId },
      orderBy: { order: 'asc' },
    });
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
