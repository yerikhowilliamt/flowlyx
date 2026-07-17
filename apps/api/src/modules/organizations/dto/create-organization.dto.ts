import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createOrganizationSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and dashes'),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
});

export class CreateOrganizationDto extends createZodDto(createOrganizationSchema) {}
