import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateTaskSchema = z.object({
  listId: z.string().uuid().optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  order: z.number().optional(),
  priorityId: z.string().uuid().nullable().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  startDate: z.string().datetime().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  reminderAt: z.string().datetime().nullable().optional(),
});

export class UpdateTaskDto extends createZodDto(updateTaskSchema) {}
