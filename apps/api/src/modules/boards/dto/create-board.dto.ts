import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createBoardSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});

export class CreateBoardDto extends createZodDto(createBoardSchema) {}
