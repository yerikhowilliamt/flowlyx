import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export class UpdateWorkspaceDto extends createZodDto(updateWorkspaceSchema) {}
