import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { prisma, Workspace, Prisma } from '@flowlyx/database';
import { PaginationDto } from '../../core/pagination';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class WorkspacesService {
  async create(createWorkspaceDto: CreateWorkspaceDto): Promise<Workspace> {
    const existing = await prisma.workspace.findUnique({
      where: { slug: createWorkspaceDto.slug },
    });
    if (existing) {
      throw new ConflictException(
        'A workspace with this slug already exists. Please choose another one.',
      );
    }
    return prisma.workspace.create({ data: createWorkspaceDto });
  }

  async findAllByOrganizationId(organizationId: string, query: PaginationDto) {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.WorkspaceWhereInput = { organizationId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.workspace.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.workspace.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findById(id: string): Promise<Workspace> {
    const workspace = await prisma.workspace.findUnique({ where: { id } });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }

  async findBySlug(slug: string): Promise<Workspace> {
    const workspace = await prisma.workspace.findUnique({ where: { slug } });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }

  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto): Promise<Workspace> {
    await this.findById(id);
    return prisma.workspace.update({ where: { id }, data: updateWorkspaceDto });
  }

  async remove(id: string): Promise<boolean> {
    await this.findById(id);
    await prisma.workspace.delete({ where: { id } });
    return true;
  }

  async getTaskActivity(workspaceId: string, range: '7d' | '30d' | '1y' = '7d') {
    const startDate = new Date();
    if (range === '1y') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (range === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate.setDate(startDate.getDate() - 6);
    }
    startDate.setHours(0, 0, 0, 0);

    const tasks = await prisma.task.findMany({
      where: {
        list: {
          board: {
            project: {
              workspaceId,
            },
          },
        },
        updatedAt: { gte: startDate },
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    if (range === '1y') {
      const monthsMap = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const counts: Record<string, number> = {};
      const now = new Date();
      const resultLabels: string[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${monthsMap[d.getMonth()]}`;
        counts[key] = 0;
        resultLabels.push(key);
      }
      tasks.forEach((t) => {
        const d = new Date(t.updatedAt);
        const key = `${monthsMap[d.getMonth()]}`;
        if (counts[key] !== undefined) {
          counts[key]++;
        }
      });
      return resultLabels.map((day) => ({ day, tasks: counts[day] || 0 }));
    }

    if (range === '30d') {
      const now = new Date();
      const result: { day: string; tasks: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(now.getDate() - (i * 5 + 4));
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setDate(now.getDate() - i * 5);
        end.setHours(23, 59, 59, 999);

        const label = `${start.getDate()}/${start.getMonth() + 1}`;
        const count = tasks.filter((t) => {
          const d = new Date(t.updatedAt);
          return d >= start && d <= end;
        }).length;
        result.push({ day: label, tasks: count });
      }
      return result;
    }

    // Default 7d
    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const result: { day: string; tasks: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayLabel = daysMap[d.getDay()];

      const start = new Date(d);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);

      const count = tasks.filter((t) => {
        const taskDate = new Date(t.updatedAt);
        return taskDate >= start && taskDate <= end;
      }).length;

      result.push({ day: dayLabel, tasks: count });
    }
    return result;
  }

  async getWorkspaceMembers(workspaceId: string) {
    const workspace = await this.findById(workspaceId);

    // 1. Check workspace members
    const wsMembers = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
    });

    if (wsMembers.length > 0) {
      return wsMembers.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role || m.user.role,
        avatarUrl: m.user.avatarUrl,
      }));
    }

    // 2. Check organization members
    const orgMembers = await prisma.organizationMember.findMany({
      where: { organizationId: workspace.organizationId },
      include: { user: true },
    });

    if (orgMembers.length > 0) {
      return orgMembers.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role || m.user.role,
        avatarUrl: m.user.avatarUrl,
      }));
    }

    // 3. Fallback: Return distinct users in task assignments for this workspace
    const assignments = await prisma.taskAssignment.findMany({
      where: {
        task: {
          list: {
            board: {
              project: {
                workspaceId,
              },
            },
          },
        },
      },
      include: { user: true },
    });

    const uniqueUsersMap = new Map<
      string,
      { id: string; name: string; email: string; role: string; avatarUrl: string | null }
    >();
    assignments.forEach((a) => {
      if (a.user) {
        uniqueUsersMap.set(a.user.id, {
          id: a.user.id,
          name: a.user.name,
          email: a.user.email,
          role: a.user.role,
          avatarUrl: a.user.avatarUrl,
        });
      }
    });

    if (uniqueUsersMap.size > 0) {
      return Array.from(uniqueUsersMap.values());
    }

    // Fallback: Limit to 2 default users (Admin + User)
    const users = await prisma.user.findMany({
      take: 2,
      orderBy: { createdAt: 'asc' },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatarUrl: u.avatarUrl,
    }));
  }

  async getWorkspaceStats(workspaceId: string) {
    const [totalProjects, totalTasks, tasksDone] = await Promise.all([
      prisma.project.count({
        where: { workspaceId, deletedAt: null },
      }),
      prisma.task.count({
        where: {
          list: {
            board: {
              project: {
                workspaceId,
                deletedAt: null,
              },
            },
          },
          deletedAt: null,
        },
      }),
      prisma.task.count({
        where: {
          list: {
            name: { in: ['Completed', 'Done', 'completed', 'done'] },
            board: {
              project: {
                workspaceId,
                deletedAt: null,
              },
            },
          },
          deletedAt: null,
        },
      }),
    ]);

    const members = await this.getWorkspaceMembers(workspaceId);
    const teamMembers = members.length;

    const activitySpeed = tasksDone > 10 ? 'High' : tasksDone > 0 ? 'Optimal' : 'Stable';

    return {
      totalProjects,
      totalTasks,
      tasksDone,
      teamMembers,
      activitySpeed,
    };
  }
}
