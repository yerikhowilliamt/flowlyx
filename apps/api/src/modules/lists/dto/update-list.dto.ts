import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateListSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  order: z.number().optional(),
  color: z.string().max(7).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
});

export class UpdateListDto extends createZodDto(updateListSchema) {}
