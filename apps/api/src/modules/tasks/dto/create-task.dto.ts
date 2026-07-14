import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createTaskSchema = z.object({
  listId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  order: z.number().optional(),
  priorityId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
});

export class CreateTaskDto extends createZodDto(createTaskSchema) {}
