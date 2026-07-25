import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const generateTasksSchema = z.object({
  projectId: z.string().uuid(),
  listId: z.string().uuid(),
  prompt: z.string().min(10).max(1000),
  context: z.string().max(2000).optional(),
});

export class GenerateTasksDto extends createZodDto(generateTasksSchema) {}
