import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification, prisma, Prisma } from '@flowlyx/database';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { FindNotificationsDto } from './dto/find-notifications.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class NotificationsService {
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

  async findByUserId(userId: string, query: FindNotificationsDto) {
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

    return createPaginatedResponse(data, total, page, limit);
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await prisma.notification.count({
      where: { userId, isRead: false, status: 'ACTIVE' },
    });
    return { count };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { updated: result.count };
  }

  async remove(id: string, userId: string): Promise<Notification> {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return prisma.notification.update({
      where: { id },
      data: { status: 'DELETED', deletedAt: new Date() },
    });
  }
}
