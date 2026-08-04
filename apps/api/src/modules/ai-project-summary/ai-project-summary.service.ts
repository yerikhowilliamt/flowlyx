import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GenerateProjectSummaryDto } from './dto/generate-project-summary.dto';
import { prisma } from '@flowlyx/database';

@Injectable()
export class AiProjectSummaryService {
  private readonly logger = new Logger(AiProjectSummaryService.name);

  async generateSummary(dto: GenerateProjectSummaryDto, userId: string) {
    this.logger.log({
      message: 'Generating AI project summary',
      projectId: dto.projectId,
      focusArea: dto.focusArea,
      userId,
    });

    const project = await prisma.project.findUnique({
      where: { id: dto.projectId },
      include: { boards: { include: { lists: { include: { tasks: true } } } } },
    });

    if (!project) {
      this.logger.warn({ message: 'Project not found', projectId: dto.projectId, userId });
      throw new NotFoundException('Project not found');
    }

    const allTasks = project.boards.flatMap((b) => b.lists.flatMap((l) => l.tasks));
    const totalTasks = allTasks.length;
    const totalBoards = project.boards.length;
    const totalLists = project.boards.flatMap((b) => b.lists).length;

    const summary = this.buildSummary(
      project.name,
      totalTasks,
      totalBoards,
      totalLists,
      dto.focusArea ?? 'all',
    );

    const stats = dto.includeStats ? { totalTasks, totalBoards, totalLists } : undefined;

    await prisma.activity.create({
      data: {
        entityId: dto.projectId,
        entityType: 'PROJECT',
        userId,
        action: 'AI_PROJECT_SUMMARY_GENERATED',
        details: { focusArea: dto.focusArea, totalTasks, totalBoards, totalLists },
      },
    });

    this.logger.log({
      message: 'AI project summary generated successfully',
      projectId: dto.projectId,
      userId,
      totalTasks,
      totalBoards,
    });

    return { projectId: dto.projectId, summary, stats, generatedAt: new Date().toISOString() };
  }

  private buildSummary(
    projectName: string,
    totalTasks: number,
    totalBoards: number,
    totalLists: number,
    focusArea: string,
  ): string {
    const base = `Project "${projectName}" has ${totalBoards} board(s), ${totalLists} list(s), and ${totalTasks} task(s).`;

    if (focusArea === 'progress')
      return `${base} Progress is on track based on current task distribution.`;
    if (focusArea === 'risks') return `${base} No critical risks detected at this time.`;
    if (focusArea === 'blockers') return `${base} No blockers identified in current task state.`;

    return `${base} Overall project health looks stable. No critical blockers detected.`;
  }
}
