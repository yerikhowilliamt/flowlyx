import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationType } from './dto/create-notification.dto';
import { FindNotificationsDto } from './dto/find-notifications.dto';
import { Request } from 'express';
import { User } from '@flowlyx/database';

type RequestWithUser = Request & { user: User };

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let mockService: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      getUnreadCount: jest.fn(),
      markAllAsRead: jest.fn(),
      markAsRead: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', () => {
    const dto = { userId: '1', title: 'T', content: 'C', type: NotificationType.SYSTEM };
    controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should call findMyNotifications', () => {
    const req = { user: { id: 'u1' } } as unknown as RequestWithUser;
    const query = { page: 1, limit: 10 };
    controller.findMyNotifications(req, query as unknown as FindNotificationsDto);
    expect(mockService.findByUserId).toHaveBeenCalledWith('u1', query);
  });

  it('should call getUnreadCount', () => {
    const req = { user: { id: 'u1' } } as unknown as RequestWithUser;
    controller.getUnreadCount(req);
    expect(mockService.getUnreadCount).toHaveBeenCalledWith('u1');
  });

  it('should call markAllAsRead', () => {
    const req = { user: { id: 'u1' } } as unknown as RequestWithUser;
    controller.markAllAsRead(req);
    expect(mockService.markAllAsRead).toHaveBeenCalledWith('u1');
  });

  it('should call markAsRead', () => {
    const req = { user: { id: 'u1' } } as unknown as RequestWithUser;
    controller.markAsRead('n1', req);
    expect(mockService.markAsRead).toHaveBeenCalledWith('n1', 'u1');
  });

  it('should call remove', () => {
    const req = { user: { id: 'u1' } } as unknown as RequestWithUser;
    controller.remove('n1', req);
    expect(mockService.remove).toHaveBeenCalledWith('n1', 'u1');
  });
});
