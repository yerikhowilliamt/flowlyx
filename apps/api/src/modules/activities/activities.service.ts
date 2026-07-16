import { Injectable, NotFoundException } from '@nestjs/common';
import { Activity, prisma, Prisma } from '@flowlyx/database';
import { CreateActivityDto } from './dto/create-activity.dto';
import { FindActivitiesDto } from './dto/find-activities.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class ActivitiesService {
  async create(data: CreateActivityDto): Promise<Activity> {
    return prisma.activity.create({
      data: {
        entityId: data.entityId,
        entityType: data.entityType,
        userId: data.userId,
        action: data.action,
        details: data.details ? (data.details as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findByEntityId(entityId: string, query: FindActivitiesDto) {
    const { page, limit, sortBy, sortOrder, action, userId, entityType } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ActivityWhereInput = { entityId, action, userId, entityType };

    const [data, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.activity.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findById(id: string): Promise<Activity> {
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }
}
