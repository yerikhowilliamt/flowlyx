import { Injectable } from '@nestjs/common';
import { prisma, Activity, Prisma } from '@flowlyx/database';

import { CreateActivityDto } from './dto/create-activity.dto';
import { FindActivitiesDto } from './dto/find-activities.dto';

@Injectable()
export class ActivitiesRepository {
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findByEntityId(entityId: string, query: FindActivitiesDto): Promise<[Activity[], number]> {
    const { page, limit, sortBy, sortOrder, action, userId, entityType } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ActivityWhereInput = { entityId, action, userId, entityType };

    const [data, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.activity.count({ where }),
    ]);

    return [data, total];
  }

  async findById(id: string): Promise<Activity | null> {
    return prisma.activity.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
