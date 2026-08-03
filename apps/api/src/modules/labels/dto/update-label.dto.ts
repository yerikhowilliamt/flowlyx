import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateLabelSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
});

export class UpdateLabelDto extends createZodDto(updateLabelSchema) {}
