import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createLabelSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(50),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

export class CreateLabelDto extends createZodDto(createLabelSchema) {}
