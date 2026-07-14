import { Injectable } from '@nestjs/common';
import { prisma, Notification, Prisma } from '@flowlyx/database';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { FindNotificationsDto } from './dto/find-notifications.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsRepository {
  async create(data: CreateNotificationDto): Promise<Notification> {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
      },
    });
  }

  async findByUserId(
    userId: string,
    query: FindNotificationsDto,
  ): Promise<[Notification[], number]> {
    const { page, limit, sortBy, sortOrder, isRead } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = { userId, isRead };

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.notification.count({ where }),
    ]);

    return [data, total];
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false, status: 'ACTIVE' },
    });
  }

  async update(id: string, data: UpdateNotificationDto): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data,
    });
  }

  async markAllAsRead(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  async softDelete(id: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: { status: 'DELETED', deletedAt: new Date() },
    });
  }
}
