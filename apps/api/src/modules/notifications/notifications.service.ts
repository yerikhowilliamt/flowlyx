import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification } from '@flowlyx/database';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { FindNotificationsDto } from './dto/find-notifications.dto';
import { NotificationsRepository } from './notifications.repository';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.notificationsRepository.create(createNotificationDto);
  }

  async findByUserId(userId: string, query: FindNotificationsDto) {
    const [data, total] = await this.notificationsRepository.findByUserId(userId, query);
    return createPaginatedResponse(data, total, query.page, query.limit);
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    return { count: await this.notificationsRepository.getUnreadCount(userId) };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findById(id);
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return this.notificationsRepository.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string) {
    const result = await this.notificationsRepository.markAllAsRead(userId);
    return { updated: result.count };
  }

  async remove(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findById(id);
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return this.notificationsRepository.softDelete(id);
  }
}
