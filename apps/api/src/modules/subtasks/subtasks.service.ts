import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { prisma, Subtask } from '@flowlyx/database';

@Injectable()
export class SubtasksService {
  async create(createSubtaskDto: CreateSubtaskDto): Promise<Subtask> {
    const task = await prisma.task.findUnique({ where: { id: createSubtaskDto.taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return prisma.subtask.create({ data: createSubtaskDto });
  }

  async findAllByTaskId(taskId: string): Promise<Subtask[]> {
    return prisma.subtask.findMany({
      where: { taskId },
      orderBy: { order: 'asc' },
    });
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
