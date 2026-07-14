import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  order: z.number().optional(),
  priorityId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  reminderAt: z.string().datetime().optional(),
});

export class UpdateTaskDto extends createZodDto(updateTaskSchema) {}
