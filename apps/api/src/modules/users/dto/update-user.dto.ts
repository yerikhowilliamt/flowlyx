import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.string().optional(),
  status: z.string().optional(),
});

export class UpdateUserDto extends createZodDto(updateUserSchema) {}
