import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { prisma, Task, Prisma, User } from '@flowlyx/database';
import { PaginationDto } from '../../core/pagination';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { Role } from '../rbac/enums/role.enum';

const taskAssignmentInclude = {
  taskAssignments: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  },
};

@Injectable()
export class TasksService {
  private isAdmin(user: User): boolean {
    return user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
  }

  async create(createTaskDto: CreateTaskDto, currentUser?: User): Promise<Task> {
    if (currentUser && !this.isAdmin(currentUser)) {
      throw new ForbiddenException('Only administrators can create tasks');
    }

    const { assigneeId, ...taskData } = createTaskDto;

    const list = await prisma.list.findUnique({ where: { id: taskData.listId } });
    if (!list) {
      throw new NotFoundException('List not found');
    }

    const task = await prisma.task.create({
      data: taskData,
    });

    if (assigneeId) {
      const targetUser = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (targetUser) {
        await prisma.taskAssignment.create({
          data: {
            taskId: task.id,
            userId: assigneeId,
            createdBy: currentUser?.id,
          },
        });
      }
    }

    return this.findById(task.id);
  }

  async findAllByListId(listId: string, query: PaginationDto) {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = { listId };
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: taskAssignmentInclude,
      }),
      prisma.task.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findById(id: string): Promise<Task> {
    const task = await prisma.task.findUnique({
      where: { id },
      include: taskAssignmentInclude,
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, currentUser?: User): Promise<Task> {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { 
        taskAssignments: true,
        list: {
          include: {
            board: {
              include: {
                project: {
                  include: {
                    members: {
                      where: { userId: currentUser?.id }
                    },
                    workspace: {
                      include: {
                        organization: {
                          include: {
                            members: {
                              where: { userId: currentUser?.id }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (currentUser && updateTaskDto.status !== undefined) {
      const isSuperAdmin = currentUser.role === Role.SUPER_ADMIN;
      
      let hasAccess = isSuperAdmin;
      
      if (!isSuperAdmin) {
        // Cast to any since prisma return type inference fails for deep includes sometimes
        const taskData = task as Prisma.TaskGetPayload<{
          include: { list: { include: { board: { include: { project: { include: { members: true; workspace: { include: { organization: { include: { members: true } } } } } } } } } }; taskAssignments: true;
        }>;
        const isProjectMember = taskData.list?.board?.project?.members?.length > 0;
        const orgMember = taskData.list?.board?.project?.workspace?.organization?.members?.[0];
        const isOrgAdmin = orgMember && ['OWNER', 'ADMIN'].includes(orgMember.role);
        
        hasAccess = isProjectMember || isOrgAdmin;
      }

      if (!hasAccess) {
        throw new ForbiddenException('You do not have permission to change the task status');
      }
    }

    if (currentUser) {
      const isAdmin = this.isAdmin(currentUser);
      const isAssigned = (task as { taskAssignments: { userId: string }[] }).taskAssignments?.some((a) => a.userId === currentUser.id);

      if (!isAdmin && !isAssigned) {
        throw new ForbiddenException('Only administrators and assigned users can update or move this task');
      }
    }

    return prisma.task.update({
      where: { id },
      data: updateTaskDto,
      include: taskAssignmentInclude,
    });
  }

  async remove(id: string, currentUser?: User): Promise<boolean> {
    if (currentUser && !this.isAdmin(currentUser)) {
      throw new ForbiddenException('Only administrators can delete tasks');
    }
    await this.findById(id);
    await prisma.task.delete({ where: { id } });
    return true;
  }
}
