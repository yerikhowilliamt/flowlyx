import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  type: z.enum(['STRING', 'BOOLEAN', 'JSON', 'NUMBER']).optional().default('STRING'),
  group: z.string().optional().default('GENERAL'),
  description: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
});

export class CreateSettingDto extends createZodDto(createSettingSchema) {}
