import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreatePriorityDto } from './dto/create-priority.dto';
import { UpdatePriorityDto } from './dto/update-priority.dto';
import { PaginationDto } from '../../core/pagination';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { prisma, Prisma } from '@flowlyx/database';

const DEFAULT_PRIORITY_NAMES = ['urgent', 'high', 'medium', 'low'];

@Injectable()
export class PrioritiesService {
  private isDefaultPriority(priority: { name?: string | null; createdBy?: string | null }): boolean {
    return !!priority?.name && DEFAULT_PRIORITY_NAMES.includes(priority.name.toLowerCase()) && !priority.createdBy;
  }

  async create(createPriorityDto: CreatePriorityDto, userId: string) {
    const projectId = createPriorityDto.projectId || createPriorityDto.project_id;
    if (!projectId) {
      throw new BadRequestException('projectId is required');
    }
    const { name, color, order } = createPriorityDto;

    // Check if priority with same name already exists in project
    const existing = await prisma.priority.findFirst({
      where: {
        projectId,
        name: { equals: name, mode: 'insensitive' },
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Priority with name "${name}" already exists in this project`,
      );
    }

    return prisma.priority.create({
      data: {
        projectId,
        name,
        color: color || '#f97316',
        order: order ?? 1,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async findAllByProjectId(projectId: string, query: PaginationDto) {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PriorityWhereInput = {
      projectId,
      deletedAt: null,
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    let [data, total] = await Promise.all([
      prisma.priority.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.priority.count({ where }),
    ]);

    // Auto-seed default priorities if project has no priorities yet
    if (total === 0 && !search) {
      const defaultPriorities = [
        { name: 'Urgent', color: '#ef4444', order: 1 },
        { name: 'High', color: '#f97316', order: 2 },
        { name: 'Medium', color: '#eab308', order: 3 },
        { name: 'Low', color: '#3b82f6', order: 4 },
      ];

      await prisma.priority.createMany({
        data: defaultPriorities.map((dp) => ({
          ...dp,
          projectId,
        })),
      });

      [data, total] = await Promise.all([
        prisma.priority.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.priority.count({ where }),
      ]);
    }

    return createPaginatedResponse(data, total, page, limit);
  }

  async findById(id: string) {
    const priority = await prisma.priority.findUnique({
      where: { id },
    });

    if (!priority || priority.deletedAt) {
      throw new NotFoundException(`Priority with ID ${id} not found`);
    }

    return priority;
  }

  async update(id: string, updatePriorityDto: UpdatePriorityDto, userId: string, userRole?: string) {
    const priority = await this.findById(id);

    if (this.isDefaultPriority(priority)) {
      throw new ForbiddenException(
        'Default system priorities (Urgent, High, Medium, Low) cannot be updated',
      );
    }

    if (priority.createdBy && priority.createdBy !== userId && userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('You can only update custom priorities created by you');
    }

    if (updatePriorityDto.name) {
      const existing = await prisma.priority.findFirst({
        where: {
          projectId: priority.projectId,
          name: updatePriorityDto.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Priority with name ${updatePriorityDto.name} already exists in this project`,
        );
      }
    }

    return prisma.priority.update({
      where: { id },
      data: {
        ...updatePriorityDto,
        updatedBy: userId,
      },
    });
  }

  async remove(id: string, userId: string, userRole?: string) {
    const priority = await this.findById(id);

    if (this.isDefaultPriority(priority)) {
      throw new ForbiddenException(
        'Default system priorities (Urgent, High, Medium, Low) cannot be deleted',
      );
    }

    if (priority.createdBy && priority.createdBy !== userId && userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('You can only delete custom priorities created by you');
    }

    return prisma.priority.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
  }
}
