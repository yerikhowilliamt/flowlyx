import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
