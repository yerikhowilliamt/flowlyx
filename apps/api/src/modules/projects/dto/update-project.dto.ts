import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
});

export class UpdateProjectDto extends createZodDto(updateProjectSchema) {}
