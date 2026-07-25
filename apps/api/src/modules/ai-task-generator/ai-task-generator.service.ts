import { Injectable, Logger } from '@nestjs/common';
import { GenerateTasksDto } from './dto/generate-tasks.dto';
import { prisma } from '@flowlyx/database';

@Injectable()
export class AiTaskGeneratorService {
  private readonly logger = new Logger(AiTaskGeneratorService.name);

  async generateTasks(dto: GenerateTasksDto, userId: string) {
    this.logger.log(`Generating tasks for list ${dto.listId} by user ${userId}`);

    // In a real implementation, this would call OpenAI/Anthropic API
    // For now, return a mock response that could be parsed and saved
    const mockGeneratedTasks = [
      {
        title: `AI Task 1 based on: ${dto.prompt.substring(0, 20)}...`,
        description: 'Generated task description',
      },
      {
        title: `AI Task 2 based on: ${dto.prompt.substring(0, 20)}...`,
        description: 'Another generated task description',
      },
    ];

    // Create the tasks in the database
    const createdTasks = await prisma.$transaction(
      mockGeneratedTasks.map((task, index) =>
        prisma.task.create({
          data: {
            title: task.title,
            description: task.description,
            listId: dto.listId,
            order: index,
            createdBy: userId,
            updatedBy: userId,
          },
        }),
      ),
    );

    // Log the activity
    await prisma.activity.create({
      data: {
        entityId: dto.listId,
        entityType: 'LIST',
        userId,
        action: 'AI_TASKS_GENERATED',
        details: { prompt: dto.prompt, count: createdTasks.length },
      },
    });

    return createdTasks;
  }
}
