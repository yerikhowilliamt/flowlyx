import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createWorkspaceSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and dashes'),
  description: z.string().max(500).optional(),
});

export class CreateWorkspaceDto extends createZodDto(createWorkspaceSchema) {}
