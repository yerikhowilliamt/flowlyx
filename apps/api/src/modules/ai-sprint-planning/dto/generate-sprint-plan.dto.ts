import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const generateSprintPlanSchema = z.object({
  projectId: z.string().uuid(),
  sprintDurationDays: z.number().int().min(1).max(90).optional().default(14),
  maxTasksPerSprint: z.number().int().min(1).max(100).optional().default(10),
  focusArea: z.enum(['velocity', 'blockers', 'priorities', 'all']).optional().default('all'),
});

export class GenerateSprintPlanDto extends createZodDto(generateSprintPlanSchema) {}
