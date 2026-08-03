import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateBoardSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.string().optional(),
});

export class UpdateBoardDto extends createZodDto(updateBoardSchema) {}
