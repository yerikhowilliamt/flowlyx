import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateSubtaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  isCompleted: z.boolean().optional(),
  order: z.number().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
});

export class UpdateSubtaskDto extends createZodDto(updateSubtaskSchema) {}
