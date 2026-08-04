import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GenerateSprintPlanDto } from './dto/generate-sprint-plan.dto';
import { prisma } from '@flowlyx/database';

export interface SprintTask {
  id: string;
  title: string;
  order: number;
}

export interface SprintPlanResult {
  projectId: string;
  sprintGoal: string;
  recommendedTasks: SprintTask[];
  estimatedEffort: number;
  riskFlags: string[];
  focusArea: string;
  sprintDurationDays: number;
  generatedAt: string;
}

@Injectable()
export class AiSprintPlanningService {
  private readonly logger = new Logger(AiSprintPlanningService.name);

  async generateSprintPlan(dto: GenerateSprintPlanDto, userId: string): Promise<SprintPlanResult> {
    this.logger.log({
      message: 'Generating AI sprint plan',
      projectId: dto.projectId,
      focusArea: dto.focusArea,
      userId,
    });

    const project = await prisma.project.findUnique({
      where: { id: dto.projectId },
      include: {
        boards: {
          include: {
            lists: {
              include: {
                tasks: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      this.logger.warn({ message: 'Project not found', projectId: dto.projectId, userId });
      throw new NotFoundException('Project not found');
    }

    const allTasks = project.boards.flatMap((b) => b.lists.flatMap((l) => l.tasks));

    const recommendedTasks: SprintTask[] = allTasks.slice(0, dto.maxTasksPerSprint).map((t) => ({
      id: t.id,
      title: t.title,
      order: t.order,
    }));

    const riskFlags = this.buildRiskFlags(allTasks.length, dto.maxTasksPerSprint, dto.focusArea);
    const sprintGoal = this.buildSprintGoal(project.name, recommendedTasks.length, dto.focusArea);

    await prisma.activity.create({
      data: {
        entityId: dto.projectId,
        entityType: 'PROJECT',
        userId,
        action: 'AI_SPRINT_PLAN_GENERATED',
        details: {
          focusArea: dto.focusArea,
          taskCount: recommendedTasks.length,
          sprintDurationDays: dto.sprintDurationDays,
        },
      },
    });

    this.logger.log({
      message: 'AI sprint plan generated successfully',
      projectId: dto.projectId,
      userId,
      taskCount: recommendedTasks.length,
    });

    return {
      projectId: dto.projectId,
      sprintGoal,
      recommendedTasks,
      estimatedEffort: recommendedTasks.length,
      riskFlags,
      focusArea: dto.focusArea,
      sprintDurationDays: dto.sprintDurationDays,
      generatedAt: new Date().toISOString(),
    };
  }

  private buildSprintGoal(projectName: string, taskCount: number, focusArea: string): string {
    const base = `Complete ${taskCount} task(s) in project "${projectName}"`;

    if (focusArea === 'velocity') return `${base} to maximize team velocity.`;
    if (focusArea === 'blockers') return `${base} with focus on resolving blockers first.`;
    if (focusArea === 'priorities') return `${base} prioritized by highest business value.`;
    return `${base} to maintain steady progress across all areas.`;
  }

  private buildRiskFlags(totalTasks: number, maxTasks: number, focusArea: string): string[] {
    const flags: string[] = [];

    if (totalTasks === 0) flags.push('No tasks available in this project.');
    if (totalTasks > maxTasks)
      flags.push(`${totalTasks - maxTasks} task(s) were excluded due to sprint capacity limit.`);
    if (focusArea === 'blockers' && totalTasks > 0)
      flags.push('Review blocked tasks before committing to sprint.');

    return flags;
  }
}
