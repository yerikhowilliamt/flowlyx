import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { prisma } from '@flowlyx/database';
import { ProjectReportQueryDto } from './dto/project-report-query.dto';

export interface TaskOverviewReport {
  projectId: string;
  totalTasks: number;
  activeTasks: number;
  deletedTasks: number;
  overdueTasks: number;
  completionRate: number;
  generatedAt: string;
}

export interface MemberTimeReport {
  userId: string;
  userName: string;
  totalSeconds: number;
  totalHours: number;
  entryCount: number;
}

export interface TimeTrackingReport {
  projectId: string;
  totalSeconds: number;
  totalHours: number;
  byMember: MemberTimeReport[];
  generatedAt: string;
}

export interface MemberActivityReport {
  userId: string;
  userName: string;
  taskCount: number;
  activityCount: number;
}

export interface MemberActivitySummary {
  projectId: string;
  members: MemberActivityReport[];
  generatedAt: string;
}

export interface WorkspaceSummaryReport {
  workspaceId: string;
  totalProjects: number;
  totalTasks: number;
  totalMembers: number;
  totalTimeSeconds: number;
  totalTimeHours: number;
  generatedAt: string;
}

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  private buildDateFilter(query: ProjectReportQueryDto) {
    if (!query.startDate && !query.endDate) return undefined;
    return {
      gte: query.startDate ? new Date(query.startDate) : undefined,
      lte: query.endDate ? new Date(query.endDate) : undefined,
    };
  }

  async getProjectOverview(
    projectId: string,
    userId: string,
    query: ProjectReportQueryDto,
  ): Promise<TaskOverviewReport> {
    this.logger.log({ message: 'Fetching project overview report', projectId, userId });

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      this.logger.warn({ message: 'Project not found', projectId, userId });
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const createdAtFilter = this.buildDateFilter(query);

    const tasks = await prisma.task.findMany({
      where: {
        list: { board: { projectId } },
        ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
      },
      select: { status: true, dueDate: true },
    });

    const now = new Date();
    const totalTasks = tasks.length;
    const activeTasks = tasks.filter((t) => t.status === 'ACTIVE').length;
    const deletedTasks = tasks.filter((t) => t.status === 'DELETED').length;
    const overdueTasks = tasks.filter(
      (t) => t.status === 'ACTIVE' && t.dueDate && t.dueDate < now,
    ).length;
    const completionRate =
      totalTasks > 0 ? Math.round(((totalTasks - activeTasks) / totalTasks) * 100) : 0;

    this.logger.log({
      message: 'Project overview report generated',
      projectId,
      userId,
      totalTasks,
    });

    return {
      projectId,
      totalTasks,
      activeTasks,
      deletedTasks,
      overdueTasks,
      completionRate,
      generatedAt: new Date().toISOString(),
    };
  }

  async getTimeTrackingReport(
    projectId: string,
    userId: string,
    query: ProjectReportQueryDto,
  ): Promise<TimeTrackingReport> {
    this.logger.log({ message: 'Fetching time tracking report', projectId, userId });

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      this.logger.warn({ message: 'Project not found', projectId, userId });
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const createdAtFilter = this.buildDateFilter(query);

    const entries = await prisma.timeEntry.findMany({
      where: {
        status: 'ACTIVE',
        task: { list: { board: { projectId } } },
        ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
      },
      select: {
        duration: true,
        userId: true,
        user: { select: { id: true, name: true } },
      },
    });

    const byMemberMap = new Map<string, MemberTimeReport>();
    for (const entry of entries) {
      const seconds = entry.duration ?? 0;
      const existing = byMemberMap.get(entry.userId);
      if (existing) {
        existing.totalSeconds += seconds;
        existing.totalHours = Math.round((existing.totalSeconds / 3600) * 100) / 100;
        existing.entryCount += 1;
      } else {
        byMemberMap.set(entry.userId, {
          userId: entry.user.id,
          userName: entry.user.name,
          totalSeconds: seconds,
          totalHours: Math.round((seconds / 3600) * 100) / 100,
          entryCount: 1,
        });
      }
    }

    const byMember = Array.from(byMemberMap.values());
    const totalSeconds = byMember.reduce((sum, m) => sum + m.totalSeconds, 0);

    this.logger.log({ message: 'Time tracking report generated', projectId, userId, totalSeconds });

    return {
      projectId,
      totalSeconds,
      totalHours: Math.round((totalSeconds / 3600) * 100) / 100,
      byMember,
      generatedAt: new Date().toISOString(),
    };
  }

  async getMemberActivityReport(
    projectId: string,
    userId: string,
    query: ProjectReportQueryDto,
  ): Promise<MemberActivitySummary> {
    this.logger.log({ message: 'Fetching member activity report', projectId, userId });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        members: { select: { userId: true, user: { select: { id: true, name: true } } } },
      },
    });
    if (!project) {
      this.logger.warn({ message: 'Project not found', projectId, userId });
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const createdAtFilter = this.buildDateFilter(query);

    const [assignments, activities] = await Promise.all([
      prisma.taskAssignment.findMany({
        where: {
          task: { list: { board: { projectId } } },
          ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
        },
        select: { userId: true },
      }),
      prisma.activity.findMany({
        where: {
          entityId: projectId,
          entityType: 'PROJECT',
          status: 'ACTIVE',
          ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
        },
        select: { userId: true },
      }),
    ]);

    const taskCountMap = new Map<string, number>();
    for (const a of assignments) {
      taskCountMap.set(a.userId, (taskCountMap.get(a.userId) ?? 0) + 1);
    }

    const activityCountMap = new Map<string, number>();
    for (const a of activities) {
      activityCountMap.set(a.userId, (activityCountMap.get(a.userId) ?? 0) + 1);
    }

    const members: MemberActivityReport[] = project.members.map((m) => ({
      userId: m.user.id,
      userName: m.user.name,
      taskCount: taskCountMap.get(m.userId) ?? 0,
      activityCount: activityCountMap.get(m.userId) ?? 0,
    }));

    this.logger.log({
      message: 'Member activity report generated',
      projectId,
      userId,
      memberCount: members.length,
    });

    return { projectId, members, generatedAt: new Date().toISOString() };
  }

  async getWorkspaceSummary(workspaceId: string, userId: string): Promise<WorkspaceSummaryReport> {
    this.logger.log({ message: 'Fetching workspace summary report', workspaceId, userId });

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
      this.logger.warn({ message: 'Workspace not found', workspaceId, userId });
      throw new NotFoundException(`Workspace ${workspaceId} not found`);
    }

    const [projects, members, tasks, timeEntries] = await Promise.all([
      prisma.project.findMany({ where: { workspaceId, status: 'ACTIVE' }, select: { id: true } }),
      prisma.workspaceMember.findMany({
        where: { workspaceId, status: 'ACTIVE' },
        select: { id: true },
      }),
      prisma.task.findMany({
        where: { list: { board: { project: { workspaceId } } } },
        select: { id: true },
      }),
      prisma.timeEntry.findMany({
        where: { status: 'ACTIVE', task: { list: { board: { project: { workspaceId } } } } },
        select: { duration: true },
      }),
    ]);

    const totalTimeSeconds = timeEntries.reduce((sum, e) => sum + (e.duration ?? 0), 0);

    this.logger.log({ message: 'Workspace summary report generated', workspaceId, userId });

    return {
      workspaceId,
      totalProjects: projects.length,
      totalTasks: tasks.length,
      totalMembers: members.length,
      totalTimeSeconds,
      totalTimeHours: Math.round((totalTimeSeconds / 3600) * 100) / 100,
      generatedAt: new Date().toISOString(),
    };
  }
}
