import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createSubtaskSchema = z.object({
  taskId: z.string().uuid(),
  title: z.string().min(1).max(200),
  order: z.number().optional(),
});

export class CreateSubtaskDto extends createZodDto(createSubtaskSchema) {}
