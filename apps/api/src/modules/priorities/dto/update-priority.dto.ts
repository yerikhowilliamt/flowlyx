import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updatePrioritySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  order: z.number().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export class UpdatePriorityDto extends createZodDto(updatePrioritySchema) {}
