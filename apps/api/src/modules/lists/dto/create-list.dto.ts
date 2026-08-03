import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createListSchema = z.object({
  boardId: z.string().uuid(),
  name: z.string().min(1).max(100),
  order: z.number().optional(),
  color: z.string().max(7).optional(),
});

export class CreateListDto extends createZodDto(createListSchema) {}
