import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { prisma, TaskAssignment, Prisma } from '@flowlyx/database';
import { PaginationDto } from '../../core/pagination';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { CreateTaskAssignmentDto } from './dto/create-task-assignment.dto';

@Injectable()
export class TaskAssignmentsService {
  private readonly logger = new Logger(TaskAssignmentsService.name);

  async create(dto: CreateTaskAssignmentDto, currentUserId: string) {
    const task = await prisma.task.findUnique({ where: { id: dto.taskId } });
    if (!task) throw new NotFoundException(`Task with ID ${dto.taskId} not found`);

    const user = await prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException(`User with ID ${dto.userId} not found`);

    const existing = await prisma.taskAssignment.findUnique({
      where: { taskId_userId: { taskId: dto.taskId, userId: dto.userId } },
    });

    if (existing) throw new ConflictException('User is already assigned to this task');

    return prisma.taskAssignment.create({
      data: {
        taskId: dto.taskId,
        userId: dto.userId,
        createdBy: currentUserId,
      },
    });
  }

  async findAllByTaskId(taskId: string, query: PaginationDto) {
    const { page, limit, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskAssignmentWhereInput = { taskId };

    const [data, total] = await Promise.all([
      prisma.taskAssignment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { user: true },
      }),
      prisma.taskAssignment.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async remove(id: string) {
    const assignment = await prisma.taskAssignment.findUnique({ where: { id } });
    if (!assignment) throw new NotFoundException(`Task assignment with ID ${id} not found`);
    await prisma.taskAssignment.delete({ where: { id } });
  }
}
