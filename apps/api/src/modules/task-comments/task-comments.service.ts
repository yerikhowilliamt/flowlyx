import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { UpdateTaskCommentDto } from './dto/update-task-comment.dto';
import { prisma, TaskComment } from '@flowlyx/database';
import { PaginationDto } from '../../core/pagination';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';

@Injectable()
export class TaskCommentsService {
  constructor(private readonly notificationsService: NotificationsService) {}
  private async verifyAccess(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        list: {
          include: {
            board: {
              include: { project: true },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const projectId = task.list.board.projectId;
    const workspaceId = task.list.board.project.workspaceId;

    // Check project member
    const projectMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (projectMember) return task;

    // Check workspace member
    const workspaceMember = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (workspaceMember) return task;

    throw new ForbiddenException('User is not a member of the project or workspace');
  }

  async create(userId: string, createDto: CreateTaskCommentDto): Promise<TaskComment> {
    await this.verifyAccess(createDto.taskId, userId);

    const { taskId, parentId, content, mentions } = createDto;

    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId,
        parentId,
        content,
        createdBy: userId,
        ...(mentions &&
          mentions.length > 0 && {
            mentions: {
              create: mentions.map((mentionedUserId) => ({
                userId: mentionedUserId,
              })),
            },
          }),
      },
    });

    if (mentions?.length) {
      // Dispatch notifications
      await Promise.all(
        mentions
          .filter((mentionedUserId) => mentionedUserId !== userId) // Avoid sending notification to oneself
          .map((mentionedUserId) =>
            this.notificationsService.create({
              userId: mentionedUserId,
              title: 'You were mentioned in a task comment',
              content: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
              type: NotificationType.COMMENT_MENTION,
              referenceId: comment.id,
              referenceType: 'COMMENT',
            }),
          ),
      );
    }

    return comment;
  }

  async findAllByTaskId(taskId: string, userId: string, query: PaginationDto) {
    await this.verifyAccess(taskId, userId);

    const { page, limit, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where = { taskId };

    const [data, total] = await Promise.all([
      prisma.taskComment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.taskComment.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async update(id: string, userId: string, updateDto: UpdateTaskCommentDto): Promise<TaskComment> {
    const comment = await prisma.taskComment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');

    // Only the author can update their comment for now
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    return prisma.taskComment.update({
      where: { id },
      data: {
        content: updateDto.content,
        updatedBy: userId,
      },
    });
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const comment = await prisma.taskComment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await prisma.taskComment.delete({ where: { id } });
    return true;
  }
}
