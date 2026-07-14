import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import { NotFoundException } from '@nestjs/common';
import { NotificationType } from './dto/create-notification.dto';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      getUnreadCount: jest.fn(),
      update: jest.fn(),
      markAllAsRead: jest.fn(),
      findById: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NotificationsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const dto = {
        userId: 'uuid1',
        title: 'Test',
        content: 'Content',
        type: NotificationType.SYSTEM,
      };
      const result = { id: 'uuid2', ...dto };
      mockRepository.create.mockResolvedValue(result);

      expect(await service.create(dto)).toEqual(result);
    });
  });

  describe('findByUserId', () => {
    it('should return paginated notifications', async () => {
      const userId = 'uuid1';
      const query = { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' as const };
      const data = [{ id: 'uuid2', userId }];
      mockRepository.findByUserId.mockResolvedValue([data, 1]);

      const result = await service.findByUserId(userId, query);
      expect(result.data).toEqual(data);
      expect(result.meta.total).toEqual(1);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockRepository.getUnreadCount.mockResolvedValue(5);
      const result = await service.getUnreadCount('uuid1');
      expect(result).toEqual({ count: 5 });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const notification = { id: 'uuid1', userId: 'uuid2' };
      mockRepository.findById.mockResolvedValue(notification);
      mockRepository.update.mockResolvedValue({ ...notification, isRead: true });

      const result = await service.markAsRead('uuid1', 'uuid2');
      expect(result.isRead).toBe(true);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.markAsRead('uuid1', 'uuid2')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if userId mismatch', async () => {
      mockRepository.findById.mockResolvedValue({ id: 'uuid1', userId: 'other-user' });
      await expect(service.markAsRead('uuid1', 'uuid2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all as read', async () => {
      mockRepository.markAllAsRead.mockResolvedValue({ count: 3 });
      const result = await service.markAllAsRead('uuid1');
      expect(result).toEqual({ updated: 3 });
    });
  });

  describe('remove', () => {
    it('should soft delete notification', async () => {
      const notification = { id: 'uuid1', userId: 'uuid2' };
      mockRepository.findById.mockResolvedValue(notification);
      mockRepository.softDelete.mockResolvedValue({ ...notification, status: 'DELETED' });

      const result = await service.remove('uuid1', 'uuid2');
      expect(result.status).toBe('DELETED');
    });
  });
});
