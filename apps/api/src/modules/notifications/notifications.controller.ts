import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '@flowlyx/database';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { FindNotificationsDto } from './dto/find-notifications.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuccessResponse } from '../../models/api.model';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { NotificationResponse } from '../../models/notification.model';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Serialize(NotificationResponse)
  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Notification created successfully' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Serialize(NotificationResponse)
  @Get()
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of notifications retrieved successfully',
  })
  findMyNotifications(@Req() req: Request & { user: User }, @Query() query: FindNotificationsDto) {
    return this.notificationsService.findByUserId(req.user.id, query);
  }

  @Serialize(NotificationResponse)
  @Get('unread-count')
  @ApiOperation({ summary: 'Get current user unread notifications count' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Unread count retrieved successfully' })
  getUnreadCount(@Req() req: Request & { user: User }) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Serialize(NotificationResponse)
  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all user notifications as read' })
  @ApiResponse({ status: HttpStatus.OK, description: 'All notifications marked as read' })
  markAllAsRead(@Req() req: Request & { user: User }) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Serialize(NotificationResponse)
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification marked as read' })
  markAsRead(@Param('id') id: string, @Req() req: Request & { user: User }) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Serialize(SuccessResponse)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification deleted successfully' })
  remove(@Param('id') id: string, @Req() req: Request & { user: User }) {
    return this.notificationsService.remove(id, req.user.id);
  }
}
